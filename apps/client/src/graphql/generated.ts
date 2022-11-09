import {
  useMutation,
  useQuery,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};

function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch("http://localhost:3000/graphql", {
      method: "POST",
      ...{ headers: { "Content-Type": "application/json" } },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  };
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Timestamp: number;
};

export type Channel = {
  __typename?: "Channel";
  admins: Array<User>;
  banned: Array<RestrictedMember>;
  id: Scalars["Int"];
  members: Array<User>;
  messages: Array<ChannelMessage>;
  muted: Array<RestrictedMember>;
  name: Scalars["String"];
  owner: User;
  passwordProtected: Scalars["Boolean"];
  private: Scalars["Boolean"];
};

export type ChannelMessage = {
  __typename?: "ChannelMessage";
  author: User;
  content: Scalars["String"];
  id: Scalars["Int"];
  readBy: Array<ChannelMessageRead>;
  sentAt: Scalars["Timestamp"];
};

export type ChannelMessageRead = {
  __typename?: "ChannelMessageRead";
  id: Scalars["Int"];
  readAt: Scalars["Timestamp"];
  user: User;
};

export type DirectMessage = {
  __typename?: "DirectMessage";
  author: User;
  content: Scalars["String"];
  id: Scalars["Int"];
  readAt?: Maybe<Scalars["Timestamp"]>;
  recipient: User;
  sentAt: Scalars["Timestamp"];
};

