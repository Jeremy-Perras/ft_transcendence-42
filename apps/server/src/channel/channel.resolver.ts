import { UseGuards } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { Prisma } from "@prisma/client";
import { GqlAuthenticatedGuard } from "../auth/authenticated.guard";
import { CurrentUser } from "../auth/currentUser.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { Restricted, RestrictedMember, User } from "../user/user.model";
import { userType } from "../user/user.resolver";
import {
  AdminRoleGuard,
  OwnerOrAdminRoleGuard,
  OwnerRoleGuard,
} from "./admin.role.guard";
import { Channel, ChannelMessage, ChannelMessageRead } from "./channel.model";

export type channelType = Omit<
  Channel,
  "owner" | "messages" | "admins" | "members" | "banned" | "muted"
>;
type channelMessageType = Omit<ChannelMessage, "author" | "readBy">;
type channelMessageReadType = Omit<ChannelMessageRead, "user">;
type restrictedMemberType = userType & Restricted;

@Resolver(Channel)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelResolver {
  constructor(private prisma: PrismaService) {}

  @Query((returns) => Channel)
  async channel(
    @Args("id", { type: () => Int }) id: number
  ): Promise<channelType> {
    const channel = await this.prisma.channel.findUnique({
      select: {
        id: true,
        name: true,
        inviteOnly: true,
        password: true,
      },
      where: { id: id },
    });
    if (!channel) {
      throw new Error("Channel not found");
    }
    return {
      id: channel.id,
      name: channel.name,
      private: channel.inviteOnly,
      passwordProtected: !!channel.password,
    };
  }

  @Query((returns) => String)
  async password(
    @Args("id", { type: () => Int }) id: number
  ): Promise<string | undefined | null> {
    const channel = await this.prisma.channel.findUnique({
      select: {
        password: true,
      },
      where: { id: id },
    });
    return channel?.password;
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
        contains: name !== null ? name : undefined,
      },
      ownerId: ownerId !== null ? ownerId : undefined,
    };
    if (adminId !== null && typeof adminId !== "undefined")
      where.admins = {
        some: { userId: adminId },
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
  async owner(@Root() channel: Channel): Promise<userType> {
    let owner = await this.prisma.channel
      .findUnique({
        where: {
          id: channel.id,
        },
      })
      .owner();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    owner = owner!;
    return {
      id: owner.id,
      name: owner.name,
      avatar: owner.avatar,
      rank: owner.rank,
    };
  }

  @ResolveField()
  async admins(@Root() channel: Channel): Promise<userType[]> {
    const admins = await this.prisma.channelAdmin.findMany({
      select: { user: true },
      where: {
        channelId: channel.id,
      },
    });
    return admins
      ? admins.map((admin) => ({
          id: admin.user.id,
          name: admin.user.name,
          avatar: admin.user.avatar,
          rank: admin.user.rank,
        }))
      : [];
  }

  @ResolveField()
  async members(@Root() channel: Channel): Promise<userType[]> {
    const members = await this.prisma.channelMember.findMany({
      select: { user: true },
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
        }))
      : [];
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
        channelMessages: {
          orderBy: [
            {
              sentAt: "asc",
            },
          ],
          select: { id: true, content: true, sentAt: true },
        },
      },
      where: {
        id: channel.id,
        OR: [
          {
            ownerId: currentUserId,
          },
          {
            admins: {
              some: {
                userId: currentUserId,
              },
            },
          },
          {
            members: {
              some: {
                userId: currentUserId,
              },
            },
          },
        ],
      },
    });
    return c
      ? c.channelMessages.map((message) => ({
          id: message.id,
          content: message.content,
          sentAt: message.sentAt,
        }))
      : [];
  }
  // Mutation

  @Mutation((returns) => Channel)
  async createChanel(
    @Args("inviteOnly", { type: () => Boolean }) inviteOnly: boolean,
    @Args("password", { type: () => String }) password: string,
    @Args("name", { type: () => String }) name: string,
    @CurrentUser() currentUserId: number
  ): Promise<channelType> {
    const m = await this.prisma.channel.create({
      data: {
        inviteOnly: inviteOnly,
        name: name,
        password: password,
        ownerId: currentUserId,
        admins: { create: { userId: currentUserId } },
      },
    });
    return {
      passwordProtected: password ? true : false,
      private: m.inviteOnly,
      name: m.name,
      id: m.id,
    };
  }

  @Mutation((returns) => RestrictedMember)
  @UseGuards(OwnerOrAdminRoleGuard)
  async createMuted(
    @Args("id", { type: () => Int }) id: number,
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("date", { type: () => Date, nullable: true })
    date: string | Date | null | undefined
  ): Promise<restrictedMemberType> {
    const m = await this.prisma.mutedMember.create({
      select: {
        user: true,
        endAt: true,
      },
      data: { endAt: date, channelId: channelId, userId: id },
    });
    return {
      avatar: m.user.avatar,
      id: m.user.id,
      name: m.user.name,
      rank: m.user.rank,
      endAt: m.endAt,
    };
  }

  @Mutation((returns) => RestrictedMember)
  @UseGuards(OwnerOrAdminRoleGuard)
  async createBanned(
    @Args("id", { type: () => Int }) id: number,
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("date", { type: () => Date, nullable: true })
    date: string | Date | null | undefined
  ): Promise<restrictedMemberType> {
    const m = await this.prisma.bannedMember.create({
      select: {
        user: true,
        endAt: true,
      },
      data: { endAt: date, channelId: channelId, userId: id },
    });
    return {
      avatar: m.user.avatar,
      id: m.user.id,
      name: m.user.name,
      rank: m.user.rank,
      endAt: m.endAt,
    };
  }

  @Mutation((returns) => Channel)
  @UseGuards(OwnerRoleGuard)
  async deleteChannel(
    @Args("channelId", { type: () => Int }) channelId: number
  ): Promise<channelType> {
    const m = await this.prisma.channel.delete({
      select: { id: true, name: true, password: true, inviteOnly: true },
      where: { id: channelId },
    });
    return {
      id: m.id,
      name: m.name,
      passwordProtected: m.password ? true : false,
      private: m.inviteOnly,
    };
  }

  @Mutation((returns) => RestrictedMember)
  @UseGuards(OwnerOrAdminRoleGuard)
  async deleteMuted(
    @Args("channel", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ): Promise<restrictedMemberType> {
    const m = await this.prisma.mutedMember.delete({
      select: { channel: true, user: true, endAt: true },
      where: { channelId_userId: { channelId: channelId, userId: userId } },
    });
    return {
      avatar: m.user.avatar,
      endAt: m.endAt,
      id: m.user.id,
      name: m.user.name,
      rank: m.user.rank,
    };
  }

  @Mutation((returns) => RestrictedMember)
  @UseGuards(OwnerRoleGuard)
  async deleteBanned(
    @Args("channel", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ): Promise<restrictedMemberType> {
    const m = await this.prisma.bannedMember.delete({
      select: { channel: true, user: true, endAt: true },
      where: { channelId_userId: { channelId: channelId, userId: userId } },
    });
    return {
      avatar: m.user.avatar,
      endAt: m.endAt,
      id: m.user.id,
      name: m.user.name,
      rank: m.user.rank,
    };
  }

  // UPDATE
  @Mutation((returns) => Channel)
  @UseGuards(OwnerRoleGuard)
  async updatePassword(
    @Args("password", { type: () => String, nullable: true }) password: string,
    @Args("idchannel", { type: () => Int }) idchannel: number
  ): Promise<channelType> {
    const m = await this.prisma.channel.update({
      select: { password: true, id: true, name: true, inviteOnly: true },
      where: { id: idchannel },
      data: { password: password },
    });
    return {
      id: m.id,
      name: m.name,
      passwordProtected: m.password ? true : false,
      private: m.inviteOnly,
    };
  }

  @Mutation((returns) => Channel)
  @UseGuards(OwnerRoleGuard)
  async updateRight(
    @Args("password", { type: () => String, nullable: true }) password: string,
    @Args("inviteOnly", { type: () => Boolean, nullable: true })
    inviteOnly: boolean,
    @Args("idchannel", { type: () => Int }) idchannel: number
  ): Promise<channelType> {
    const m = await this.prisma.channel.update({
      select: { password: true, id: true, name: true, inviteOnly: true },
      where: { id: idchannel },
      data: { password: password, inviteOnly: inviteOnly },
    });
    return {
      id: m.id,
      name: m.name,
      passwordProtected: m.password ? true : false,
      private: m.inviteOnly,
    };
  }

  @Mutation((returns) => Channel)
  @UseGuards(OwnerOrAdminRoleGuard)
  async updateMuted(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number,
    @Args("date", { type: () => Date, nullable: true })
    date: string | Date | null | undefined
  ): Promise<channelType> {
    const m = await this.prisma.mutedMember.update({
      select: { channel: true },
      where: { channelId_userId: { channelId: channelId, userId: userId } },
      data: { endAt: date },
    });
    return {
      id: m.channel.id,
      name: m.channel.name,
      passwordProtected: m.channel.password ? true : false,
      private: m.channel.inviteOnly,
    };
  }

  @Mutation((returns) => Channel)
  @UseGuards(OwnerRoleGuard)
  async updateBanned(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number,
    @Args("date", { type: () => Date, nullable: true })
    date: string | Date | null | undefined
  ): Promise<channelType> {
    const m = await this.prisma.bannedMember.update({
      select: { channel: true },
      where: { channelId_userId: { channelId: channelId, userId: userId } },
      data: { endAt: date },
    });
    return {
      id: m.channel.id,
      name: m.channel.name,
      passwordProtected: m.channel.password ? true : false,
      private: m.channel.inviteOnly,
    };
  }

  @Mutation((returns) => Channel)
  @UseGuards(OwnerRoleGuard)
  async updateAdmins(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) user: number
  ): Promise<channelType> {
    const m = await this.prisma.channel.update({
      select: {
        id: true,
        admins: true,
        name: true,
        password: true,
        inviteOnly: true,
      },
      where: { id: channelId },
      data: {
        admins: {
          create: {
            userId: user,
          },
        },
      },
    });

    return {
      id: m.id,
      name: m.name,
      passwordProtected: m.password ? true : false,
      private: m.inviteOnly,
    };
  }

  @Mutation((returns) => Channel)
  async updateMembers(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) user: number
  ): Promise<channelType> {
    const m = await this.prisma.channel.update({
      select: {
        id: true,
        admins: true,
        name: true,
        password: true,
        inviteOnly: true,
      },
      where: { id: channelId },
      data: {
        members: {
          create: {
            userId: user,
          },
        },
      },
    });

    return {
      id: m.id,
      name: m.name,
      passwordProtected: m.password ? true : false,
      private: m.inviteOnly,
    };
  }
}

