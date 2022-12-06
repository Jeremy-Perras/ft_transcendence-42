import { InvalidCacheTarget } from "@apps/shared";
import {
  NotFoundException,
  ForbiddenException,
  UseGuards,
} from "@nestjs/common";
import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Root,
  Mutation,
} from "@nestjs/graphql";
import { Prisma } from "@prisma/client";

import { GqlAuthenticatedGuard } from "../auth/authenticated.guard";
import { CurrentUser } from "../auth/currentUser.decorator";
import { channelType } from "../channel/channel.model";
import { gameType } from "../game/game.model";
import { PrismaService } from "../prisma/prisma.service";
import { SocketService } from "../socket/socket.service";

import {
  BlockGuard,
  ExistingUserGuard,
  FriendGuard,
  SelfGuard,
} from "./user.guards";
import {
  DirectMessage,
  directMessageType,
  Achievement,
  friendStatus,
  User,
  userType,
  Chat,
  chatType,
  userStatus,
} from "./user.model";
@Resolver(User)
@UseGuards(GqlAuthenticatedGuard)
export class UserResolver {
  constructor(
    private prisma: PrismaService,
    private socketService: SocketService
  ) {}

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
      where: {
        name: {
          mode: "insensitive",
          contains: name !== null ? name : undefined,
        },
      },
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
  async chats(
    @CurrentUser() currentUserId: number,
    @Root() user: User
  ): Promise<Chat[] | undefined> {
    if (currentUserId !== user.id) {
      return undefined;
    }
    const res = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        blocking: true,
        friends: {
          where: {
            friends: {
              some: {
                id: currentUserId,
              },
            },
          },
          select: {
            id: true,
            name: true,
            avatar: true,
            messageReceived: {
              where: {
                authorId: currentUserId,
              },
              select: {
                content: true,
                sentAt: true,
                readAt: true,
                authorId: true,
              },
              orderBy: { sentAt: "desc" },
              take: 1,
            },
            messageSent: {
              where: {
                recipientId: currentUserId,
              },
              select: {
                content: true,
                sentAt: true,
                readAt: true,
                authorId: true,
              },
              orderBy: { sentAt: "desc" },
              take: 1,
            },
          },
        },
        ownedChannels: {
          select: {
            id: true,
            name: true,
            channelMessages: {
              select: {
                authorId: true,
                content: true,
                sentAt: true,
                readBy: {
                  select: {
                    userId: true,
                  },
                },
              },
              orderBy: { sentAt: "desc" },
              take: 1,
            },
          },
        },
        channels: {
          select: {
            channel: {
              select: {
                id: true,
                name: true,
                channelMessages: {
                  select: {
                    authorId: true,
                    content: true,
                    sentAt: true,
                    readBy: {
                      select: {
                        userId: true,
                      },
                    },
                  },
                  orderBy: { sentAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!res) return [];

    const mergeResult: Chat[] = [];

    const formatChannel = (channel: typeof res.ownedChannels[number]) => {
      mergeResult.push({
        type: chatType.CHANNEL,
        id: channel.id,
        name: channel.name,
        avatar: undefined,
        lastMessageContent: res.blocking.some(
          (u) => u.id === channel.channelMessages[0]?.authorId
        )
          ? "Unblock this user to see this message"
          : channel.channelMessages[0]?.content,
        lastMessageDate: channel.channelMessages[0]?.sentAt,
        hasUnreadMessages: !channel.channelMessages[0]
          ? false
          : channel.channelMessages[0]?.authorId === currentUserId
          ? false
          : channel.channelMessages[0]?.readBy.some(
              (id) => id.userId === currentUserId
            )
          ? false
          : true,
      });
    };
    res?.ownedChannels.forEach(formatChannel);
    res?.channels.forEach((c) => formatChannel(c.channel));

    res.friends.forEach((f) => {
      let lastMessage;
      if (f.messageReceived[0] && f.messageSent[0]) {
        f.messageReceived[0]?.sentAt < f.messageSent[0]?.sentAt
          ? (lastMessage = f.messageSent[0])
          : (lastMessage = f.messageReceived[0]);
      } else if (f.messageReceived[0] && !f.messageSent[0])
        lastMessage = f.messageReceived[0];
      else if (f.messageSent[0] && !f.messageReceived[0])
        lastMessage = f.messageSent[0];
      else lastMessage = undefined;

      mergeResult.push({
        type: chatType.USER,
        id: f.id,
        name: f.name,
        avatar: f.avatar,
        hasUnreadMessages: !lastMessage
          ? false
          : lastMessage?.authorId === currentUserId
          ? false
          : lastMessage?.readAt
          ? false
          : true,
        lastMessageContent: lastMessage?.content,
        lastMessageDate: lastMessage?.sentAt,
      });
    });
    return mergeResult.sort((x, y) => {
      const x_val = x.lastMessageDate ? x.lastMessageDate.valueOf() : -1;
      const y_val = y.lastMessageDate ? y.lastMessageDate.valueOf() : -1;
      return y_val - x_val;
    });
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
      return friendStatus.INVITATION_SEND;
    }
    if (u?.friends && u.friends.length > 0) {
      return friendStatus.INVITATION_RECEIVED;
    }
    return friendStatus.NOT_FRIEND;
  }

  @ResolveField()
  async achievements(@Root() user: User): Promise<Achievement[]> {
    const achievements = await this.prisma.achievement.findMany({
      select: { icon: true, name: true },
      where: { userId: user.id },
    });
    return achievements;
  }

  @ResolveField()
  async status(@Root() user: User): Promise<userStatus> {
    return this.socketService.isUserConnected(user.id)
      ? userStatus.ONLINE
      : userStatus.OFFLINE;
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
      gameMode: game.mode,
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
    const messagesToUpdate = await this.prisma.user.findUnique({
      select: {
        messageReceived: {
          where: {
            authorId: user.id,
          },
        },
      },
      where: {
        id: currentUserId,
      },
    });
    messagesToUpdate?.messageReceived.forEach(async (message) => {
      if (!message.readAt) {
        await this.prisma.directMessage.update({
          where: { id: message.id },
          data: {
            readAt: new Date(),
          },
        });
      }
    });

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

    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.DIRECT_MESSAGE,
      [user.id],
      currentUserId
    );

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
    const u = await this.prisma.user.findUnique({
      select: { friendedBy: true, friends: true },
      where: { id: currentUserId },
    });

    u?.friends.some((us) => us.id === userId)
      ? await this.unfriendUser(currentUserId, userId)
      : null;
    u?.friendedBy.some((us) => us.id === userId)
      ? await this.refuseInvitation(currentUserId, userId)
      : null;

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

    const users = [userId, currentUserId];
    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.BLOCK_USER,
      users,
      currentUserId
    );
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

    const users = [userId, currentUserId];
    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.UNBLOCK_USER,
      users,
      currentUserId
    );

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

    const users = [userId, currentUserId];

    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.FRIEND_USER,
      users,
      currentUserId
    );

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
    await this.refuseInvitation(currentUserId, userId);
    await this.prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        friends: { disconnect: { id: userId } },
      },
    });

    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.UNFRIEND_USER,
      [userId],
      currentUserId
    );

    return true;
  }

  @UseGuards(ExistingUserGuard)
  @UseGuards(SelfGuard)
  @Mutation((returns) => Boolean)
  async cancelInvitation(
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

    const users = [currentUserId, userId];
    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.CANCEL_INVITATION,
      users,
      currentUserId
    );

    return true;
  }

  @UseGuards(ExistingUserGuard)
  @UseGuards(SelfGuard)
  @Mutation((returns) => Boolean)
  async refuseInvitation(
    @CurrentUser() currentUserId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        friends: { disconnect: { id: currentUserId } },
      },
    });
    const users = [userId, currentUserId];
    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.REFUSE_INVITATION_FRIEND,
      users,
      currentUserId
    );

    return true;
  }

  @Mutation((returns) => Boolean)
  async updateUserName(
    @CurrentUser() currentUserId: number,
    @Args("name", { type: () => String }) name: string
  ) {
    if (!name) {
      throw new ForbiddenException("Your name can't be empty");
    }

    if (name.length > 255) {
      throw new ForbiddenException("Your name can't exceed 255 characters");
    }

    const user = await this.prisma.user.findMany({
      select: { name: true },
    });

    if (user.some((user) => user.name === name)) {
      throw new ForbiddenException("Name already used");
    }

    await this.prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        name: name,
      },
    });

    const friend = await this.prisma.user.findMany({
      select: { id: true },
      where: { friendedBy: { some: { id: currentUserId } } },
    });

    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.UPDATE_USER_NAME,
      friend.map((f) => f.id),
      currentUserId
    );
    return true;
  }
}

@Resolver(DirectMessage)
@UseGuards(GqlAuthenticatedGuard)
export class DirectMessageResolver {
  constructor(
    private prisma: PrismaService,
    private socketService: SocketService
  ) {}

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

    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.DIRECT_MESSAGE,
      [userId],
      currentUserId
    );

    return true;
  }
}