export type Game = {
  __typename?: "Game";
  finishedAt?: Maybe<Scalars["Timestamp"]>;
  gamemode: Scalars["String"];
  id: Scalars["Int"];
  player1: User;
  player1score: Scalars["Int"];
  player2?: Maybe<User>;
  player2score: Scalars["Int"];
  startAt?: Maybe<Scalars["Timestamp"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  blockedBy: User;
  blockingUser: User;
  createBanned: RestrictedMember;
  createChanel: Channel;
  createChannelMessageRead: ChannelMessageRead;
  createGame: Game;
  createMuted: RestrictedMember;
  deleteBanned: RestrictedMember;
  deleteChannel: Channel;
  deleteChannelMessageContent: ChannelMessage;
  deleteDirectMessageContent: DirectMessage;
  deleteMuted: RestrictedMember;
  sendChanelMessage: ChannelMessage;
  sendDirectMessage: DirectMessage;
  unblockedBy: User;
  unblockingUser: User;
  updateAdmins: Channel;
  updateBanned: Channel;
  updateFriend: User;
  updateFriendBy: User;
  updateGame: Game;
  updateMuted: Channel;
  updatePassword: Channel;
  updateUnFriend: User;
  updateUnFriendBy: User;
  userAvatar: User;
  userName: User;
};

export type MutationBlockedByArgs = {
  id: Scalars["Int"];
  myId: Scalars["Int"];
};

export type MutationBlockingUserArgs = {
  id: Scalars["Int"];
};

export type MutationCreateBannedArgs = {
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["Timestamp"]>;
  id: Scalars["Int"];
};

export type MutationCreateChanelArgs = {
  inviteOnly: Scalars["Boolean"];
  name: Scalars["String"];
  password: Scalars["String"];
};

export type MutationCreateChannelMessageReadArgs = {
  messageId: Scalars["Int"];
  userId: Scalars["Int"];
};

export type MutationCreateGameArgs = {
  mode: Scalars["Int"];
  player2Id?: InputMaybe<Scalars["Int"]>;
};

export type MutationCreateMutedArgs = {
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["Timestamp"]>;
  id: Scalars["Int"];
};

export type MutationDeleteBannedArgs = {
  channel: Scalars["Int"];
  userId: Scalars["Int"];
};

export type MutationDeleteChannelArgs = {
  channelId: Scalars["Int"];
};

export type MutationDeleteChannelMessageContentArgs = {
  messageId: Scalars["Int"];
};

export type MutationDeleteDirectMessageContentArgs = {
  messageId: Scalars["Int"];
};

export type MutationDeleteMutedArgs = {
  channel: Scalars["Int"];
  userId: Scalars["Int"];
};

export type MutationSendChanelMessageArgs = {
  message: Scalars["String"];
  recipientId: Scalars["Int"];
};

export type MutationSendDirectMessageArgs = {
  message: Scalars["String"];
  recipientId: Scalars["Int"];
};

export type MutationUnblockedByArgs = {
  id: Scalars["Int"];
  myId: Scalars["Int"];
};

export type MutationUnblockingUserArgs = {
  id: Scalars["Int"];
};

export type MutationUpdateAdminsArgs = {
  channelId: Scalars["Int"];
  userId: Scalars["Int"];
};

export type MutationUpdateBannedArgs = {
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["Timestamp"]>;
  userId: Scalars["Int"];
};

export type MutationUpdateFriendArgs = {
  id: Scalars["Int"];
};

export type MutationUpdateFriendByArgs = {
  id: Scalars["Int"];
  meId: Scalars["Int"];
};

export type MutationUpdateGameArgs = {
  id: Scalars["Int"];
};

export type MutationUpdateMutedArgs = {
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["Timestamp"]>;
  userId: Scalars["Int"];
};

export type MutationUpdatePasswordArgs = {
  idchannel: Scalars["Int"];
  password?: InputMaybe<Scalars["String"]>;
};

export type MutationUpdateUnFriendArgs = {
  id: Scalars["Int"];
};

export type MutationUpdateUnFriendByArgs = {
  id: Scalars["Int"];
  meId: Scalars["Int"];
};

export type MutationUserAvatarArgs = {
  avatar: Scalars["String"];
};

export type MutationUserNameArgs = {
  name: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  channel: Channel;
  channels: Array<Channel>;
  game: Game;
  games: Array<Game>;
  user: User;
  users: Array<Maybe<User>>;
};

export type QueryChannelArgs = {
  id: Scalars["Int"];
};

export type QueryChannelsArgs = {
  adminId?: InputMaybe<Scalars["Int"]>;
  memberId?: InputMaybe<Scalars["Int"]>;
  name?: InputMaybe<Scalars["String"]>;
  ownerId?: InputMaybe<Scalars["Int"]>;
};

export type QueryGameArgs = {
  id: Scalars["Int"];
};

export type QueryGamesArgs = {
  finished?: InputMaybe<Scalars["Boolean"]>;
  gameMode?: InputMaybe<Scalars["Int"]>;
  id?: InputMaybe<Scalars["Int"]>;
  started?: InputMaybe<Scalars["Boolean"]>;
};

export type QueryUserArgs = {
  id?: InputMaybe<Scalars["Int"]>;
};

export type QueryUsersArgs = {
  name?: InputMaybe<Scalars["String"]>;
};

export type RestrictedMember = {
  __typename?: "RestrictedMember";
  avatar: Scalars["String"];
  blocked: Scalars["Boolean"];
  blocking: Scalars["Boolean"];
  channels: Array<Channel>;
  endAt?: Maybe<Scalars["Timestamp"]>;
  friends: Array<User>;
  games: Array<Game>;
  id: Scalars["Int"];
  messages: Array<DirectMessage>;
  name: Scalars["String"];
  rank: Scalars["Int"];
};

export type User = {
  __typename?: "User";
  avatar: Scalars["String"];
  blocked: Scalars["Boolean"];
  blocking: Scalars["Boolean"];
  channels: Array<Channel>;
  friends: Array<User>;
  games: Array<Game>;
  id: Scalars["Int"];
  messages: Array<DirectMessage>;
  name: Scalars["String"];
  rank: Scalars["Int"];
};

export type UserGamesArgs = {
  finished?: InputMaybe<Scalars["Boolean"]>;
};

export type BannedSomeoneChannelMutationVariables = Exact<{
  createMutedId: Scalars["Int"];
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["Timestamp"]>;
}>;

export type BannedSomeoneChannelMutation = {
  __typename?: "Mutation";
  createBanned: {
    __typename?: "RestrictedMember";
    endAt?: number | null;
    id: number;
    name: string;
    avatar: string;
    rank: number;
  };
};

export type BlockSomeoneMutationVariables = Exact<{
  blockingUserId: Scalars["Int"];
}>;

export type BlockSomeoneMutation = {
  __typename?: "Mutation";
  blockingUser: {
    __typename?: "User";
    id: number;
    name: string;
    avatar: string;
    rank: number;
  };
};

export type GetChannelHeaderQueryVariables = Exact<{
  channelId: Scalars["Int"];
}>;

export type GetChannelHeaderQuery = {
  __typename?: "Query";
  channel: {
    __typename?: "Channel";
    id: number;
    name: string;
    private: boolean;
    passwordProtected: boolean;
    owner: { __typename?: "User"; name: string; id: number; avatar: string };
  };
};

export type ChannelSettingsQueryVariables = Exact<{
  channelId: Scalars["Int"];
  userId?: InputMaybe<Scalars["Int"]>;
}>;

export type ChannelSettingsQuery = {
  __typename?: "Query";
  channel: {
    __typename?: "Channel";
    name: string;
    id: number;
    private: boolean;
    passwordProtected: boolean;
    owner: {
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
      rank: number;
    };
    admins: Array<{
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
      rank: number;
    }>;
    members: Array<{
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
      rank: number;
    }>;
    banned: Array<{
      __typename?: "RestrictedMember";
      id: number;
      endAt?: number | null;
    }>;
    muted: Array<{
      __typename?: "RestrictedMember";
      endAt?: number | null;
      id: number;
    }>;
  };
  user: { __typename?: "User"; id: number };
};

export type CreateChanelMutationVariables = Exact<{
  inviteOnly: Scalars["Boolean"];
  password: Scalars["String"];
  name: Scalars["String"];
}>;

export type CreateChanelMutation = {
  __typename?: "Mutation";
  createChanel: { __typename?: "Channel"; id: number; name: string };
};

export type CreateGameMutationVariables = Exact<{
  mode: Scalars["Int"];
  player2Id?: InputMaybe<Scalars["Int"]>;
}>;

export type CreateGameMutation = {
  __typename?: "Mutation";
  createGame: {
    __typename?: "Game";
    id: number;
    gamemode: string;
    startAt?: number | null;
    finishedAt?: number | null;
    player1score: number;
    player2score: number;
    player1: {
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
      rank: number;
    };
    player2?: {
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
      rank: number;
    } | null;
  };
};

export type CreateReadAtMessageByIdMutationVariables = Exact<{
  userId: Scalars["Int"];
  messageId: Scalars["Int"];
}>;

export type CreateReadAtMessageByIdMutation = {
  __typename?: "Mutation";
  createChannelMessageRead: {
    __typename?: "ChannelMessageRead";
    id: number;
    readAt: number;
    user: {
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
      rank: number;
    };
  };
};

export type DeleteBannedMutationVariables = Exact<{
  channel: Scalars["Int"];
  userId: Scalars["Int"];
}>;

export type DeleteBannedMutation = {
  __typename?: "Mutation";
  deleteBanned: { __typename?: "RestrictedMember"; id: number; name: string };
};

export type DeleteChannelMutationVariables = Exact<{
  channelId: Scalars["Int"];
}>;

export type DeleteChannelMutation = {
  __typename?: "Mutation";
  deleteChannel: { __typename?: "Channel"; id: number; name: string };
};

export type DeleteChannelMessageContentMutationVariables = Exact<{
  messageId: Scalars["Int"];
}>;

export type DeleteChannelMessageContentMutation = {
  __typename?: "Mutation";
  deleteChannelMessageContent: {
    __typename?: "ChannelMessage";
    id: number;
    content: string;
    sentAt: number;
  };
};

export type DeleteDirectMessageContentMutationVariables = Exact<{
  messageId: Scalars["Int"];
}>;

export type DeleteDirectMessageContentMutation = {
  __typename?: "Mutation";
  deleteDirectMessageContent: {
    __typename?: "DirectMessage";
    id: number;
    content: string;
  };
};

export type DeleteMutedMutationVariables = Exact<{
  channel: Scalars["Int"];
  userId: Scalars["Int"];
}>;

export type DeleteMutedMutation = {
  __typename?: "Mutation";
  deleteMuted: { __typename?: "RestrictedMember"; id: number; name: string };
};

export type InfoChannelQueryVariables = Exact<{
  channelId: Scalars["Int"];
}>;

export type InfoChannelQuery = {
  __typename?: "Query";
  channel: {
    __typename?: "Channel";
    private: boolean;
    passwordProtected: boolean;
    name: string;
    owner: { __typename?: "User"; id: number; name: string; avatar: string };
    messages: Array<{
      __typename?: "ChannelMessage";
      id: number;
      content: string;
      sentAt: number;
      author: { __typename?: "User"; id: number; name: string; avatar: string };
      readBy: Array<{
        __typename?: "ChannelMessageRead";
        user: { __typename?: "User"; id: number; name: string; avatar: string };
      }>;
    }>;
    admins: Array<{
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
    }>;
    members: Array<{
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
    }>;
  };
};

export type InfoChannelsQueryVariables = Exact<{ [key: string]: never }>;

export type InfoChannelsQuery = {
  __typename?: "Query";
  user: {
    __typename?: "User";
    friends: Array<{ __typename: "User"; name: string; avatar: string }>;
    channels: Array<{ __typename: "Channel"; name: string }>;
  };
};

export type InfoDirectMessagesQueryVariables = Exact<{
  userId?: InputMaybe<Scalars["Int"]>;
}>;

export type InfoDirectMessagesQuery = {
  __typename?: "Query";
  user: {
    __typename?: "User";
    name: string;
    avatar: string;
    messages: Array<{
      __typename?: "DirectMessage";
      content: string;
      sentAt: number;
      readAt?: number | null;
      recipient: {
        __typename?: "User";
        id: number;
        name: string;
        avatar: string;
      };
      author: { __typename?: "User"; id: number; name: string; avatar: string };
    }>;
  };
};

export type InfoUserProfileQueryVariables = Exact<{
  userId?: InputMaybe<Scalars["Int"]>;
}>;

export type InfoUserProfileQuery = {
  __typename?: "Query";
  user: {
    __typename?: "User";
    id: number;
    name: string;
    avatar: string;
    rank: number;
  };
};

export type InfoUsersQueryVariables = Exact<{
  userId?: InputMaybe<Scalars["Int"]>;
}>;

export type InfoUsersQuery = {
  __typename?: "Query";
  user: {
    __typename: "User";
    id: number;
    name: string;
    blocked: boolean;
    blocking: boolean;
    avatar: string;
    rank: number;
    channels: Array<{
      __typename: "Channel";
      name: string;
      id: number;
      messages: Array<{
        __typename?: "ChannelMessage";
        id: number;
        content: string;
        sentAt: number;
      }>;
    }>;
    friends: Array<{
      __typename: "User";
      name: string;
      avatar: string;
      id: number;
      messages: Array<{
        __typename?: "DirectMessage";
        content: string;
        sentAt: number;
      }>;
    }>;
  };
};

export type MutedSomeoneChannelMutationVariables = Exact<{
  createMutedId: Scalars["Int"];
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["Timestamp"]>;
}>;

export type MutedSomeoneChannelMutation = {
  __typename?: "Mutation";
  createMuted: {
    __typename?: "RestrictedMember";
    endAt?: number | null;
    id: number;
    name: string;
    avatar: string;
    rank: number;
  };
};

export type SearchGamesQueryVariables = Exact<{
  gamesId?: InputMaybe<Scalars["Int"]>;
  started?: InputMaybe<Scalars["Boolean"]>;
  finished?: InputMaybe<Scalars["Boolean"]>;
  gameMode?: InputMaybe<Scalars["Int"]>;
}>;

export type SearchGamesQuery = {
  __typename?: "Query";
  games: Array<{
    __typename?: "Game";
    id: number;
    gamemode: string;
    startAt?: number | null;
    finishedAt?: number | null;
    player1score: number;
    player2score: number;
    player1: {
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
      rank: number;
    };
    player2?: {
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
      rank: number;
    } | null;
  }>;
};

export type SearchUsersChannelsQueryVariables = Exact<{
  name?: InputMaybe<Scalars["String"]>;
}>;

export type SearchUsersChannelsQuery = {
  __typename?: "Query";
  users: Array<{
    __typename: "User";
    name: string;
    id: number;
    avatar: string;
  } | null>;
  channels: Array<{ __typename: "Channel"; name: string; id: number }>;
};

export type SendChannelMessageMutationVariables = Exact<{
  message: Scalars["String"];
  recipientId: Scalars["Int"];
}>;

export type SendChannelMessageMutation = {
  __typename?: "Mutation";
  sendChanelMessage: {
    __typename?: "ChannelMessage";
    id: number;
    content: string;
    sentAt: number;
    author: { __typename?: "User"; name: string; id: number };
    readBy: Array<{
      __typename?: "ChannelMessageRead";
      id: number;
      user: { __typename?: "User"; name: string; id: number };
    }>;
  };
};

export type SendDirectMessageMutationVariables = Exact<{
  message: Scalars["String"];
  recipientId: Scalars["Int"];
}>;

export type SendDirectMessageMutation = {
  __typename?: "Mutation";
  sendDirectMessage: { __typename?: "DirectMessage"; id: number };
};

export type UnblockingUserMutationVariables = Exact<{
  unblockingUserId: Scalars["Int"];
}>;

export type UnblockingUserMutation = {
  __typename?: "Mutation";
  unblockingUser: {
    __typename?: "User";
    avatar: string;
    rank: number;
    name: string;
  };
};

export type UpdateAdminsMutationVariables = Exact<{
  channelId: Scalars["Int"];
  userId: Scalars["Int"];
}>;

export type UpdateAdminsMutation = {
  __typename?: "Mutation";
  updateAdmins: {
    __typename?: "Channel";
    id: number;
    passwordProtected: boolean;
    private: boolean;
    name: string;
  };
};

export type UpdateDateBannedMutationVariables = Exact<{
  channelId: Scalars["Int"];
  userId: Scalars["Int"];
  date?: InputMaybe<Scalars["Timestamp"]>;
}>;

export type UpdateDateBannedMutation = {
  __typename?: "Mutation";
  updateBanned: { __typename?: "Channel"; id: number; name: string };
};

export type UpdateDateMutedMutationVariables = Exact<{
  channelId: Scalars["Int"];
  userId: Scalars["Int"];
  date?: InputMaybe<Scalars["Timestamp"]>;
}>;

export type UpdateDateMutedMutation = {
  __typename?: "Mutation";
  updateMuted: { __typename?: "Channel"; id: number; name: string };
};

export type UpdateFriendMutationVariables = Exact<{
  updateFriendId: Scalars["Int"];
}>;

export type UpdateFriendMutation = {
  __typename?: "Mutation";
  updateFriend: {
    __typename?: "User";
    id: number;
    name: string;
    rank: number;
    avatar: string;
  };
};

export type UpdateGameJoiningPlayerMutationVariables = Exact<{
  updateGameId: Scalars["Int"];
}>;

export type UpdateGameJoiningPlayerMutation = {
  __typename?: "Mutation";
  updateGame: {
    __typename?: "Game";
    id: number;
    gamemode: string;
    startAt?: number | null;
    finishedAt?: number | null;
    player2score: number;
    player1score: number;
    player2?: {
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
      rank: number;
    } | null;
    player1: {
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
      rank: number;
    };
  };
};

export type UpdateUnFriendMutationVariables = Exact<{
  updateUnFriendId: Scalars["Int"];
}>;

export type UpdateUnFriendMutation = {
  __typename?: "Mutation";
  updateUnFriend: {
    __typename?: "User";
    avatar: string;
    id: number;
    name: string;
    rank: number;
  };
};

export type UserProfileQueryVariables = Exact<{
  userId?: InputMaybe<Scalars["Int"]>;
}>;

export type UserProfileQuery = {
  __typename?: "Query";
  user: {
    __typename?: "User";
    id: number;
    name: string;
    avatar: string;
    rank: number;
    blocked: boolean;
    games: Array<{
      __typename?: "Game";
      player1score: number;
      player2score: number;
      gamemode: string;
      id: number;
      startAt?: number | null;
      finishedAt?: number | null;
      player1: {
        __typename?: "User";
        rank: number;
        avatar: string;
        name: string;
        id: number;
      };
      player2?: {
        __typename?: "User";
        id: number;
        name: string;
        avatar: string;
        rank: number;
      } | null;
    }>;
    friends: Array<{ __typename?: "User"; id: number }>;
  };
};

export type UserProfileHeaderQueryVariables = Exact<{
  userId?: InputMaybe<Scalars["Int"]>;
}>;

export type UserProfileHeaderQuery = {
  __typename?: "Query";
  user: {
    __typename?: "User";
    id: number;
    name: string;
    avatar: string;
    rank: number;
  };
};

export type WaitingRoomGameQueryVariables = Exact<{
  gamesId?: InputMaybe<Scalars["Int"]>;
  started?: InputMaybe<Scalars["Boolean"]>;
  finished?: InputMaybe<Scalars["Boolean"]>;
}>;

export type WaitingRoomGameQuery = {
  __typename?: "Query";
  games: Array<{
    __typename?: "Game";
    id: number;
    gamemode: string;
    startAt?: number | null;
    finishedAt?: number | null;
    player1score: number;
    player2score: number;
    player1: {
      __typename?: "User";
      id: number;
      name: string;
      avatar: string;
      rank: number;
    };
  }>;
};

export const BannedSomeoneChannelDocument = `
    mutation BannedSomeoneChannel($createMutedId: Int!, $channelId: Int!, $date: Timestamp) {
  createBanned(id: $createMutedId, channelId: $channelId, date: $date) {
    endAt
    id
    name
    avatar
    rank
  }
}
    `;
export const useBannedSomeoneChannelMutation = <
  TError = unknown,
  TContext = unknown
>(
  options?: UseMutationOptions<
    BannedSomeoneChannelMutation,
    TError,
    BannedSomeoneChannelMutationVariables,
    TContext
  >
) =>
  useMutation<
    BannedSomeoneChannelMutation,
    TError,
    BannedSomeoneChannelMutationVariables,
    TContext
  >(
    ["BannedSomeoneChannel"],
    (variables?: BannedSomeoneChannelMutationVariables) =>
      fetcher<
        BannedSomeoneChannelMutation,
        BannedSomeoneChannelMutationVariables
      >(BannedSomeoneChannelDocument, variables)(),
    options
  );
useBannedSomeoneChannelMutation.fetcher = (
  variables: BannedSomeoneChannelMutationVariables
) =>
  fetcher<BannedSomeoneChannelMutation, BannedSomeoneChannelMutationVariables>(
    BannedSomeoneChannelDocument,
    variables
  );
export const BlockSomeoneDocument = `
    mutation BlockSomeone($blockingUserId: Int!) {
  blockingUser(id: $blockingUserId) {
    id
    name
    avatar
    rank
  }
}
    `;
export const useBlockSomeoneMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    BlockSomeoneMutation,
    TError,
    BlockSomeoneMutationVariables,
    TContext
  >
) =>
  useMutation<
    BlockSomeoneMutation,
    TError,
    BlockSomeoneMutationVariables,
    TContext
  >(
    ["BlockSomeone"],
    (variables?: BlockSomeoneMutationVariables) =>
      fetcher<BlockSomeoneMutation, BlockSomeoneMutationVariables>(
        BlockSomeoneDocument,
        variables
      )(),
    options
  );
