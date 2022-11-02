import { Post } from "@nestjs/common";
import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Root,
  Mutation,
  registerEnumType,
  createUnionType,
} from "@nestjs/graphql";
import { Prisma } from "@prisma/client";
import { CurrentUser } from "../auth/currentUser.decorator";
import { channelType } from "../channel/channel.resolver";
import { gameType } from "../game/game.resolver";
import { PrismaService } from "../prisma/prisma.service";
import { DirectMessage, User } from "./user.model";

export type userType = Omit<
  User,
  "friends" | "blocked" | "blocking" | "messages" | "channels" | "games"
>;

type directMessageType = Omit<DirectMessage, "author" | "recipient">;

@Resolver(User)
export class UserResolver {
  constructor(private prisma: PrismaService) {}

  @Query((returns) => User)
  async user(
    @CurrentUser() me: User,
    @Args("id", { type: () => Int, nullable: true, defaultValue: null })
    id?: number | null
  ): Promise<userType> {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        avatar: true,
        rank: true,
      },
      where: { id: id !== null ? id : me.id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      rank: user.rank,
    };
  }

  @Query((returns) => [User], { nullable: "items" })
  async users(
    @Args("name", {
      type: () => String,
      nullable: true,
      defaultValue: undefined,
    })
    name?: string | null
  ): Promise<userType[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        rank: true,
      },
      where: { name: { contains: name !== null ? name : undefined } },
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
  async friends(@Root() user: User): Promise<userType[]> {
    const u = await this.prisma.user.findUnique({
      select: { friends: true },
      where: {
        id: user.id,
      },
    });
    return u
      ? u.friends.map((user) => ({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          rank: user.rank,
        }))
      : [];
  }

  @ResolveField()
  async games(
    @Root() user: User,
    @Args("finished", {
      type: () => Boolean,
      nullable: true,
      defaultValue: null,
    })
    finished?: boolean | null
  ): Promise<gameType[]> {
    const conditions: Prisma.Enumerable<Prisma.GameWhereInput> = [
      {
        OR: [
          {
            player1Id: user.id,
          },
          {
            player2Id: user.id,
          },
        ],
      },
    ];

    if (finished !== null) {
      conditions.push(
        finished ? { NOT: { finishedAt: null } } : { finishedAt: null }
      );
    }

    const games = await this.prisma.game.findMany({
      select: {
        id: true,
        startedAt: true,
        finishedAt: true,
        mode: true,
        player1Score: true,
        player2Score: true,
      },
      where: {
        AND: conditions,
      },
    });
    console.log(games);
    return games.map((game) => ({
      id: game.id,
      gamemode: game.mode.name,
      startAt: game.startedAt ?? undefined,
      finishedAt: game.finishedAt ?? undefined,
      player1score: game.player1Score,
      player2score: game.player2Score,
    }));
  }

  @ResolveField()
  async channels(@Root() user: User): Promise<channelType[]> {
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
          id: channel.id,
          name: channel.name,
          private: channel.inviteOnly,
          passwordProtected: !!channel.password,
        }))
      : [];
  }

  @ResolveField()
  async blocked(@Root() user: User, @CurrentUser() me: User): Promise<boolean> {
    const u = await this.prisma.user.findUnique({
      select: { blocking: true },
      where: {
        id: me.id,
      },
    });
    return u ? u.blocking.some((e) => e.id === user.id) : false;
  }

  @ResolveField()
  async blocking(
    @Root() user: User,
    @CurrentUser() me: User
  ): Promise<boolean> {
    const u = await this.prisma.user.findUnique({
      select: { blockedBy: true },
      where: {
        id: me.id,
      },
    });
    return u ? u.blockedBy.some((e) => e.id === user.id) : false;
  }

  @ResolveField()
  async messages(
    @Root() user: User,
    @CurrentUser() me: User
  ): Promise<directMessageType[]> {
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
    const result = u?.messageReceived.concat(u.messageSent);
    return result
      ? result
          .sort(
            (a, b) => b.sentAt.getMilliseconds() - a.sentAt.getMilliseconds()
          )
          .map((message) => ({
            id: message.id,
            content: message.content,
            sentAt: message.sentAt,
            readAt: message.readAt ?? undefined,
          }))
      : [];
  }
  @Query((returns) => User)
  async blockingUser(
    @CurrentUser() me: User,
    @Args("id", { type: () => Int }) id: number
  ): Promise<userType> {
    const m = await this.prisma.user.update({
      select: {
        avatar: true,
        id: true,
        name: true,
        rank: true,
        blockedBy: true,
      },
      where: {
        id: me.id,
      },
      data: {
        blocking: {
          connect: {
            id: id,
          },
        },
      },
    });
    this.blockedBy(me.id, id);
    return { avatar: m.avatar, id: m.id, name: m.name, rank: m.rank };
  }

  @Query((returns) => User)
  async blockedBy(
    @Args("id", { type: () => Int }) id: number,
    @Args("myId", { type: () => Int }) myId: number
  ): Promise<userType> {
    const m = await this.prisma.user.update({
      select: {
        avatar: true,
        id: true,
        name: true,
        rank: true,
        blockedBy: true,
      },
      where: {
        id: myId,
      },
      data: {
        blockedBy: {
          connect: {
            id: id,
          },
        },
      },
    });
    return { avatar: m.avatar, id: m.id, name: m.name, rank: m.rank };
  }

  @Query((returns) => User)
  async userName(
    @CurrentUser() me: User,
    @Args("name", { type: () => String }) name: string
  ): Promise<userType> {
    const m = await this.prisma.user.update({
      select: {
        avatar: true,
        id: true,
        name: true,
        rank: true,
        blockedBy: true,
      },
      where: {
        id: me.id,
      },
      data: {
        name: name,
      },
    });

    return { avatar: m.avatar, id: m.id, name: m.name, rank: m.rank };
  }

  @Query((returns) => User)
  async userAvatar(
    @CurrentUser() me: User,
    @Args("avatar", { type: () => String }) avatar: string
  ): Promise<userType> {
    const m = await this.prisma.user.update({
      select: {
        avatar: true,
        id: true,
        name: true,
        rank: true,
        blockedBy: true,
      },
      where: {
        id: me.id,
      },
      data: {
        avatar: avatar,
      },
    });

    return { avatar: m.avatar, id: m.id, name: m.name, rank: m.rank };
  }

  @Query((returns) => User)
  async updateFriend(
    @CurrentUser() me: User,
    @Args("id", { type: () => Int }) id: number
  ): Promise<userType> {
    const m = await this.prisma.user.update({
      select: {
        avatar: true,
        id: true,
        name: true,
        rank: true,
        blockedBy: true,
      },
      where: {
        id: me.id,
      },
      data: {
        friends: { connect: { id: id } },
      },
    });
    return { avatar: m.avatar, id: m.id, name: m.name, rank: m.rank };
  }
}
@Resolver(DirectMessage)
export class DirectMessageResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField()
  async author(@Root() message: DirectMessage): Promise<userType> {
    let m = await this.prisma.directMessage.findUnique({
      select: { author: true },
      where: {
        id: message.id,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    m = m!;
    return {
      id: m.author.id,
      name: m.author.name,
      avatar: m.author.avatar,
      rank: m.author.rank,
    };
  }

  @ResolveField()
  async recipient(@Root() message: DirectMessage): Promise<userType> {
    let m = await this.prisma.directMessage.findUnique({
      select: { recipient: true },
      where: {
        id: message.id,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    m = m!;
    return {
      id: m.recipient.id,
      name: m.recipient.name,
      avatar: m.recipient.avatar,
      rank: m.recipient.rank,
    };
  }

  @Mutation((returns) => DirectMessage)
  async sendDirectMessage(
    @Args("message", { type: () => String }) message: string,
    @Args("recipientId", { type: () => Int }) recipientId: number,
    @CurrentUser() me: User
  ): Promise<directMessageType> {
    if (recipientId === me.id)
      throw new Error("You cannot send messages to yourself");

    const m = await this.prisma.directMessage.create({
      data: {
        content: message,
        sentAt: new Date(),
        authorId: me.id,
        recipientId: recipientId,
      },
    });
    return {
      id: m.id,
      content: m.content,
      sentAt: m.sentAt,
    };
  }
}
