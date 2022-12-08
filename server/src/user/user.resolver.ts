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
import {
  Prisma,
  User as PrismaUser,
  Achievement as PrismaAchievement,
  DirectMessage as PrismaDirectMessage,
} from "@prisma/client";
import DataLoader from "dataloader";
import { GqlAuthenticatedGuard } from "../auth/authenticated.guard";
import { CurrentUser } from "../auth/currentUser.decorator";
import { channelType } from "../channel/channel.model";
import { Loader } from "../dataloader";
import { gameType } from "../game/game.model";
import { SocketService } from "../socket/socket.service";
import {
  BlockGuard,
  ExistingUserGuard,
  FriendGuard,
  SelfGuard,
} from "./user.guards";
import {
  AchivementsLoader,
  BlockedByLoader,
  BlockingLoader,
  DirectMessagesReceivedLoader,
  DirectMessagesSentLoader,
  FriendedByLoader,
  FriendsLoader,
  UserLoader,
} from "./user.loaders";
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
import { UserService } from "./user.services";

@Resolver(User)
@UseGuards(GqlAuthenticatedGuard)
export class UserResolver {
  constructor(
    private userService: UserService,
    private socketService: SocketService
  ) {}

  @Query((returns) => User)
  async user(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @CurrentUser() currentUserId: number,
    @Args("id", { type: () => Int, nullable: true, defaultValue: null })
    id?: number | null
  ): Promise<userType> {
    return this.userService.getUserById(userLoader, currentUserId ?? id);
  }

  @Query((returns) => [User], { nullable: "items" })
  async users(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Args("name", {
      type: () => String,
      nullable: true,
      defaultValue: undefined,
    })
    name?: string | null
  ): Promise<userType[]> {
    if (name) {
      return this.userService.searchUsersByName(userLoader, name);
    }
    return [];
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
        status: undefined,
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
        status: this.socketService.isUserConnected(f.id)
          ? userStatus.ONLINE
          : userStatus.OFFLINE,
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
    @Loader(FriendsLoader)
    friendsLoader: DataLoader<PrismaUser["id"], PrismaUser[]>,
    @Loader(FriendedByLoader)
    friendedByLoader: DataLoader<PrismaUser["id"], PrismaUser[]>,
    @CurrentUser() currentUserId: number,
    @Root() user: User
  ): Promise<friendStatus | undefined> {
    if (currentUserId === user.id) {
      return undefined;
    }

    const [friendedBy, friends] = await Promise.all([
      this.userService.getFriendedBy(friendsLoader, user.id),
      this.userService.getFriends(friendedByLoader, user.id),
    ]);

    const isFriendedBy = !!friendedBy.find((u) => u.id === currentUserId);
    const isFriends = !!friends.find((u) => u.id === currentUserId);

    if (isFriendedBy && isFriends) {
      return friendStatus.FRIEND;
    }

    if (isFriendedBy) {
      return friendStatus.INVITATION_SEND;
    }

    if (isFriends) {
      return friendStatus.INVITATION_RECEIVED;
    }

    return friendStatus.NOT_FRIEND;
  }

  @ResolveField()
  async achievements(
    @Loader(AchivementsLoader)
    achievementsLoader: DataLoader<PrismaUser["id"], PrismaAchievement[]>,
    @Root() user: User
  ): Promise<Achievement[]> {
    return this.userService.getAchievements(achievementsLoader, user.id);
  }

  @ResolveField()
  async status(@Root() user: User): Promise<userStatus> {
    return this.socketService.isUserConnected(user.id)
      ? userStatus.ONLINE
      : userStatus.OFFLINE;
  }