useBlockSomeoneMutation.fetcher = (variables: BlockSomeoneMutationVariables) =>
  fetcher<BlockSomeoneMutation, BlockSomeoneMutationVariables>(
    BlockSomeoneDocument,
    variables
  );
export const GetChannelHeaderDocument = `
    query GetChannelHeader($channelId: Int!) {
  channel(id: $channelId) {
    id
    name
    owner {
      name
      id
      avatar
    }
    private
    passwordProtected
  }
}
    `;
export const useGetChannelHeaderQuery = <
  TData = GetChannelHeaderQuery,
  TError = unknown
>(
  variables: GetChannelHeaderQueryVariables,
  options?: UseQueryOptions<GetChannelHeaderQuery, TError, TData>
) =>
  useQuery<GetChannelHeaderQuery, TError, TData>(
    ["GetChannelHeader", variables],
    fetcher<GetChannelHeaderQuery, GetChannelHeaderQueryVariables>(
      GetChannelHeaderDocument,
      variables
    ),
    options
  );

useGetChannelHeaderQuery.getKey = (
  variables: GetChannelHeaderQueryVariables
) => ["GetChannelHeader", variables];
useGetChannelHeaderQuery.fetcher = (
  variables: GetChannelHeaderQueryVariables
) =>
  fetcher<GetChannelHeaderQuery, GetChannelHeaderQueryVariables>(
    GetChannelHeaderDocument,
    variables
  );
