import { NotFoundException, UseGuards } from "@nestjs/common";
import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Root,
  Mutation,
  ObjectType,
} from "@nestjs/graphql";
import { Prisma } from "@prisma/client";
import { GqlAuthenticatedGuard } from "../auth/authenticated.guard";
import { CurrentUser } from "../auth/currentUser.decorator";
import { channelType } from "../channel/channel.model";
import { gameType } from "../game/game.model";
import { PrismaService } from "../prisma/prisma.service";
import {
  BlockGuard,
  ExistingMessageGuard,
  ExistingUserGuard,
  FriendGuard,
  SelfGuard,
} from "./user.guards";
import {
  DirectMessage,
  directMessageType,
  friendStatus,
  User,
  userType,
} from "./user.model";

@Resolver(User)
@UseGuards(GqlAuthenticatedGuard)
export class UserResolver {
  constructor(private prisma: PrismaService) {}

  @Query((returns) => User)
  async user(
    @CurrentUser() currentUserId: number,
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
      where: { id: id !== null ? id : currentUserId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
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
  async friendStatus(
    @CurrentUser() currentUserId: number,
    @Root() user: User
  ): Promise<friendStatus | undefined> {
    if (currentUserId === user.id) {
      return undefined;
    }
    const u = await this.prisma.user.findUnique({
      select: {
        friendedBy: {
          where: {
            id: currentUserId,
          },
        },
        friends: {
          where: {
            id: currentUserId,
          },
        },
      },
      where: {
        id: user.id,
      },
    });

    if (
      u?.friendedBy &&
      u.friendedBy.length > 0 &&
      u.friends &&
      u.friends.length > 0
    ) {
      return friendStatus.FRIEND;
    }
    if (u?.friendedBy && u.friendedBy.length > 0) {
      return friendStatus.INVITATIONSEND;
    }
    if (u?.friends && u.friends.length > 0) {
      return friendStatus.INVITATIONRECEVEID;
    }
    return friendStatus.NOTFRIEND;
  }

  @ResolveField()
  async friends(
    @CurrentUser() currentUserId: number,
    @Root() user: User
  ): Promise<userType[]> {
    if (currentUserId === user.id) {
      const u = await this.prisma.user.findUnique({
        select: {
          friendedBy: {
            where: { friendedBy: { some: { id: currentUserId } } },
          },
        },
        where: { id: user.id },
      });
      return u
        ? u.friendedBy.map((us) => ({
            id: us.id,
            name: us.name,
            avatar: us.avatar,
            rank: us.rank,
          }))
        : [];
    }
    return [];
  }

  @ResolveField()
  async pendingFriends(
    @CurrentUser() currentUserId: number,
    @Root() user: User
  ): Promise<userType[]> {
    if (currentUserId === user.id) {
      const u = await this.prisma.user.findUnique({
        select: {
          friendedBy: {
            where: { friendedBy: { none: { id: currentUserId } } },
          },
        },
        where: { id: user.id },
      });
      return u
        ? u.friendedBy.map((us) => ({
            id: us.id,
            name: us.name,
            avatar: us.avatar,
            rank: us.rank,
          }))
        : [];
    }
    return [];
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
    return games.map((game) => ({
      id: game.id,
      gamemode: game.mode.name,
      startAt: game.startedAt,
      finishedAt: game.finishedAt ?? undefined,
      score: {
        player1Score: game.player1Score,
        player2Score: game.player2Score,
      },
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
  async blocked(
    @Root() user: User,
    @CurrentUser() currentUserId: number
  ): Promise<boolean> {
    const u = await this.prisma.user.findUnique({
      select: { blocking: true },
      where: {
        id: currentUserId,
      },
    });
    return u ? u.blocking.some((e) => e.id === user.id) : false;
  }

  @ResolveField()
  async blocking(
    @Root() user: User,
    @CurrentUser() currentUserId: number
  ): Promise<boolean> {
    const u = await this.prisma.user.findUnique({
      select: { blockedBy: true },
      where: {
        id: currentUserId,
      },
    });
    return u ? u.blockedBy.some((e) => e.id === user.id) : false;
  }

  @ResolveField()
  async messages(
    @Root() user: User,
    @CurrentUser() currentUserId: number
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
        id: currentUserId,
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

  @UseGuards(ExistingUserGuard)
  @UseGuards(SelfGuard)
  @Mutation((returns) => Boolean)
  async blockUser(
    @CurrentUser() currentUserId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    await this.prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        blocking: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return true;
  }

  @UseGuards(ExistingUserGuard)
  @UseGuards(SelfGuard)
  @Mutation((returns) => Boolean)
  async unblockUser(
    @CurrentUser() currentUserId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    await this.prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        blocking: { disconnect: { id: userId } },
      },
    });
    return true;
  }

  @UseGuards(ExistingUserGuard)
  @UseGuards(SelfGuard)
  @UseGuards(BlockGuard)
  @Mutation((returns) => Boolean)
  async friendUser(
    @CurrentUser() currentUserId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    await this.prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        friends: { connect: { id: userId } },
      },
    });
    return true;
  }

  @UseGuards(ExistingUserGuard)
  @UseGuards(SelfGuard)
  @UseGuards(FriendGuard)
  @Mutation((returns) => Boolean)
  async unfriendUser(
    @CurrentUser() currentUserId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    await this.prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        friends: { disconnect: { id: userId } },
      },
    });
    return true;
  }
}

@Resolver(DirectMessage)
@UseGuards(GqlAuthenticatedGuard)
export class DirectMessageResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField()
  async author(@Root() message: DirectMessage): Promise<userType> {
    const m = await this.prisma.directMessage.findUnique({
      select: { author: true },
      where: {
        id: message.id,
      },
    });

    if (!m) {
      throw new NotFoundException("Message not found");
    }

    return {
      id: m.author.id,
      name: m.author.name,
      avatar: m.author.avatar,
      rank: m.author.rank,
    };
  }

  @ResolveField()
  async recipient(@Root() message: DirectMessage): Promise<userType> {
    const m = await this.prisma.directMessage.findUnique({
      select: { recipient: true },
      where: {
        id: message.id,
      },
    });

    if (!m) {
      throw new NotFoundException("Message not found");
    }

    return {
      id: m.recipient.id,
      name: m.recipient.name,
      avatar: m.recipient.avatar,
      rank: m.recipient.rank,
    };
  }

  @UseGuards(ExistingUserGuard)
  @UseGuards(SelfGuard)
  @UseGuards(BlockGuard)
  @UseGuards(FriendGuard)
  @Mutation((returns) => Boolean)
  async sendDirectMessage(
    @Args("message", { type: () => String }) message: string,
    @Args("userId", { type: () => Int }) userId: number,
    @CurrentUser() currentUserId: number
  ) {
    await this.prisma.directMessage.create({
      data: {
        content: message,
        sentAt: new Date(),
        authorId: currentUserId,
        recipientId: userId,
      },
    });
    return true;
  }

  //TODO: this guard breaks everything
  // @UseGuards(ExistingMessageGuard)
  @Mutation((returns) => Boolean)
  async readDirectMessage(
    @Args("messageId", { type: () => Int }) messageId: number
  ) {
    await this.prisma.directMessage.update({
      where: { id: messageId },
      data: {
        readAt: new Date(),
      },
    });
    return true;
  }
}
