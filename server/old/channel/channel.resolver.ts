import { ForbiddenException, UseGuards } from "@nestjs/common";
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
  Channel as PrismaChannel,
  User as PrismaUser,
  ChannelMessage as PrismaChannelMessage,
  MutedMember,
  BannedMember,
  ChannelMember,
} from "@prisma/client";
import { GqlAuthenticatedGuard } from "../../src/auth/authenticated.guard";
import { CurrentUser } from "../../src/auth/currentUser.decorator";
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
import {
  ChannelLoader,
  ChannelMembersLoader,
  ChannelMessageReadIdsLoader,
  ChannelMessagesLoader,
  ChannelMutedMembersLoader,
} from "./channel.loaders";
import DataLoader from "dataloader";
import { ChannelService } from "./channel.service";
import {
  BlockingIdsLoader,
  UserChannelIdsLoader,
  UserLoader,
} from "../user/user.loaders";
import { UserService } from "../user/user.service";

@Resolver(Channel)
@UseGuards(RolesGuard)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelResolver {
  constructor(
    private channelService: ChannelService,
    private socketService: SocketService
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
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Args("name", { type: () => String }) name: string
  ): Promise<channelType[]> {
    return this.channelService.searchChannelsByName(channelLoader, name);
  }

  @ResolveField()
  async owner(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Root() channel: Channel
  ): Promise<userType> {
    return this.channelService.getOwner(channelLoader, userLoader, channel.id);
  }

  @ResolveField()
  async admins(
    @Loader(ChannelMembersLoader)
    channelMembersLoader: DataLoader<PrismaChannel["id"], ChannelMember[]>,
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Root() channel: Channel
  ): Promise<userType[]> {
    return this.channelService.getAdmins(
      channelMembersLoader,
      userLoader,
      channel.id
    );
  }

  @ResolveField()
  async members(
    @Loader(ChannelMembersLoader)
    channelMembersLoader: DataLoader<PrismaChannel["id"], ChannelMember[]>,
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Root() channel: Channel
  ): Promise<userType[]> {
    return this.channelService.getMembers(
      channelMembersLoader,
      userLoader,
      channel.id
    );
  }

  @ResolveField()
  async muted(
    @Root() channel: Channel,
    @Loader(ChannelMutedMembersLoader)
    channelMutedMembersLoader: DataLoader<PrismaChannel["id"], MutedMember[]>,
    @Loader(UserLoader) userLoader: DataLoader<PrismaUser["id"], PrismaUser>
  ): Promise<restrictedMemberType[]> {
    return this.channelService.getMutedMembers(
      channelMutedMembersLoader,
      userLoader,
      channel.id
    );
  }

  @ResolveField()
  async banned(
    @Root() channel: Channel,
    @Loader(ChannelMutedMembersLoader)
    channelBannedMembersLoader: DataLoader<PrismaChannel["id"], BannedMember[]>,
    @Loader(UserLoader) userLoader: DataLoader<PrismaUser["id"], PrismaUser>
  ): Promise<restrictedMemberType[]> {
    return this.channelService.getBannedMembers(
      channelBannedMembersLoader,
      userLoader,
      channel.id
    );
  }

  @ResolveField()
  async messages(
    @Loader(UserChannelIdsLoader)
    userChannelIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Loader(ChannelMessagesLoader)
    channelMessagesLoader: DataLoader<
      PrismaChannel["id"],
      PrismaChannelMessage[]
    >,
    @Loader(BlockingIdsLoader)
    blockingIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Root() channel: Channel,
    @CurrentUser() currentUserId: number
  ): Promise<channelMessageType[]> {
    return this.channelService.getMessages(
      userChannelIdsLoader,
      channelMessagesLoader,
      blockingIdsLoader,
      channel.id,
      currentUserId
    );
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
    this.channelService.emitChannelCacheInvalidation(
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
    this.channelService.emitChannelCacheInvalidation(
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

    this.channelService.emitChannelCacheInvalidation(
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
    this.channelService.emitChannelCacheInvalidation(
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
    this.channelService.emitChannelCacheInvalidation(
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
    this.channelService.emitChannelCacheInvalidation(
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
    this.channelService.emitChannelCacheInvalidation(
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
    this.channelService.emitChannelCacheInvalidation(
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
    this.channelService.emitChannelCacheInvalidation(
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
    this.channelService.emitChannelCacheInvalidation(
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
  constructor(private socketservice: SocketService) {}

  @ResolveField()
  async author(
    @Loader(UserLoader) userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Root() channelMessage: ChannelMessage
  ): Promise<userType> {
    return await userLoader.load(channelMessage.authorId);
  }

  @ResolveField()
  async readBy(
    @Loader(UserLoader) userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Loader(ChannelMessageReadIdsLoader)
    channelMessageReadIdsLoader: DataLoader<
      PrismaChannelMessage["id"],
      number[]
    >,
    @Root() channelMessage: ChannelMessage
  ): Promise<userType[]> {
    const userIds = await channelMessageReadIdsLoader.load(channelMessage.id);
    const users = await userLoader.loadMany(userIds);
    return users.reduce((acc, curr) => {
      if (curr && "id" in curr) {
        acc.push(UserService.formatUser(curr));
      }
      return acc;
    }, new Array<userType>());
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Member)
  @Mutation((returns) => Boolean) // TODO
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
