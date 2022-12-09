import {
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import {
  Args,
  Int,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import {
  Prisma,
  Channel as PrismaChannel,
  User as PrismaUser,
} from "@prisma/client";
import { GqlAuthenticatedGuard } from "../auth/authenticated.guard";
import { CurrentUser } from "../auth/currentUser.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { userType } from "../user/user.model";
import { SocketService } from "../socket/socket.service";
import {
  Channel,
  ChannelMessage,
  channelMessageType,
  channelType,
  restrictedMemberType,
} from "./channel.model";
import { Role, RoleGuard, RolesGuard } from "./channel.roles";
import { ExistingChannelGuard, OwnerGuard } from "./channel.guards";
import { InvalidCacheTarget } from "@apps/shared";
import { Loader } from "../dataloader";
import { ChannelLoader } from "./channel.loaders";
import DataLoader from "dataloader";
import { ChannelService } from "./channel.service";
@Resolver(Channel)
@UseGuards(RolesGuard)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelResolver {
  constructor(
    private socketService: SocketService,
    private channelService: ChannelService
  ) {}

  @Query((returns) => Channel)
  async channel(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Args("id", { type: () => Int }) id: number
  ): Promise<channelType> {
    return this.channelService.getChannelById(channelLoader, id);
  }

  @Query((returns) => [Channel])
  async channels(
    @Args("name", {
      type: () => String,
      nullable: true,
      defaultValue: undefined,
    })
    name?: string | null,
    @Args("ownerId", {
      type: () => Int,
      nullable: true,
      defaultValue: undefined,
    })
    ownerId?: number | null,
    @Args("adminId", {
      type: () => Int,
      nullable: true,
      defaultValue: undefined,
    })
    adminId?: number | null,
    @Args("memberId", {
      type: () => Int,
      nullable: true,
      defaultValue: undefined,
    })
    memberId?: number | null
  ): Promise<channelType[]> {
    const where: Prisma.ChannelWhereInput = {
      name: {
        mode: "insensitive",
        contains: name !== null ? name : undefined,
      },
      ownerId: ownerId !== null ? ownerId : undefined,
    };
    if (adminId !== null && typeof adminId !== "undefined")
      where.members = {
        some: {
          AND: {
            userId: adminId,
            isAdministrator: true,
          },
        },
      };
    if (memberId !== null && typeof memberId !== "undefined")
      where.members = {
        some: { userId: memberId },
      };
    const channels = await this.prisma.channel.findMany({
      select: { id: true, name: true, inviteOnly: true, password: true },
      where,
    });
    return channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      private: channel.inviteOnly,
      passwordProtected: !!channel.password,
    }));
  }

  @ResolveField()
  async owner(
    @Root() channel: Channel,
    @Loader()
    ownerLoader: DataLoader<PrismaChannel["id"], PrismaUser>
  ): Promise<userType> {
    return this.channelService.getOwner(ownerLoader, channel.id);
  }

  @ResolveField()
  async admins(
    @Root() channel: Channel,
    @Loader()
    adminLoader: DataLoader<PrismaUser["id"], PrismaUser[]>
  ): Promise<userType[]> {
    return this.channelService.getAdmins(adminLoader, channel.id);
  }

  @ResolveField()
  async members(
    @Root() channel: Channel,
    @Loader()
    membersLoader: DataLoader<PrismaChannel["id"], PrismaUser[]>
  ): Promise<userType[]> {
    return this.channelService.getMembers(membersLoader, channel.id);
  }

  @ResolveField()
  async muted(@Root() channel: Channel): Promise<restrictedMemberType[]> {
    const members = await this.prisma.mutedMember.findMany({
      select: { user: true, endAt: true },
      where: {
        channelId: channel.id,
      },
    });
    return members
      ? members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          avatar: member.user.avatar,
          rank: member.user.rank,
          endAt: member.endAt,
        }))
      : [];
  }

  @ResolveField()
  async banned(@Root() channel: Channel): Promise<restrictedMemberType[]> {
    const members = await this.prisma.bannedMember.findMany({
      select: { user: true, endAt: true },
      where: {
        channelId: channel.id,
      },
    });
    return members
      ? members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          avatar: member.user.avatar,
          rank: member.user.rank,
          endAt: member.endAt,
        }))
      : [];
  }

  @ResolveField()
  async messages(
    @Root() channel: Channel,
    @CurrentUser() currentUserId: number
  ): Promise<channelMessageType[]> {
    const c = await this.prisma.channel.findFirst({
      select: {
        members: { select: { userId: true } },
        ownerId: true,
        channelMessages: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            content: true,
            sentAt: true,
            author: {
              select: {
                id: true,
                blockedBy: {
                  select: { id: true },
                  where: { id: currentUserId },
                },
              },
            },
          },
        },
      },
      where: {
        id: channel.id,
        OR: [
          { ownerId: currentUserId },
          { members: { some: { userId: currentUserId } } },
        ],
      },
    });

    if (!c) {
      throw new ForbiddenException("You are not a member of this channel");
    }

    await this.prisma.channelMessageRead.createMany({
      data: c.channelMessages.map((message) => ({
        messageId: message.id,
        userId: currentUserId,
      })),
      skipDuplicates: true,
    });

    return c
      ? c.channelMessages.map((message) => ({
          id: message.id,
          content:
            message.author.id === currentUserId
              ? message.content
              : message.author.blockedBy.length > 0
              ? null
              : message.content,
          sentAt: message.sentAt,
        }))
      : [];
  }

  @UseGuards(ExistingChannelGuard)
  @Mutation((returns) => Boolean)
  async joinChannel(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("password", { type: () => String, nullable: true })
    password: string | null,
    @CurrentUser() currentUserId: number
  ) {
    this.channelService.joinChannel(channelId, password, currentUserId);
    this.channelService.emitChannelChacheInvalidation(
      channelId,
      InvalidCacheTarget.JOIN_CHANNEL,
      null
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Member)
  @Mutation((returns) => Boolean)
  async leaveChannel(
    @Args("channelId", { type: () => Int }) channelId: number,
    @CurrentUser() currentUserId: number
  ) {
    this.channelService.leaveChannel(channelId, currentUserId);
    this.channelService.emitChannelChacheInvalidation(
      channelId,
      InvalidCacheTarget.LEAVE_CHANNEL,
      null
    );

    return true;
  }

  @Mutation((returns) => Boolean)
  async createChannel(
    @Args("inviteOnly", { type: () => Boolean }) inviteOnly: boolean,
    @Args("password", { type: () => String, nullable: true })
    password: string | null,
    @Args("name", { type: () => String }) name: string,
    @CurrentUser() currentUserId: number
  ) {
    const hash = password ? bcrypt.hashSync(password, 10) : null;
    this.channelService.createChannel(inviteOnly, name, hash, currentUserId);
    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.CREATE_CHANNEL,
      [currentUserId],
      currentUserId
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async deleteChannel(
    @Args("channelId", { type: () => Int }) channelId: number
  ) {
    const members = await this.channelService.getMembersFromChannelId(
      channelId
    );
    this.channelService.deleteChannel(channelId);

    this.channelService.emitChannelChacheInvalidation(
      channelId,
      InvalidCacheTarget.DELETE_CHANNEL,
      members
    );
    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async muteUser(
    @Args("userId", { type: () => Int }) userId: number,
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("muteUntil", { type: () => Date, nullable: true })
    muteUntil: Date | null
  ) {
    this.channelService.muteUser(channelId, userId, muteUntil);
    this.channelService.emitChannelChacheInvalidation(
      channelId,
      InvalidCacheTarget.UNMUTE_USER,
      null
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async banUser(
    @Args("userId", { type: () => Int }) userId: number,
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("banUntil", { type: () => Date, nullable: true })
    banUntil: Date | null
  ) {
    this.channelService.banUser(channelId, userId, banUntil);
    this.channelService.emitChannelChacheInvalidation(
      channelId,
      InvalidCacheTarget.BAN_USER,
      null
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async unmuteUser(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    this.channelService.unmuteUser(channelId, userId);
    this.channelService.emitChannelChacheInvalidation(
      channelId,
      InvalidCacheTarget.UNMUTE_USER,
      null
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async unbanUser(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    this.channelService.unbanUser(channelId, userId);
    this.channelService.emitChannelChacheInvalidation(
      channelId,
      InvalidCacheTarget.UNBAN_USER,
      null
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async updatePassword(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("password", { type: () => String, nullable: true })
    password: string | null,
    @CurrentUser() currentUserId: number
  ) {
    const hash = password ? bcrypt.hashSync(password, 10) : null;

    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.UPDATE_PASSWORD,
      [currentUserId],
      channelId
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async inviteUser(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    this.channelService.inviteUser(channelId, userId);
    this.channelService.emitChannelChacheInvalidation(
      channelId,
      InvalidCacheTarget.INVITE_USER,
      null
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async addAdmin(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    this.channelService.addAdmin(channelId, userId);
    this.channelService.emitChannelChacheInvalidation(
      channelId,
      InvalidCacheTarget.ADD_ADMIN,
      null
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async removeAdmin(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    this.channelService.removeAdmin(channelId, userId);
    this.channelService.emitChannelChacheInvalidation(
      channelId,
      InvalidCacheTarget.REMOVE_ADMIN,
      null
    );

    return true;
  }
}

@Resolver(ChannelMessage)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelMessageResolver {
  constructor(
    private prisma: PrismaService,
    private socketservice: SocketService
  ) {}

  @ResolveField()
  async author(@Root() channelMessage: ChannelMessage): Promise<userType> {
    const message = await this.prisma.channelMessage.findUnique({
      select: { author: true },
      where: {
        id: channelMessage.id,
      },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    return {
      id: message.author.id,
      name: message.author.name,
      rank: message.author.rank,
      avatar: message.author.avatar,
    };
  }

  @ResolveField()
  async readBy(@Root() channelMessage: ChannelMessage): Promise<userType[]> {
    const reads = await this.prisma.channelMessage.findUnique({
      select: {
        readBy: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                rank: true,
                avatar: true,
              },
            },
          },
        },
      },
      where: {
        id: channelMessage.id,
      },
    });

    return reads
      ? reads?.readBy.map((r) => ({
          id: r.user.id,
          name: r.user.name,
          rank: r.user.rank,
          avatar: r.user.avatar,
        }))
      : [];
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Member)
  @Mutation((returns) => Boolean)
  async sendChannelMessage(
    @Args("message", { type: () => String }) message: string,
    @Args("channelId", { type: () => Int }) channelId: number,
    @CurrentUser() currentUserId: number
  ) {
    const ismuted = await this.prisma.mutedMember.findFirst({
      where: {
        userId: currentUserId,
        channelId: channelId,
        endAt: {
          gte: new Date(),
        },
      },
    });

    if (ismuted) {
      throw new ForbiddenException("You are muted");
    }

    const usersChannel = await this.prisma.channel.findUnique({
      select: { members: true, ownerId: true },
      where: { id: channelId },
    });

    const users = usersChannel?.members.map((u) => u.userId);
    if (usersChannel?.ownerId) users?.push(usersChannel?.ownerId);
    if (users) {
      this.socketservice.emitInvalidateCache(
        InvalidCacheTarget.SEND_CHANNEL_MESSAGE,
        users,
        channelId
      );
    }

    await this.prisma.channelMessage.create({
      data: {
        content: message,
        sentAt: new Date(),
        authorId: currentUserId,
        channelId,
      },
    });

    return true;
  }
}
