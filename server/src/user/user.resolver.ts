import { UseGuards } from "@nestjs/common";
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
  UserAchievement as PrismaAchievement,
  DirectMessage as PrismaDirectMessage,
  Channel as PrismaChannel,
  GameMode,
} from "@prisma/client";
import DataLoader from "dataloader";
import { GqlAuthenticatedGuard } from "../auth/authenticated.guard";
import { CurrentUser } from "../auth/currentUser.decorator";
import UserSession from "../auth/userSession.model";
import { ChannelLoader } from "../channel/channel.loaders";
import { GraphqlChannel } from "../channel/channel.resolver";
import { Loader } from "../dataloader";
import { GraphqlGame } from "../game/game.resolver";
import { GameService } from "../game/game.service";
import { SocketGateway } from "../socket/socket.gateway";
import {
  GetUserArgs,
  SendDirectMessage,
  SetUserName,
  TwoFaSecret,
  TwoFaToken,
} from "./user.args";
import { BlockGuard, FriendGuard, SelfGuard } from "./user.guards";
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
  Invitation,
  StatesUnion,
} from "./user.model";
import { UserService } from "./user.service";

type GraphqlDirectMessage = Omit<DirectMessage, "author" | "recipient"> & {
  author: GraphqlUser;
  recipient: GraphqlUser;
};

export type GraphqlUser = Omit<
  User,
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
  | "state"
  | "invitations"
  | "twoFAEnabled"
>;

type GraphqlInvitation = Omit<Invitation, "sender"> & {
  sender: GraphqlUser;
};

type GraphqlStatesUnion =
  | { invitee: GraphqlUser; gameMode: GameMode }
  | { gameMode: GameMode }
  | { game: GraphqlGame };

@Resolver(User)
@UseGuards(GqlAuthenticatedGuard)
export class UserResolver {
  constructor(
    private userService: UserService,
    private socketGateway: SocketGateway,
    private gameService: GameService
  ) {}

  @Query((returns) => User)
  async user(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @CurrentUser() currentUser: UserSession,
    @Args("id", { type: () => Int, nullable: true, defaultValue: null })
    id?: number | null
  ): Promise<GraphqlUser> {
    return await this.userService.getUserById(userLoader, id ?? currentUser.id);
  }

  @Query((returns) => [User], { nullable: "items" })
  async users(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Args("name", { type: () => String }) name: string
  ): Promise<GraphqlUser[]> {
    return await this.userService.searchUsersByName(userLoader, name);
  }

  @ResolveField((returns) => [Invitation])
  async invitations(
    @Root() user: User,
    @CurrentUser() currentUser: UserSession
  ): Promise<GraphqlInvitation[]> {
    if (currentUser.id !== user.id) {
      return [];
    }
    return await this.userService.getInvitations(currentUser.id);
  }

  @ResolveField((returns) => StatesUnion, { nullable: true })
  async state(
    @Root() user: User,
    @CurrentUser() currentUser: UserSession
  ): Promise<GraphqlStatesUnion | null> {
    if (currentUser.id !== user.id) {
      return null;
    }

    return await this.userService.getState(currentUser.id);
  }

  @ResolveField((returns) => Boolean, { nullable: true })
  async twoFAEnabled(
    @Root() user: User,
    @CurrentUser() currentUser: UserSession
  ): Promise<boolean | null> {
    if (currentUser.id !== user.id) {
      return null;
    }

    return await this.userService.get2FAStatus(currentUser.id);
  }

  @ResolveField()
  async chats(
    @CurrentUser() currentUser: UserSession,
    @Root() user: User
  ): Promise<Chat[]> {
    if (currentUser.id !== user.id) {
      return [];
    }
    return await this.userService.getChats(user.id);
  }

  @ResolveField()
  async friendStatus(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Loader(FriendIdsLoader)
    friendIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Loader(FriendedByIdsLoader)
    friendedByIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @CurrentUser() currentUser: UserSession,
    @Root() user: User
  ): Promise<FriendStatus | undefined> {
    if (currentUser.id === user.id) {
      return undefined;
    }

    const [friendedBy, friends] = await Promise.all([
      this.userService.getFriends(userLoader, friendIdsLoader, user.id),
      this.userService.getFriendedBy(userLoader, friendedByIdsLoader, user.id),
    ]);

    const isFriendedBy = !!friendedBy.find((u) => u.id === currentUser.id);
    const isFriends = !!friends.find((u) => u.id === currentUser.id);

    if (isFriendedBy && isFriends) {
      return FriendStatus.FRIEND;
    }

    if (isFriendedBy) {
      return FriendStatus.INVITATION_SENT;
    }

    if (isFriends) {
      return FriendStatus.INVITATION_RECEIVED;
    }

    return FriendStatus.NOT_FRIEND;
  }

  @ResolveField()
  async achievements(
    @Loader(AchivementsLoader)
    achievementsLoader: DataLoader<PrismaUser["id"], PrismaAchievement[]>,
    @Root() user: User
  ): Promise<Achievement[]> {
    return await this.userService.getAchievements(achievementsLoader, user.id);
  }

  @ResolveField()
  async status(@Root() user: User): Promise<UserStatus> {
    const player = this.gameService.getPlayer(user.id);
    if (player) {
      if (player.getSnapshot().matches("_.playing")) return UserStatus.PLAYING;
    }
    return this.socketGateway.isOnline(user.id)
      ? UserStatus.ONLINE
      : UserStatus.OFFLINE;
  }