export const ChannelSettingsDocument = `
    query ChannelSettings($channelId: Int!, $userId: Int) {
  channel(id: $channelId) {
    name
    id
    private
    passwordProtected
    owner {
      id
      name
      avatar
      rank
    }
    admins {
      id
      name
      avatar
      rank
    }
    members {
      id
      name
      avatar
      rank
    }
    banned {
      id
      endAt
    }
    muted {
      endAt
      id
    }
  }
  user(id: $userId) {
    id
  }
}
    `;
export const useChannelSettingsQuery = <
  TData = ChannelSettingsQuery,
  TError = unknown
>(
  variables: ChannelSettingsQueryVariables,
  options?: UseQueryOptions<ChannelSettingsQuery, TError, TData>
) =>
  useQuery<ChannelSettingsQuery, TError, TData>(
    ["ChannelSettings", variables],
    fetcher<ChannelSettingsQuery, ChannelSettingsQueryVariables>(
      ChannelSettingsDocument,
      variables
    ),
    options
  );

useChannelSettingsQuery.getKey = (variables: ChannelSettingsQueryVariables) => [
  "ChannelSettings",
  variables,
];
useChannelSettingsQuery.fetcher = (variables: ChannelSettingsQueryVariables) =>
  fetcher<ChannelSettingsQuery, ChannelSettingsQueryVariables>(
    ChannelSettingsDocument,
    variables
  );
export const CreateChanelDocument = `
    mutation CreateChanel($inviteOnly: Boolean!, $password: String!, $name: String!) {
  createChanel(inviteOnly: $inviteOnly, password: $password, name: $name) {
    id
    name
  }
}
    `;
export const useCreateChanelMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    CreateChanelMutation,
    TError,
    CreateChanelMutationVariables,
    TContext
  >
) =>
  useMutation<
    CreateChanelMutation,
    TError,
    CreateChanelMutationVariables,
    TContext
  >(
    ["CreateChanel"],
    (variables?: CreateChanelMutationVariables) =>
      fetcher<CreateChanelMutation, CreateChanelMutationVariables>(
        CreateChanelDocument,
        variables
      )(),
    options
  );
useCreateChanelMutation.fetcher = (variables: CreateChanelMutationVariables) =>
  fetcher<CreateChanelMutation, CreateChanelMutationVariables>(
    CreateChanelDocument,
    variables
  );
export const CreateGameDocument = `
    mutation CreateGame($mode: Int!, $player2Id: Int) {
  createGame(mode: $mode, player2Id: $player2Id) {
    id
    gamemode
    startAt
    finishedAt
    player1 {
      id
      name
      avatar
      rank
    }
    player2 {
      id
      name
      avatar
      rank
    }
    player1score
    player2score
  }
}
    `;
export const useCreateGameMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    CreateGameMutation,
    TError,
    CreateGameMutationVariables,
    TContext
  >
) =>
  useMutation<
    CreateGameMutation,
    TError,
    CreateGameMutationVariables,
    TContext
  >(
    ["CreateGame"],
    (variables?: CreateGameMutationVariables) =>
      fetcher<CreateGameMutation, CreateGameMutationVariables>(
        CreateGameDocument,
        variables
      )(),
    options
  );
useCreateGameMutation.fetcher = (variables: CreateGameMutationVariables) =>
  fetcher<CreateGameMutation, CreateGameMutationVariables>(
    CreateGameDocument,
    variables
  );
export const CreateReadAtMessageByIdDocument = `
    mutation CreateReadAtMessageById($userId: Int!, $messageId: Int!) {
  createChannelMessageRead(userId: $userId, messageId: $messageId) {
    id
    user {
      id
      name
      avatar
      rank
    }
    readAt
  }
}
    `;
export const useCreateReadAtMessageByIdMutation = <
  TError = unknown,
  TContext = unknown
>(
  options?: UseMutationOptions<
    CreateReadAtMessageByIdMutation,
    TError,
    CreateReadAtMessageByIdMutationVariables,
    TContext
  >
) =>
  useMutation<
    CreateReadAtMessageByIdMutation,
    TError,
    CreateReadAtMessageByIdMutationVariables,
    TContext
  >(
    ["CreateReadAtMessageById"],
    (variables?: CreateReadAtMessageByIdMutationVariables) =>
      fetcher<
        CreateReadAtMessageByIdMutation,
        CreateReadAtMessageByIdMutationVariables
      >(CreateReadAtMessageByIdDocument, variables)(),
    options
  );
useCreateReadAtMessageByIdMutation.fetcher = (
  variables: CreateReadAtMessageByIdMutationVariables
) =>
  fetcher<
    CreateReadAtMessageByIdMutation,
    CreateReadAtMessageByIdMutationVariables
  >(CreateReadAtMessageByIdDocument, variables);
