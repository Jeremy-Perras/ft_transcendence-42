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
  createBanned: RestrictedMember;
  createChanel: Channel;
  createChannelMessageRead: ChannelMessageRead;
  createGame: Game;
  createMuted: RestrictedMember;
  deleteChannel: Channel;
  sendChanelMessage: ChannelMessage;
  sendDirectMessage: DirectMessage;
};

export type MutationCreateBannedArgs = {
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["String"]>;
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
  date?: InputMaybe<Scalars["String"]>;
  id: Scalars["Int"];
};

export type MutationDeleteChannelArgs = {
  channelId: Scalars["Int"];
};

export type MutationSendChanelMessageArgs = {
  message: Scalars["String"];
  recipientId: Scalars["Int"];
};

export type MutationSendDirectMessageArgs = {
  message: Scalars["String"];
  recipientId: Scalars["Int"];
};

export type Query = {
  __typename?: "Query";
  blockedBy: User;
  blockingUser: User;
  channel: Channel;
  channels: Array<Channel>;
  deleteChannelMessageContent: ChannelMessage;
  deleteDirectMessageContent: DirectMessage;
  game: Game;
  games: Array<Game>;
  updateAdmins: Channel;
  updateBanned: Channel;
  updateFriend: User;
  updateFriendBy: User;
  updateGame: Game;
  updateMuted: Channel;
  updatePassword: Channel;
  user: User;
  userAvatar: User;
  userName: User;
  users: Array<Maybe<User>>;
};

export type QueryBlockedByArgs = {
  id: Scalars["Int"];
  myId: Scalars["Int"];
};

