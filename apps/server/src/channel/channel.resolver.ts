import {
  Args,
  Int,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { Prisma } from "@prisma/client";
import { CurrentUser } from "../auth/currentUser.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "../user/user.model";
import { userType } from "../user/user.resolver";
import { Channel, ChannelMessage, ChannelMessageRead } from "./channel.model";

type channelType = Omit<Channel, "owner">;
type channelMessageType = Omit<ChannelMessage, "author" | "readBy">;
type channelMessageReadType = Omit<ChannelMessageRead, "user">;

@Resolver(Channel)
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

  @Query((returns) => [Channel])
  async channels(
    @Args("name", { nullable: true }) name?: string,
    @Args("ownerId", { type: () => Int, nullable: true }) ownerId?: number,
    @Args("adminId", { type: () => Int, nullable: true }) adminId?: number,
    @Args("memberId", { type: () => Int, nullable: true }) memberId?: number
  ): Promise<channelType[] | null> {
    const where: Prisma.ChannelWhereInput = {
      name: {
        contains: name,
      },
      ownerId: ownerId,
    };
    if (typeof adminId !== "undefined")
      where.admins = { some: { userId: adminId } };
    if (typeof memberId !== "undefined")
      where.members = { some: { userId: memberId } };
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
  async owner(@Root() channel: Channel): Promise<userType | null> {
    const owner = await this.prisma.channel
      .findUnique({
        where: {
          id: channel.id,
        },
      })
      .owner();
    return owner
      ? {
          id: owner.id,
          name: owner.name,
          avatar: owner.avatar,
          rank: owner.rank,
        }
      : null;
  }

  @ResolveField()
  async admins(@Root() channel: Channel): Promise<userType[] | null> {
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
      : null;
  }

  @ResolveField()
  async members(@Root() channel: Channel): Promise<userType[] | null> {
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
      : null;
  }

  @ResolveField()
  async messages(
    @Root() channel: Channel,
    @CurrentUser() me: User
  ): Promise<channelMessageType[] | null> {
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
            ownerId: me.id,
          },
          {
            admins: {
              some: {
                userId: me.id,
              },
            },
          },
          {
            members: {
              some: {
                userId: me.id,
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
      : null;
  }
}

@Resolver(ChannelMessage)
export class ChannelMessageResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField()
  async author(
    @Root() channelMessage: ChannelMessage
  ): Promise<userType | null> {
    const message = await this.prisma.channelMessage.findUnique({
      select: { author: true },
      where: {
        id: channelMessage.id,
      },
    });
    return message
      ? {
          id: message.author.id,
          name: message.author.name,
          rank: message.author.rank,
          avatar: message.author.avatar,
        }
      : null;
  }

  @ResolveField()
  async readBy(
    @Root() channelMessage: ChannelMessage
  ): Promise<channelMessageReadType[] | null> {
    const reads = await this.prisma.channelMessageReads.findMany({
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
      : null;
  }
}

@Resolver(ChannelMessageRead)
export class ChannelMessageReadResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField()
  async user(
    @Root() channelMessageread: ChannelMessageRead
  ): Promise<userType | null> {
    const message = await this.prisma.channelMessageReads.findUnique({
      select: {
        user: true,
      },
      where: {
        id: channelMessageread.id,
      },
    });
    return message
      ? {
          id: message.user.id,
          avatar: message.user.avatar,
          name: message.user.name,
          rank: message.user.rank,
        }
      : null;
  }
}