export const DeleteBannedDocument = `
    mutation DeleteBanned($channel: Int!, $userId: Int!) {
  deleteBanned(channel: $channel, userId: $userId) {
    id
    name
  }
}
    `;
export const useDeleteBannedMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    DeleteBannedMutation,
    TError,
    DeleteBannedMutationVariables,
    TContext
  >
) =>
  useMutation<
    DeleteBannedMutation,
    TError,
    DeleteBannedMutationVariables,
    TContext
  >(
    ["DeleteBanned"],
    (variables?: DeleteBannedMutationVariables) =>
      fetcher<DeleteBannedMutation, DeleteBannedMutationVariables>(
        DeleteBannedDocument,
        variables
      )(),
    options
  );
useDeleteBannedMutation.fetcher = (variables: DeleteBannedMutationVariables) =>
  fetcher<DeleteBannedMutation, DeleteBannedMutationVariables>(
    DeleteBannedDocument,
    variables
  );
export const DeleteChannelDocument = `
    mutation DeleteChannel($channelId: Int!) {
  deleteChannel(channelId: $channelId) {
    id
    name
  }
}
    `;
export const useDeleteChannelMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    DeleteChannelMutation,
    TError,
    DeleteChannelMutationVariables,
    TContext
  >
) =>
  useMutation<
    DeleteChannelMutation,
    TError,
    DeleteChannelMutationVariables,
    TContext
  >(
    ["DeleteChannel"],
    (variables?: DeleteChannelMutationVariables) =>
      fetcher<DeleteChannelMutation, DeleteChannelMutationVariables>(
        DeleteChannelDocument,
        variables
      )(),
    options
  );
useDeleteChannelMutation.fetcher = (
  variables: DeleteChannelMutationVariables
) =>
  fetcher<DeleteChannelMutation, DeleteChannelMutationVariables>(
    DeleteChannelDocument,
    variables
  );
export const DeleteChannelMessageContentDocument = `
    mutation deleteChannelMessageContent($messageId: Int!) {
  deleteChannelMessageContent(messageId: $messageId) {
    id
    content
    sentAt
  }
}
    `;
export const useDeleteChannelMessageContentMutation = <
  TError = unknown,
  TContext = unknown
>(
  options?: UseMutationOptions<
    DeleteChannelMessageContentMutation,
    TError,
    DeleteChannelMessageContentMutationVariables,
    TContext
  >
) =>
  useMutation<
    DeleteChannelMessageContentMutation,
    TError,
    DeleteChannelMessageContentMutationVariables,
    TContext
  >(
    ["deleteChannelMessageContent"],
    (variables?: DeleteChannelMessageContentMutationVariables) =>
      fetcher<
        DeleteChannelMessageContentMutation,
        DeleteChannelMessageContentMutationVariables
      >(DeleteChannelMessageContentDocument, variables)(),
    options
  );
useDeleteChannelMessageContentMutation.fetcher = (
  variables: DeleteChannelMessageContentMutationVariables
) =>
  fetcher<
    DeleteChannelMessageContentMutation,
    DeleteChannelMessageContentMutationVariables
  >(DeleteChannelMessageContentDocument, variables);
export const DeleteDirectMessageContentDocument = `
    mutation deleteDirectMessageContent($messageId: Int!) {
  deleteDirectMessageContent(messageId: $messageId) {
    id
    content
  }
}
    `;
export const useDeleteDirectMessageContentMutation = <
  TError = unknown,
  TContext = unknown
>(
  options?: UseMutationOptions<
    DeleteDirectMessageContentMutation,
    TError,
    DeleteDirectMessageContentMutationVariables,
    TContext
  >
) =>
  useMutation<
    DeleteDirectMessageContentMutation,
    TError,
    DeleteDirectMessageContentMutationVariables,
    TContext
  >(
    ["deleteDirectMessageContent"],
    (variables?: DeleteDirectMessageContentMutationVariables) =>
      fetcher<
        DeleteDirectMessageContentMutation,
        DeleteDirectMessageContentMutationVariables
      >(DeleteDirectMessageContentDocument, variables)(),
    options
  );
useDeleteDirectMessageContentMutation.fetcher = (
  variables: DeleteDirectMessageContentMutationVariables
) =>
  fetcher<
    DeleteDirectMessageContentMutation,
    DeleteDirectMessageContentMutationVariables
  >(DeleteDirectMessageContentDocument, variables);
export const DeleteMutedDocument = `
    mutation DeleteMuted($channel: Int!, $userId: Int!) {
  deleteMuted(channel: $channel, userId: $userId) {
    id
    name
  }
}
    `;
export const useDeleteMutedMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    DeleteMutedMutation,
    TError,
    DeleteMutedMutationVariables,
    TContext
  >
) =>
  useMutation<
    DeleteMutedMutation,
    TError,
    DeleteMutedMutationVariables,
    TContext
  >(
    ["DeleteMuted"],
    (variables?: DeleteMutedMutationVariables) =>
      fetcher<DeleteMutedMutation, DeleteMutedMutationVariables>(
        DeleteMutedDocument,
        variables
      )(),
    options
  );
useDeleteMutedMutation.fetcher = (variables: DeleteMutedMutationVariables) =>
  fetcher<DeleteMutedMutation, DeleteMutedMutationVariables>(
    DeleteMutedDocument,
    variables
  );
export const InfoChannelDocument = `
    query InfoChannel($channelId: Int!) {
  channel(id: $channelId) {
    private
    passwordProtected
    name
    owner {
      id
      name
      avatar
    }
    messages {
      id
      author {
        id
        name
        avatar
      }
      readBy {
        user {
          id
          name
          avatar
        }
      }
      content
      sentAt
    }
    admins {
      id
      name
      avatar
    }
    members {
      id
      name
      avatar
    }
  }
}
    `;
export const useInfoChannelQuery = <TData = InfoChannelQuery, TError = unknown>(
  variables: InfoChannelQueryVariables,
  options?: UseQueryOptions<InfoChannelQuery, TError, TData>
) =>
  useQuery<InfoChannelQuery, TError, TData>(
    ["InfoChannel", variables],
    fetcher<InfoChannelQuery, InfoChannelQueryVariables>(
      InfoChannelDocument,
      variables
    ),
    options
  );

useInfoChannelQuery.getKey = (variables: InfoChannelQueryVariables) => [
  "InfoChannel",
  variables,
];
useInfoChannelQuery.fetcher = (variables: InfoChannelQueryVariables) =>
  fetcher<InfoChannelQuery, InfoChannelQueryVariables>(
    InfoChannelDocument,
    variables
  );
export const InfoChannelsDocument = `
    query InfoChannels {
  user {
    friends {
      __typename
      name
      avatar
    }
    channels {
      __typename
      name
    }
  }
}
    `;
export const useInfoChannelsQuery = <
  TData = InfoChannelsQuery,
  TError = unknown
>(
  variables?: InfoChannelsQueryVariables,
  options?: UseQueryOptions<InfoChannelsQuery, TError, TData>
) =>
  useQuery<InfoChannelsQuery, TError, TData>(
    variables === undefined ? ["InfoChannels"] : ["InfoChannels", variables],
    fetcher<InfoChannelsQuery, InfoChannelsQueryVariables>(
      InfoChannelsDocument,
      variables
    ),
    options
  );

