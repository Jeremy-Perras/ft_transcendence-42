import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Root,
} from "@nestjs/graphql";
import { CurrentUser } from "../auth/currentUser.decorator";
import { channelType } from "../channel/channel.resolver";
import { PrismaService } from "../prisma/prisma.service";
import { DirectMessage, User } from "./user.model";

export type userType = Omit<
  User,
  "friends" | "blocked" | "blocking" | "messages" | "channels"
>;

type directMessageType = Omit<DirectMessage, "author" | "recipient">;

@Resolver(User)
export class UserResolver {
  constructor(private prisma: PrismaService) {}

  @Query((returns) => User)
  async user(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @CurrentUser() me: User
  ): Promise<userType> {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        avatar: true,
        rank: true,
      },
      where: { id: id ?? me.id },
    });

    if (!user) {
      throw new Error("User not found");
    }
    return {
      typename: "User",
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      rank: user.rank,
    };
  }

  @Query((returns) => [User])
  async users(
    @Args("name", { nullable: true }) name: string
  ): Promise<userType[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        rank: true,
      },
      where: { name: { contains: name } },
    });

    return users.map((user) => ({
      typename: "User",
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      rank: user.rank,
    }));
  }

  @ResolveField()
  async friends(@Root() user: User): Promise<userType[] | null> {
    const u = await this.prisma.user.findUnique({
      select: { friends: true },
      where: {
        id: user.id,
      },
    });
    return u
      ? u.friends.map((user) => ({
          typename: "User",
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          rank: user.rank,
        }))
      : null;
  }

  @ResolveField()
  async channels(@Root() user: User): Promise<channelType[] | null> {
    const c = await this.prisma.channel.findMany({
      select: {
        id: true,
        name: true,
        inviteOnly: true,
        password: true,
      },
      where: {
        OR: [
          {
            ownerId: user.id,
          },
          {
            admins: {
              some: {
                userId: user.id,
              },
            },
          },
          {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
    });
    return c
      ? c.map((channel) => ({
          typename: "Channel",
          id: channel.id,
          name: channel.name,
          private: channel.inviteOnly,
          passwordProtected: !!channel.password,
        }))
      : null;
  }

  @ResolveField()
  async blocked(
    @Root() user: User,
    @CurrentUser() me: User
  ): Promise<boolean | null> {
    const u = await this.prisma.user.findUnique({
      select: { blocking: true },
      where: {
        id: me.id,
      },
    });
    return u ? u.blocking.some((e) => e.id === user.id) : null;
  }

  @ResolveField()
  async blocking(
    @Root() user: User,
    @CurrentUser() me: User
  ): Promise<boolean | null> {
    const u = await this.prisma.user.findUnique({
      select: { blockedBy: true },
      where: {
        id: me.id,
      },
    });
    return u ? u.blockedBy.some((e) => e.id === user.id) : null;
  }

  @ResolveField()
  async messages(
    @Root() user: User,
    @CurrentUser() me: User
  ): Promise<directMessageType[] | null> {
    const u = await this.prisma.user.findUnique({
      select: {
        messageSent: {
          orderBy: [
            {
              sentAt: "asc",
            },
          ],
          where: {
            recipientId: user.id,
          },
        },
        messageReceived: {
          orderBy: [
            {
              sentAt: "asc",
            },
          ],
          where: {
            authorId: user.id,
          },
        },
      },
      where: {
        id: me.id,
      },
    });
    return u
      ? u.messageSent
          .concat(u.messageReceived)
          .sort(
            (a, b) => a.sentAt.getMilliseconds() - b.sentAt.getMilliseconds()
          )
          .map((message) => ({
            typename: "DirectMessage",
            id: message.id,
            content: message.content,
            sentAt: message.sentAt,
            readAt: message.readAt ?? undefined,
          }))
      : null;
  }
}

@Resolver(DirectMessage)
export class DirectMessageResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField()
  async author(@Root() message: DirectMessage): Promise<userType | null> {
    const m = await this.prisma.directMessage.findUnique({
      select: { author: true },
      where: {
        id: message.id,
      },
    });
    return m
      ? {
          typename: "User",
          id: m.author.id,
          name: m.author.name,
          avatar: m.author.avatar,
          rank: m.author.rank,
        }
      : null;
  }

  @ResolveField()
  async recipient(@Root() message: DirectMessage): Promise<userType | null> {
    const m = await this.prisma.directMessage.findUnique({
      select: { recipient: true },
      where: {
        id: message.id,
      },
    });
    return m
      ? {
          typename: "User",
          id: m.recipient.id,
          name: m.recipient.name,
          avatar: m.recipient.avatar,
          rank: m.recipient.rank,
        }
      : null;
  }
}
