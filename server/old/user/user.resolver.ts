import { InvalidCacheTarget } from "@apps/shared";
import { ForbiddenException, UseGuards } from "@nestjs/common";
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
  User as PrismaUser,
  Achievement as PrismaAchievement,
  DirectMessage as PrismaDirectMessage,
  Channel as PrismaChannel,
} from "@prisma/client";
import DataLoader from "dataloader";
import { GqlAuthenticatedGuard } from "../auth/authenticated.guard";
import { CurrentUser } from "../auth/currentUser.decorator";
import { ChannelLoader } from "../channel/channel.loaders";
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
  BlockedByIdsLoader,
  BlockingIdsLoader,
  DirectMessagesReceivedLoader,
  DirectMessagesSentLoader,
  FriendedByIdsLoader,
  FriendIdsLoader,
  UserChannelIdsLoader,
  UserLoader,
} from "./user.loaders";
import {
  DirectMessage,
  Achievement,
  FriendStatus,
  User,
  Chat,
  UserStatus,
} from "./user.model";
import { UserService } from "./user.service";

export type GraphQLUser = Omit<
  User,
  | "avatar"
  | "friends"
  | "blocked"
  | "blocking"
  | "messages"
  | "channels"
  | "games"
  | "achievements"
  | "pendingFriends"
  | "chats"
  | "status"
>;

export type directMessageType = Omit<DirectMessage, "author" | "recipient"> & {
  author: GraphQLUser;
  recipient: GraphQLUser;
};

export const formatGraphqlUser = (user: PrismaUser): GraphQLUser => ({
  id: user.id,
  name: user.name,
  rank: user.rank,
});

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
  ) {
    return this.userService.getUserById(userLoader, currentUserId ?? id);
  }

  @Query((returns) => [User], { nullable: "items" })
  async users(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Args("name", { type: () => String }) name: string
  ): Promise<userType[]> {
    return this.userService.searchUsersByName(userLoader, name);
  }

  @ResolveField()
  async chats(
    @CurrentUser() currentUserId: number,
    @Root() user: User
  ): Promise<Chat[] | undefined> {
    if (currentUserId !== user.id) {
      return undefined;
    }
    return this.userService.getChats(user.id);
  }

  @ResolveField()
  async friendStatus(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Loader(FriendIdsLoader)
    friendIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Loader(FriendedByIdsLoader)
    friendedByIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @CurrentUser() currentUserId: number,
    @Root() user: User
  ): Promise<friendStatus | undefined> {
    if (currentUserId === user.id) {
      return undefined;
    }

    const [friendedBy, friends] = await Promise.all([
      this.userService.getFriends(userLoader, friendIdsLoader, user.id),
      this.userService.getFriendedBy(userLoader, friendedByIdsLoader, user.id),
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
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Loader(FriendIdsLoader)
    friendIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Loader(FriendedByIdsLoader)
    friendedByIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @CurrentUser() currentUserId: number,
    @Root() user: User
  ): Promise<userType[]> {
    if (currentUserId !== user.id) return [];

    const [friendedBy, friends] = await Promise.all([
      this.userService.getFriends(userLoader, friendIdsLoader, user.id),
      this.userService.getFriendedBy(userLoader, friendedByIdsLoader, user.id),
    ]);

    return friends.filter((f) => friendedBy.some((fb) => fb.id === f.id));
  }

  @ResolveField()
  async pendingFriends(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Loader(FriendIdsLoader)
    friendIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Loader(FriendedByIdsLoader)
    friendedByIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @CurrentUser() currentUserId: number,
    @Root() user: User
  ): Promise<userType[]> {
    if (currentUserId !== user.id) return [];

    const [friendedBy, friends] = await Promise.all([
      this.userService.getFriends(userLoader, friendIdsLoader, user.id),
      this.userService.getFriendedBy(userLoader, friendedByIdsLoader, user.id),
    ]);

    return friendedBy.filter((f) => !friends.some((fb) => fb.id === f.id));
  }

  @ResolveField() // TODO
  async games(
    @Root() user: User,
    @Args("finished", {
      type: () => Boolean,
      nullable: true,
      defaultValue: null,
    })
    finished?: boolean | null
  ): Promise<gameType[]> {
    return [];
    // const conditions: Prisma.Enumerable<Prisma.GameWhereInput> = [
    //   {
    //     OR: [
    //       {
    //         player1Id: user.id,
    //       },
    //       {
    //         player2Id: user.id,
    //       },
    //     ],
    //   },
    // ];

    // if (finished !== null) {
    //   conditions.push(
    //     finished ? { NOT: { finishedAt: null } } : { finishedAt: null }
    //   );
    // }

    // const games = await this.prisma.game.findMany({
    //   select: {
    //     id: true,
    //     startedAt: true,
    //     finishedAt: true,
    //     mode: true,
    //     player1Score: true,
    //     player2Score: true,
    //   },
    //   where: {
    //     AND: conditions,
    //   },
    // });
    // return games.map((game) => ({
    //   id: game.id,
    //   gameMode: game.mode,
    //   startAt: game.startedAt,
    //   finishedAt: game.finishedAt ?? undefined,
    //   score: {
    //     player1Score: game.player1Score,
    //     player2Score: game.player2Score,
    //   },
    // }));
  }

  @ResolveField()
  async channels(
    @Loader(UserChannelIdsLoader)
    userChannelIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Root() user: User
  ): Promise<channelType[]> {
    return this.userService.getChannels(
      userChannelIdsLoader,
      channelLoader,
      user.id
    );
  }

  @ResolveField()
  async blocked(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Loader(BlockingIdsLoader)
    blockingIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Root() user: User,
    @CurrentUser() currentUserId: number
  ): Promise<boolean> {
    const blockedBy = await this.userService.getBlockedBy(
      userLoader,
      blockingIdsLoader,
      user.id
    );

    return blockedBy.some((e) => e.id === currentUserId);
  }

  @ResolveField()
  async blocking(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Loader(BlockedByIdsLoader)
    blockedByIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Root() user: User,
    @CurrentUser() currentUserId: number
  ): Promise<boolean> {
    const blocking = await this.userService.getBlocking(
      userLoader,
      blockedByIdsLoader,
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