useInfoChannelsQuery.getKey = (variables?: InfoChannelsQueryVariables) =>
  variables === undefined ? ["InfoChannels"] : ["InfoChannels", variables];
useInfoChannelsQuery.fetcher = (variables?: InfoChannelsQueryVariables) =>
  fetcher<InfoChannelsQuery, InfoChannelsQueryVariables>(
    InfoChannelsDocument,
    variables
  );
export const InfoDirectMessagesDocument = `
    query InfoDirectMessages($userId: Int) {
  user(id: $userId) {
    name
    avatar
    messages {
      recipient {
        id
        name
        avatar
      }
      author {
        id
        name
        avatar
      }
      content
      sentAt
      readAt
    }
  }
}
    `;
export const useInfoDirectMessagesQuery = <
  TData = InfoDirectMessagesQuery,
  TError = unknown
>(
  variables?: InfoDirectMessagesQueryVariables,
  options?: UseQueryOptions<InfoDirectMessagesQuery, TError, TData>
) =>
  useQuery<InfoDirectMessagesQuery, TError, TData>(
    variables === undefined
      ? ["InfoDirectMessages"]
      : ["InfoDirectMessages", variables],
    fetcher<InfoDirectMessagesQuery, InfoDirectMessagesQueryVariables>(
      InfoDirectMessagesDocument,
      variables
    ),
    options
  );

useInfoDirectMessagesQuery.getKey = (
  variables?: InfoDirectMessagesQueryVariables
) =>
  variables === undefined
    ? ["InfoDirectMessages"]
    : ["InfoDirectMessages", variables];
useInfoDirectMessagesQuery.fetcher = (
  variables?: InfoDirectMessagesQueryVariables
) =>
  fetcher<InfoDirectMessagesQuery, InfoDirectMessagesQueryVariables>(
    InfoDirectMessagesDocument,
    variables
  );
export const InfoUserProfileDocument = `
    query InfoUserProfile($userId: Int) {
  user(id: $userId) {
    id
    name
    avatar
    rank
  }
}
    `;
export const useInfoUserProfileQuery = <
  TData = InfoUserProfileQuery,
  TError = unknown
>(
  variables?: InfoUserProfileQueryVariables,
  options?: UseQueryOptions<InfoUserProfileQuery, TError, TData>
) =>
  useQuery<InfoUserProfileQuery, TError, TData>(
    variables === undefined
      ? ["InfoUserProfile"]
      : ["InfoUserProfile", variables],
    fetcher<InfoUserProfileQuery, InfoUserProfileQueryVariables>(
      InfoUserProfileDocument,
      variables
    ),
    options
  );

useInfoUserProfileQuery.getKey = (variables?: InfoUserProfileQueryVariables) =>
  variables === undefined
    ? ["InfoUserProfile"]
    : ["InfoUserProfile", variables];
useInfoUserProfileQuery.fetcher = (variables?: InfoUserProfileQueryVariables) =>
  fetcher<InfoUserProfileQuery, InfoUserProfileQueryVariables>(
    InfoUserProfileDocument,
    variables
  );
export const InfoUsersDocument = `
    query InfoUsers($userId: Int) {
  user(id: $userId) {
    id
    __typename
    name
    blocked
    blocking
    avatar
    rank
    channels {
      __typename
      name
      id
      messages {
        id
        content
        sentAt
      }
    }
    friends {
      __typename
      name
      avatar
      messages {
        content
        sentAt
      }
      id
    }
  }
}
    `;
export const useInfoUsersQuery = <TData = InfoUsersQuery, TError = unknown>(
  variables?: InfoUsersQueryVariables,
  options?: UseQueryOptions<InfoUsersQuery, TError, TData>
) =>
  useQuery<InfoUsersQuery, TError, TData>(
    variables === undefined ? ["InfoUsers"] : ["InfoUsers", variables],
    fetcher<InfoUsersQuery, InfoUsersQueryVariables>(
      InfoUsersDocument,
      variables
    ),
    options
  );

useInfoUsersQuery.getKey = (variables?: InfoUsersQueryVariables) =>
  variables === undefined ? ["InfoUsers"] : ["InfoUsers", variables];
useInfoUsersQuery.fetcher = (variables?: InfoUsersQueryVariables) =>
  fetcher<InfoUsersQuery, InfoUsersQueryVariables>(
    InfoUsersDocument,
    variables
  );
export const MutedSomeoneChannelDocument = `
    mutation MutedSomeoneChannel($createMutedId: Int!, $channelId: Int!, $date: Timestamp) {
  createMuted(id: $createMutedId, channelId: $channelId, date: $date) {
    endAt
    id
    name
    avatar
    rank
  }
}
    `;
export const useMutedSomeoneChannelMutation = <
  TError = unknown,
  TContext = unknown
>(
  options?: UseMutationOptions<
    MutedSomeoneChannelMutation,
    TError,
    MutedSomeoneChannelMutationVariables,
    TContext
  >
) =>
  useMutation<
    MutedSomeoneChannelMutation,
    TError,
    MutedSomeoneChannelMutationVariables,
    TContext
  >(
    ["MutedSomeoneChannel"],
    (variables?: MutedSomeoneChannelMutationVariables) =>
      fetcher<
        MutedSomeoneChannelMutation,
        MutedSomeoneChannelMutationVariables
      >(MutedSomeoneChannelDocument, variables)(),
    options
  );
useMutedSomeoneChannelMutation.fetcher = (
  variables: MutedSomeoneChannelMutationVariables
) =>
  fetcher<MutedSomeoneChannelMutation, MutedSomeoneChannelMutationVariables>(
    MutedSomeoneChannelDocument,
    variables
  );
export const SearchGamesDocument = `
    query SearchGames($gamesId: Int, $started: Boolean, $finished: Boolean, $gameMode: Int) {
  games(id: $gamesId, started: $started, finished: $finished, gameMode: $gameMode) {
    id
    player1 {
      id
      name
      avatar
      rank
    }
    gamemode
    startAt
    finishedAt
    player1score
    player2score
    player2 {
      id
      name
      avatar
      rank
    }
  }
}
    `;
export const useSearchGamesQuery = <TData = SearchGamesQuery, TError = unknown>(
  variables?: SearchGamesQueryVariables,
  options?: UseQueryOptions<SearchGamesQuery, TError, TData>
) =>
  useQuery<SearchGamesQuery, TError, TData>(
    variables === undefined ? ["SearchGames"] : ["SearchGames", variables],
    fetcher<SearchGamesQuery, SearchGamesQueryVariables>(
      SearchGamesDocument,
      variables
    ),
    options
  );

useSearchGamesQuery.getKey = (variables?: SearchGamesQueryVariables) =>
  variables === undefined ? ["SearchGames"] : ["SearchGames", variables];
useSearchGamesQuery.fetcher = (variables?: SearchGamesQueryVariables) =>
  fetcher<SearchGamesQuery, SearchGamesQueryVariables>(
    SearchGamesDocument,
    variables
  );
export const SearchUsersChannelsDocument = `
    query SearchUsersChannels($name: String) {
  users(name: $name) {
    __typename
    name
    id
    avatar
  }
  channels(name: $name) {
    __typename
    name
    id
    name
  }
}
    `;
export const useSearchUsersChannelsQuery = <
  TData = SearchUsersChannelsQuery,
  TError = unknown