export type QueryBlockingUserArgs = {
  id: Scalars["Int"];
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

export type QueryDeleteChannelMessageContentArgs = {
  messageId: Scalars["Int"];
};

export type QueryDeleteDirectMessageContentArgs = {
  messageId: Scalars["Int"];
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

export type QueryUpdateAdminsArgs = {
  id: Scalars["Int"];
  userId: Scalars["Int"];
};

export type QueryUpdateBannedArgs = {
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["String"]>;
  userId: Scalars["Int"];
};

export type QueryUpdateFriendArgs = {
  id: Scalars["Int"];
};

export type QueryUpdateFriendByArgs = {
  id: Scalars["Int"];
  meId: Scalars["Int"];
};

export type QueryUpdateGameArgs = {
  id: Scalars["Int"];
};

export type QueryUpdateMutedArgs = {
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["String"]>;
  userId: Scalars["Int"];
};

export type QueryUpdatePasswordArgs = {
  idchannel: Scalars["Int"];
  password?: InputMaybe<Scalars["String"]>;
};

export type QueryUserArgs = {
  id?: InputMaybe<Scalars["Int"]>;
};

export type QueryUserAvatarArgs = {
  avatar: Scalars["String"];
};

export type QueryUserNameArgs = {
  name: Scalars["String"];
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
  date?: InputMaybe<Scalars["String"]>;
}>;

export type BannedSomeoneChannelMutation = {
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

export type DeleteChannelMutationVariables = Exact<{
  channelId: Scalars["Int"];
}>;

export type DeleteChannelMutation = {
  __typename?: "Mutation";
  deleteChannel: { __typename?: "Channel"; id: number; name: string };
};

export type DeleteChannelMessageContentQueryVariables = Exact<{
  messageId: Scalars["Int"];
}>;

export type DeleteChannelMessageContentQuery = {
  __typename?: "Query";
  deleteChannelMessageContent: {
    __typename?: "ChannelMessage";
    id: number;
    content: string;
    sentAt: number;
  };
};

export type DeleteDirectMessageContentQueryVariables = Exact<{
  messageId: Scalars["Int"];
}>;

export type DeleteDirectMessageContentQuery = {
  __typename?: "Query";
  deleteDirectMessageContent: {
    __typename?: "DirectMessage";
    id: number;
    content: string;
  };
};

export type GetUserProfileQueryVariables = Exact<{
  userId?: InputMaybe<Scalars["Int"]>;
}>;

export type GetUserProfileQuery = {
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
    owner: { __typename?: "User"; name: string; id: number };
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
  date?: InputMaybe<Scalars["String"]>;
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

export type UpdateDateBannedQueryVariables = Exact<{
  channelId: Scalars["Int"];
  userId: Scalars["Int"];
  date?: InputMaybe<Scalars["String"]>;
}>;

export type UpdateDateBannedQuery = {
  __typename?: "Query";
  updateBanned: { __typename?: "Channel"; id: number; name: string };
};

export type UpdateDateMutedQueryVariables = Exact<{
  channelId: Scalars["Int"];
  userId: Scalars["Int"];
  date?: InputMaybe<Scalars["String"]>;
}>;

export type UpdateDateMutedQuery = {
  __typename?: "Query";
  updateMuted: { __typename?: "Channel"; id: number; name: string };
};

export type UpdateGameJoiningPlayerQueryVariables = Exact<{
  updateGameId: Scalars["Int"];
}>;

export type UpdateGameJoiningPlayerQuery = {
  __typename?: "Query";
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
    mutation BannedSomeoneChannel($createMutedId: Int!, $channelId: Int!, $date: String) {
  createMuted(id: $createMutedId, channelId: $channelId, date: $date) {
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
export const DeleteChannelMessageContentDocument = `
    query deleteChannelMessageContent($messageId: Int!) {
  deleteChannelMessageContent(messageId: $messageId) {
    id
    content
    sentAt
  }
}
    `;
export const useDeleteChannelMessageContentQuery = <
  TData = DeleteChannelMessageContentQuery,
  TError = unknown
>(
  variables: DeleteChannelMessageContentQueryVariables,
  options?: UseQueryOptions<DeleteChannelMessageContentQuery, TError, TData>
) =>
  useQuery<DeleteChannelMessageContentQuery, TError, TData>(
    ["deleteChannelMessageContent", variables],
    fetcher<
      DeleteChannelMessageContentQuery,
      DeleteChannelMessageContentQueryVariables
    >(DeleteChannelMessageContentDocument, variables),
    options
  );
export const DeleteDirectMessageContentDocument = `
    query deleteDirectMessageContent($messageId: Int!) {
  deleteDirectMessageContent(messageId: $messageId) {
    id
    content
  }
}
    `;
export const useDeleteDirectMessageContentQuery = <
  TData = DeleteDirectMessageContentQuery,
  TError = unknown
>(
  variables: DeleteDirectMessageContentQueryVariables,
  options?: UseQueryOptions<DeleteDirectMessageContentQuery, TError, TData>
) =>
  useQuery<DeleteDirectMessageContentQuery, TError, TData>(
    ["deleteDirectMessageContent", variables],
    fetcher<
      DeleteDirectMessageContentQuery,
      DeleteDirectMessageContentQueryVariables
    >(DeleteDirectMessageContentDocument, variables),
    options
  );
export const GetUserProfileDocument = `
    query GetUserProfile($userId: Int) {
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
export const useGetUserProfileQuery = <
  TData = GetUserProfileQuery,
  TError = unknown
>(
  variables?: GetUserProfileQueryVariables,
  options?: UseQueryOptions<GetUserProfileQuery, TError, TData>
) =>
  useQuery<GetUserProfileQuery, TError, TData>(
    variables === undefined
      ? ["GetUserProfile"]
      : ["GetUserProfile", variables],
    fetcher<GetUserProfileQuery, GetUserProfileQueryVariables>(
      GetUserProfileDocument,
      variables
    ),
    options
  );
export const InfoChannelDocument = `
    query InfoChannel($channelId: Int!) {
  channel(id: $channelId) {
    private
    passwordProtected
    name
    owner {
      name
      id
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
export const MutedSomeoneChannelDocument = `
    mutation MutedSomeoneChannel($createMutedId: Int!, $channelId: Int!, $date: String) {
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
export const UpdateDateBannedDocument = `
    query UpdateDateBanned($channelId: Int!, $userId: Int!, $date: String) {
  updateBanned(channelId: $channelId, userId: $userId, date: $date) {
    id
    name
  }
}
    `;
export const useUpdateDateBannedQuery = <
  TData = UpdateDateBannedQuery,
  TError = unknown
>(
  variables: UpdateDateBannedQueryVariables,
  options?: UseQueryOptions<UpdateDateBannedQuery, TError, TData>
) =>
  useQuery<UpdateDateBannedQuery, TError, TData>(
    ["UpdateDateBanned", variables],
    fetcher<UpdateDateBannedQuery, UpdateDateBannedQueryVariables>(
      UpdateDateBannedDocument,
      variables
    ),
    options
  );
export const UpdateDateMutedDocument = `
    query UpdateDateMuted($channelId: Int!, $userId: Int!, $date: String) {
  updateMuted(channelId: $channelId, userId: $userId, date: $date) {
    id
    name
  }
}
    `;
export const useUpdateDateMutedQuery = <
  TData = UpdateDateMutedQuery,
  TError = unknown
>(
  variables: UpdateDateMutedQueryVariables,
  options?: UseQueryOptions<UpdateDateMutedQuery, TError, TData>
) =>
  useQuery<UpdateDateMutedQuery, TError, TData>(
    ["UpdateDateMuted", variables],
    fetcher<UpdateDateMutedQuery, UpdateDateMutedQueryVariables>(
      UpdateDateMutedDocument,
      variables
    ),
    options
  );
export const UpdateGameJoiningPlayerDocument = `
    query UpdateGameJoiningPlayer($updateGameId: Int!) {
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
export const useUpdateGameJoiningPlayerQuery = <
  TData = UpdateGameJoiningPlayerQuery,
  TError = unknown
>(
  variables: UpdateGameJoiningPlayerQueryVariables,
  options?: UseQueryOptions<UpdateGameJoiningPlayerQuery, TError, TData>
) =>
  useQuery<UpdateGameJoiningPlayerQuery, TError, TData>(
    ["UpdateGameJoiningPlayer", variables],
    fetcher<
      UpdateGameJoiningPlayerQuery,
      UpdateGameJoiningPlayerQueryVariables
    >(UpdateGameJoiningPlayerDocument, variables),
    options
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