  @ResolveField()
  async friends(
    @Loader(FriendsLoader)
    friendsLoader: DataLoader<PrismaUser["id"], PrismaUser[]>,
    @Loader(FriendedByLoader)
    friendedByLoader: DataLoader<PrismaUser["id"], PrismaUser[]>,
    @CurrentUser() currentUserId: number,
    @Root() user: User
  ): Promise<userType[]> {
    if (currentUserId !== user.id) return [];

    const [friendedBy, friends] = await Promise.all([
      this.userService.getFriendedBy(friendsLoader, user.id),
      this.userService.getFriends(friendedByLoader, user.id),
    ]);

    return friends.filter((f) => friendedBy.some((fb) => fb.id === f.id));
  }

  @ResolveField()
  async pendingFriends(
    @Loader(FriendsLoader)
    friendsLoader: DataLoader<PrismaUser["id"], PrismaUser[]>,
    @Loader(FriendedByLoader)
    friendedByLoader: DataLoader<PrismaUser["id"], PrismaUser[]>,
    @CurrentUser() currentUserId: number,
    @Root() user: User
  ): Promise<userType[]> {
    if (currentUserId !== user.id) return [];

    const [friendedBy, friends] = await Promise.all([
      this.userService.getFriendedBy(friendsLoader, user.id),
      this.userService.getFriends(friendedByLoader, user.id),
    ]);

    return friendedBy.filter((f) => !friends.some((fb) => fb.id === f.id));
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
    @Loader(BlockedByLoader)
    blockedByLoader: DataLoader<PrismaUser["id"], PrismaUser[]>,
    @Root() user: User,
    @CurrentUser() currentUserId: number
  ): Promise<boolean> {
    const blockedBy = await this.userService.getBlockedBy(
      blockedByLoader,
      user.id
    );

    return blockedBy.some((e) => e.id === currentUserId);
  }

  @ResolveField()
  async blocking(
    @Loader(BlockingLoader)
    blockingLoader: DataLoader<PrismaUser["id"], PrismaUser[]>,
    @Root() user: User,
    @CurrentUser() currentUserId: number
  ): Promise<boolean> {
    const blocking = await this.userService.getBlocking(
      blockingLoader,
      user.id
    );

    return blocking.some((e) => e.id === currentUserId);
  }

  @ResolveField()
  async messages(
    @Loader(DirectMessagesReceivedLoader)
    directMessagesReceivedLoader: DataLoader<
      [PrismaUser["id"], PrismaUser["id"]],
      (PrismaDirectMessage & { author: PrismaUser; recipient: PrismaUser })[]
    >,
    @Loader(DirectMessagesSentLoader)
    directMessagesSentLoader: DataLoader<
      [PrismaUser["id"], PrismaUser["id"]],
      (PrismaDirectMessage & { author: PrismaUser; recipient: PrismaUser })[]
    >,
    @Root() user: User,
    @CurrentUser() currentUserId: number
  ): Promise<directMessageType[]> {
    const messages = await this.userService.getMessages(
      currentUserId,
      user.id,
      directMessagesReceivedLoader,
      directMessagesSentLoader
    );

    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.DIRECT_MESSAGE,
      [user.id],
      currentUserId
    );

    return messages;
  }

  @UseGuards(ExistingUserGuard)
  @UseGuards(SelfGuard)
  @Mutation((returns) => Boolean)
  async blockUser(
    @CurrentUser() currentUserId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    await this.userService.block(currentUserId, userId);

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
    await this.userService.unblock(currentUserId, userId);

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
    await this.userService.friend(currentUserId, userId);

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
    await this.userService.unFriend(currentUserId, userId);

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
    await this.userService.refuseFriendInvite(userId, currentUserId);

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
    await this.userService.refuseFriendInvite(currentUserId, userId);

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

    await this.userService.updateName(currentUserId, name);

    return true;
  }
}

@Resolver(DirectMessage)
@UseGuards(GqlAuthenticatedGuard)
export class DirectMessageResolver {
  constructor(
    private socketService: SocketService,
    private userService: UserService
  ) {}

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
    await this.userService.sendDirectMessage(currentUserId, userId, message);

    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.DIRECT_MESSAGE,
      [userId],
      currentUserId
    );

    return true;
  }
}