>(
  variables?: SearchUsersChannelsQueryVariables,
  options?: UseQueryOptions<SearchUsersChannelsQuery, TError, TData>
) =>
  useQuery<SearchUsersChannelsQuery, TError, TData>(
    variables === undefined
      ? ["SearchUsersChannels"]
      : ["SearchUsersChannels", variables],
    fetcher<SearchUsersChannelsQuery, SearchUsersChannelsQueryVariables>(
      SearchUsersChannelsDocument,
      variables
    ),
    options
  );

useSearchUsersChannelsQuery.getKey = (
  variables?: SearchUsersChannelsQueryVariables
) =>
  variables === undefined
    ? ["SearchUsersChannels"]
    : ["SearchUsersChannels", variables];
useSearchUsersChannelsQuery.fetcher = (
  variables?: SearchUsersChannelsQueryVariables
) =>
  fetcher<SearchUsersChannelsQuery, SearchUsersChannelsQueryVariables>(
    SearchUsersChannelsDocument,
    variables
  );
export const SendChannelMessageDocument = `
    mutation sendChannelMessage($message: String!, $recipientId: Int!) {
  sendChanelMessage(message: $message, recipientId: $recipientId) {
    id
    author {
      name
      id
    }
    readBy {
      id
      user {
        name
        id
      }
    }
    content
    sentAt
  }
}
    `;
export const useSendChannelMessageMutation = <
  TError = unknown,
  TContext = unknown
>(
  options?: UseMutationOptions<
    SendChannelMessageMutation,
    TError,
    SendChannelMessageMutationVariables,
    TContext
  >
) =>
  useMutation<
    SendChannelMessageMutation,
    TError,
    SendChannelMessageMutationVariables,
    TContext
  >(
    ["sendChannelMessage"],
    (variables?: SendChannelMessageMutationVariables) =>
      fetcher<SendChannelMessageMutation, SendChannelMessageMutationVariables>(
        SendChannelMessageDocument,
        variables
      )(),
    options
  );
useSendChannelMessageMutation.fetcher = (
  variables: SendChannelMessageMutationVariables
) =>
  fetcher<SendChannelMessageMutation, SendChannelMessageMutationVariables>(
    SendChannelMessageDocument,
    variables
  );
export const SendDirectMessageDocument = `
    mutation SendDirectMessage($message: String!, $recipientId: Int!) {
  sendDirectMessage(message: $message, recipientId: $recipientId) {
    id
  }
}
    `;
export const useSendDirectMessageMutation = <
  TError = unknown,
  TContext = unknown
>(
  options?: UseMutationOptions<
    SendDirectMessageMutation,
    TError,
    SendDirectMessageMutationVariables,
    TContext
  >
) =>
  useMutation<
    SendDirectMessageMutation,
    TError,
    SendDirectMessageMutationVariables,
    TContext
  >(
    ["SendDirectMessage"],
    (variables?: SendDirectMessageMutationVariables) =>
      fetcher<SendDirectMessageMutation, SendDirectMessageMutationVariables>(
        SendDirectMessageDocument,
        variables
      )(),
    options
  );
useSendDirectMessageMutation.fetcher = (
  variables: SendDirectMessageMutationVariables
) =>
  fetcher<SendDirectMessageMutation, SendDirectMessageMutationVariables>(
    SendDirectMessageDocument,
    variables
  );
export const UnblockingUserDocument = `
    mutation UnblockingUser($unblockingUserId: Int!) {
  unblockingUser(id: $unblockingUserId) {
    avatar
    rank
    name
  }
}
    `;
export const useUnblockingUserMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    UnblockingUserMutation,
    TError,
    UnblockingUserMutationVariables,
    TContext
  >
) =>
  useMutation<
    UnblockingUserMutation,
    TError,
    UnblockingUserMutationVariables,
    TContext
  >(
    ["UnblockingUser"],
    (variables?: UnblockingUserMutationVariables) =>
      fetcher<UnblockingUserMutation, UnblockingUserMutationVariables>(
        UnblockingUserDocument,
        variables
      )(),
    options
  );
useUnblockingUserMutation.fetcher = (
  variables: UnblockingUserMutationVariables
) =>
  fetcher<UnblockingUserMutation, UnblockingUserMutationVariables>(
    UnblockingUserDocument,
    variables
  );
export const UpdateAdminsDocument = `
    mutation UpdateAdmins($channelId: Int!, $userId: Int!) {
  updateAdmins(channelId: $channelId, userId: $userId) {
    id
    passwordProtected
    private
    name
  }
}
    `;
export const useUpdateAdminsMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    UpdateAdminsMutation,
    TError,
    UpdateAdminsMutationVariables,
    TContext
  >
) =>
  useMutation<
    UpdateAdminsMutation,
    TError,
    UpdateAdminsMutationVariables,
    TContext
  >(
    ["UpdateAdmins"],
    (variables?: UpdateAdminsMutationVariables) =>
      fetcher<UpdateAdminsMutation, UpdateAdminsMutationVariables>(
        UpdateAdminsDocument,
        variables
      )(),
    options
  );
useUpdateAdminsMutation.fetcher = (variables: UpdateAdminsMutationVariables) =>
  fetcher<UpdateAdminsMutation, UpdateAdminsMutationVariables>(
    UpdateAdminsDocument,
    variables
  );
export const UpdateDateBannedDocument = `
    mutation UpdateDateBanned($channelId: Int!, $userId: Int!, $date: Timestamp) {
  updateBanned(channelId: $channelId, userId: $userId, date: $date) {
    id
    name
  }
}
    `;
export const useUpdateDateBannedMutation = <
  TError = unknown,
  TContext = unknown
>(
  options?: UseMutationOptions<
    UpdateDateBannedMutation,
    TError,
    UpdateDateBannedMutationVariables,
    TContext
  >
) =>
  useMutation<
    UpdateDateBannedMutation,
    TError,
    UpdateDateBannedMutationVariables,
    TContext
  >(
    ["UpdateDateBanned"],
    (variables?: UpdateDateBannedMutationVariables) =>
      fetcher<UpdateDateBannedMutation, UpdateDateBannedMutationVariables>(
        UpdateDateBannedDocument,
        variables
      )(),
    options
  );
useUpdateDateBannedMutation.fetcher = (
  variables: UpdateDateBannedMutationVariables
) =>
  fetcher<UpdateDateBannedMutation, UpdateDateBannedMutationVariables>(
    UpdateDateBannedDocument,
    variables
  );
export const UpdateDateMutedDocument = `
    mutation UpdateDateMuted($channelId: Int!, $userId: Int!, $date: Timestamp) {
  updateMuted(channelId: $channelId, userId: $userId, date: $date) {
    id
    name
  }
}
    `;
export const useUpdateDateMutedMutation = <
  TError = unknown,
  TContext = unknown
>(
  options?: UseMutationOptions<
    UpdateDateMutedMutation,
    TError,
    UpdateDateMutedMutationVariables,
    TContext
  >
) =>
  useMutation<
    UpdateDateMutedMutation,
    TError,
    UpdateDateMutedMutationVariables,
    TContext
  >(
    ["UpdateDateMuted"],
    (variables?: UpdateDateMutedMutationVariables) =>
      fetcher<UpdateDateMutedMutation, UpdateDateMutedMutationVariables>(
        UpdateDateMutedDocument,
        variables
      )(),
    options
  );
useUpdateDateMutedMutation.fetcher = (
  variables: UpdateDateMutedMutationVariables
) =>
  fetcher<UpdateDateMutedMutation, UpdateDateMutedMutationVariables>(
    UpdateDateMutedDocument,
    variables
  );