  @ResolveField()
  async friends(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Loader(FriendIdsLoader)
    friendIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Loader(FriendedByIdsLoader)
    friendedByIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @CurrentUser() currentUser: UserSession,
    @Root() user: User
  ): Promise<GraphqlUser[]> {
    if (currentUser.id !== user.id) return [];

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
    @CurrentUser() currentUser: UserSession,
    @Root() user: User
  ): Promise<GraphqlUser[]> {
    if (currentUser.id !== user.id) return [];
    const [friendedBy, friends] = await Promise.all([
      this.userService.getFriends(userLoader, friendIdsLoader, user.id),
      this.userService.getFriendedBy(userLoader, friendedByIdsLoader, user.id),
    ]);
    return friendedBy.filter((f) => !friends.some((fb) => fb.id === f.id));
  }

  @ResolveField()
  async games(@Root() user: User): Promise<GraphqlGame[]> {
    const gameList = await this.userService.getGames(user.id);
    return gameList;
  }

  @ResolveField()
  async channels(
    @Loader(UserChannelIdsLoader)
    userChannelIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Root() user: User,
    @CurrentUser() currentUser: UserSession
  ): Promise<GraphqlChannel[]> {
    if (currentUser.id !== user.id) return [];
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
    @CurrentUser() currentUser: UserSession
  ): Promise<boolean | undefined> {
    if (currentUser.id === user.id) return undefined;
    const blockedBy = await this.userService.getBlockedBy(
      userLoader,
      blockingIdsLoader,
      user.id
    );
    return blockedBy.some((e) => e.id === currentUser.id);
  }

  @ResolveField()
  async blocking(
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Loader(BlockedByIdsLoader)
    blockedByIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Root() user: User,
    @CurrentUser() currentUser: UserSession
  ): Promise<boolean | undefined> {
    if (currentUser.id === user.id) return undefined;
    const blocking = await this.userService.getBlocking(
      userLoader,
      blockedByIdsLoader,
      user.id
    );
    return blocking.some((e) => e.id === currentUser.id);
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
    @CurrentUser() currentUser: UserSession
  ): Promise<GraphqlDirectMessage[]> {
    const messages = await this.userService.getMessages(
      currentUser.id,
      user.id,
      directMessagesReceivedLoader,
      directMessagesSentLoader
    );

    return messages;
  }

  @UseGuards(SelfGuard)
  @Mutation((returns) => Boolean)
  async blockUser(
    @CurrentUser() currentUser: UserSession,
    @Args() args: GetUserArgs
  ) {
    await this.userService.block(currentUser.id, args.userId);

    return true;
  }

  @UseGuards(SelfGuard)
  @Mutation((returns) => Boolean)
  async unblockUser(
    @CurrentUser() currentUser: UserSession,
    @Args() args: GetUserArgs
  ) {
    await this.userService.unblock(currentUser.id, args.userId);

    return true;
  }

  @UseGuards(SelfGuard)
  @UseGuards(BlockGuard)
  @Mutation((returns) => Boolean)
  async friendUser(
    @CurrentUser() currentUser: UserSession,
    @Args() args: GetUserArgs
  ) {
    await this.userService.friend(currentUser.id, args.userId);

    return true;
  }

  @UseGuards(SelfGuard)
  @UseGuards(FriendGuard)
  @Mutation((returns) => Boolean)
  async unfriendUser(
    @CurrentUser() currentUser: UserSession,
    @Args() args: GetUserArgs
  ) {
    await this.userService.unFriend(currentUser.id, args.userId);

    return true;
  }

  @UseGuards(SelfGuard)
  @Mutation((returns) => Boolean)
  async cancelInvitation(
    @CurrentUser() currentUser: UserSession,
    @Args() args: GetUserArgs
  ) {
    await this.userService.refuseFriendInvite(args.userId, currentUser.id);

    return true;
  }

  @UseGuards(SelfGuard)
  @Mutation((returns) => Boolean)
  async refuseInvitation(
    @CurrentUser() currentUser: UserSession,
    @Args() args: GetUserArgs
  ) {
    await this.userService.refuseFriendInvite(currentUser.id, args.userId);
    return true;
  }

  @Mutation((returns) => Boolean)
  async updateUserName(
    @CurrentUser() currentUser: UserSession,
    @Args() args: SetUserName
  ) {
    await this.userService.updateName(currentUser.id, args.name);

    return true;
  }

  @Mutation((returns) => Boolean)
  async enable2Fa(
    @CurrentUser() currentUser: UserSession,
    @Args() args: TwoFaSecret
  ) {
    await this.userService.enable2Fa(currentUser.id, args.secret);

    return true;
  }

  @Mutation((returns) => Boolean)
  async disable2Fa(
    @CurrentUser() currentUser: UserSession,
    @Args() args: TwoFaToken
  ) {
    await this.userService.disable2Fa(currentUser.id, args.token);

    return true;
  }
}

@Resolver(DirectMessage)
@UseGuards(GqlAuthenticatedGuard)
export class DirectMessageResolver {
  constructor(
    private userService: UserService,
    private socketGateway: SocketGateway
  ) {}

  @UseGuards(FriendGuard)
  @UseGuards(BlockGuard)
  @UseGuards(SelfGuard)
  @Mutation((returns) => Boolean)
  async sendDirectMessage(
    @CurrentUser() currentUser: UserSession,
    @Args() args: SendDirectMessage
  ) {
    await this.userService.sendDirectMessage(
      currentUser.id,
      args.userId,
      args.message
    );

    this.socketGateway.sendToUser(
      args.userId,
      "invalidateDirectMessageCache",
      currentUser.id
    );

    return true;
  }
}