@Resolver(ChannelMessage)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelMessageResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField()
  async author(@Root() channelMessage: ChannelMessage): Promise<userType> {
    let message = await this.prisma.channelMessage.findUnique({
      select: { author: true },
      where: {
        id: channelMessage.id,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    message = message!;
    return {
      id: message.author.id,
      name: message.author.name,
      rank: message.author.rank,
      avatar: message.author.avatar,
    };
  }

  @ResolveField()
  async readBy(
    @Root() channelMessage: ChannelMessage
  ): Promise<channelMessageReadType[]> {
    const reads = await this.prisma.channelMessageRead.findMany({
      select: {
        id: true,
        readAt: true,
        user: true,
      },
      where: {
        channelMessageId: channelMessage.id,
      },
    });
    return reads
      ? reads.map((r) => ({
          id: r.id,
          readAt: r.readAt,
        }))
      : [];
  }

  @Mutation((returns) => ChannelMessage)
  async sendChanelMessage(
    @Args("message", { type: () => String }) message: string,
    @Args("recipientId", { type: () => Int }) recipientId: number,
    @CurrentUser() currentUserId: number
  ): Promise<channelMessageType> {
    const m = await this.prisma.channelMessage.create({
      data: {
        content: message,
        sentAt: new Date(),
        authorId: currentUserId,
        channelId: recipientId,
      },
    });
    return {
      id: m.id,
      content: m.content,
      sentAt: m.sentAt,
    };
  }

  @Mutation((returns) => ChannelMessage)
  @UseGuards(OwnerOrAdminRoleGuard)
  async deleteChannelMessageContent(
    @Args("messageId", { type: () => Int }) messageId: number
  ): Promise<channelMessageType> {
    const m = await this.prisma.channelMessage.update({
      select: { id: true, content: true, sentAt: true },
      where: { id: messageId },
      data: { content: " message supprimé " },
    });
    return {
      id: m.id,
      content: m.content,
      sentAt: m.sentAt,
    };
  }
}

@Resolver(ChannelMessageRead)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelMessageReadResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField()
  async user(
    @Root() channelMessageread: ChannelMessageRead
  ): Promise<userType> {
    let message = await this.prisma.channelMessageRead.findUnique({
      select: {
        user: true,
      },
      where: {
        id: channelMessageread.id,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    message = message!;
    return {
      id: message.user.id,
      avatar: message.user.avatar,
      name: message.user.name,
      rank: message.user.rank,
    };
  }

  @Mutation((returns) => ChannelMessageRead)
  async createChannelMessageRead(
    @Args("userId", { type: () => Int }) userId: number,
    @Args("messageId", { type: () => Int }) messageId: number
  ): Promise<channelMessageReadType> {
    const m = await this.prisma.channelMessageRead.create({
      data: {
        channelMessageId: messageId,
        userId: userId,
        readAt: new Date(),
      },
    });
    return { id: m.id, readAt: m.readAt };
  }
}