export const UpdateFriendDocument = `
    mutation UpdateFriend($updateFriendId: Int!) {
  updateFriend(id: $updateFriendId) {
    id
    name
    rank
    avatar
  }
}
    `;
export const useUpdateFriendMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    UpdateFriendMutation,
    TError,
    UpdateFriendMutationVariables,
    TContext
  >
) =>
  useMutation<
    UpdateFriendMutation,
    TError,
    UpdateFriendMutationVariables,
    TContext
  >(
    ["UpdateFriend"],
    (variables?: UpdateFriendMutationVariables) =>
      fetcher<UpdateFriendMutation, UpdateFriendMutationVariables>(
        UpdateFriendDocument,
        variables
      )(),
    options
  );
useUpdateFriendMutation.fetcher = (variables: UpdateFriendMutationVariables) =>
  fetcher<UpdateFriendMutation, UpdateFriendMutationVariables>(
    UpdateFriendDocument,
    variables
  );
export const UpdateGameJoiningPlayerDocument = `
    mutation UpdateGameJoiningPlayer($updateGameId: Int!) {
  updateGame(id: $updateGameId) {
    id
    gamemode
    startAt
    finishedAt
    player2 {
      id
      name
      avatar
      rank
    }
    player1 {
      id
      name
      avatar
      rank
    }
    player2score
    player1score
  }
}
    `;
export const useUpdateGameJoiningPlayerMutation = <
  TError = unknown,
  TContext = unknown
>(
  options?: UseMutationOptions<
    UpdateGameJoiningPlayerMutation,
    TError,
    UpdateGameJoiningPlayerMutationVariables,
    TContext
  >
) =>
  useMutation<
    UpdateGameJoiningPlayerMutation,
    TError,
    UpdateGameJoiningPlayerMutationVariables,
    TContext
  >(
    ["UpdateGameJoiningPlayer"],
    (variables?: UpdateGameJoiningPlayerMutationVariables) =>
      fetcher<
        UpdateGameJoiningPlayerMutation,
        UpdateGameJoiningPlayerMutationVariables
      >(UpdateGameJoiningPlayerDocument, variables)(),
    options
  );
useUpdateGameJoiningPlayerMutation.fetcher = (
  variables: UpdateGameJoiningPlayerMutationVariables
) =>
  fetcher<
    UpdateGameJoiningPlayerMutation,
    UpdateGameJoiningPlayerMutationVariables
  >(UpdateGameJoiningPlayerDocument, variables);
export const UpdateUnFriendDocument = `
    mutation UpdateUnFriend($updateUnFriendId: Int!) {
  updateUnFriend(id: $updateUnFriendId) {
    avatar
    id
    name
    rank
  }
}
    `;
export const useUpdateUnFriendMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    UpdateUnFriendMutation,
    TError,
    UpdateUnFriendMutationVariables,
    TContext
  >
) =>
  useMutation<
    UpdateUnFriendMutation,
    TError,
    UpdateUnFriendMutationVariables,
    TContext
  >(
    ["UpdateUnFriend"],
    (variables?: UpdateUnFriendMutationVariables) =>
      fetcher<UpdateUnFriendMutation, UpdateUnFriendMutationVariables>(
        UpdateUnFriendDocument,
        variables
      )(),
    options
  );
useUpdateUnFriendMutation.fetcher = (
  variables: UpdateUnFriendMutationVariables
) =>
  fetcher<UpdateUnFriendMutation, UpdateUnFriendMutationVariables>(
    UpdateUnFriendDocument,
    variables
  );
export const UserProfileDocument = `
    query UserProfile($userId: Int) {
  user(id: $userId) {
    id
    name
    avatar
    rank
    games {
      player1 {
        rank
        avatar
        name
        id
      }
      player2 {
        id
        name
        avatar
        rank
      }
      player1score
      player2score
      gamemode
      id
      startAt
      finishedAt
    }
    blocked
    friends {
      id
    }
  }
}
    `;
export const useUserProfileQuery = <TData = UserProfileQuery, TError = unknown>(
  variables?: UserProfileQueryVariables,
  options?: UseQueryOptions<UserProfileQuery, TError, TData>
) =>
  useQuery<UserProfileQuery, TError, TData>(
    variables === undefined ? ["UserProfile"] : ["UserProfile", variables],
    fetcher<UserProfileQuery, UserProfileQueryVariables>(
      UserProfileDocument,
      variables
    ),
    options
  );

useUserProfileQuery.getKey = (variables?: UserProfileQueryVariables) =>
  variables === undefined ? ["UserProfile"] : ["UserProfile", variables];
useUserProfileQuery.fetcher = (variables?: UserProfileQueryVariables) =>
  fetcher<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    variables
  );
export const UserProfileHeaderDocument = `
    query UserProfileHeader($userId: Int) {
  user(id: $userId) {
    id
    name
    avatar
    rank
  }
}
    `;
export const useUserProfileHeaderQuery = <
  TData = UserProfileHeaderQuery,
  TError = unknown
>(
  variables?: UserProfileHeaderQueryVariables,
  options?: UseQueryOptions<UserProfileHeaderQuery, TError, TData>
) =>
  useQuery<UserProfileHeaderQuery, TError, TData>(
    variables === undefined
      ? ["UserProfileHeader"]
      : ["UserProfileHeader", variables],
    fetcher<UserProfileHeaderQuery, UserProfileHeaderQueryVariables>(
      UserProfileHeaderDocument,
      variables
    ),
    options
  );

useUserProfileHeaderQuery.getKey = (
  variables?: UserProfileHeaderQueryVariables
) =>
  variables === undefined
    ? ["UserProfileHeader"]
    : ["UserProfileHeader", variables];
useUserProfileHeaderQuery.fetcher = (
  variables?: UserProfileHeaderQueryVariables
) =>
  fetcher<UserProfileHeaderQuery, UserProfileHeaderQueryVariables>(
    UserProfileHeaderDocument,
    variables
  );
export const WaitingRoomGameDocument = `
    query WaitingRoomGame($gamesId: Int, $started: Boolean, $finished: Boolean) {
  games(id: $gamesId, started: $started, finished: $finished) {
    id
    player1 {
      id
      name
      avatar
      rank
    }
    gamemode
    startAt
    finishedAt
    player1score
    player2score
  }
}
    `;
export const useWaitingRoomGameQuery = <
  TData = WaitingRoomGameQuery,
  TError = unknown
>(
  variables?: WaitingRoomGameQueryVariables,
  options?: UseQueryOptions<WaitingRoomGameQuery, TError, TData>
) =>
  useQuery<WaitingRoomGameQuery, TError, TData>(
    variables === undefined
      ? ["WaitingRoomGame"]
      : ["WaitingRoomGame", variables],
    fetcher<WaitingRoomGameQuery, WaitingRoomGameQueryVariables>(
      WaitingRoomGameDocument,
      variables
    ),
    options
  );

useWaitingRoomGameQuery.getKey = (variables?: WaitingRoomGameQueryVariables) =>
  variables === undefined
    ? ["WaitingRoomGame"]
    : ["WaitingRoomGame", variables];
useWaitingRoomGameQuery.fetcher = (variables?: WaitingRoomGameQueryVariables) =>
  fetcher<WaitingRoomGameQuery, WaitingRoomGameQueryVariables>(
    WaitingRoomGameDocument,
    variables
  );
