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
  player2: User;
  player2score: Scalars["Int"];
  startAt?: Maybe<Scalars["Timestamp"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  CreateGame: Game;
  createBanned: RestrictedMember;
  createChanel: Channel;
  createChannelMessageRead: ChannelMessageRead;
  createMuted: RestrictedMember;
  sendChanelMessage: ChannelMessage;
  sendDirectMessage: DirectMessage;
};

export type MutationCreateGameArgs = {
  mode: Scalars["Int"];
  player2Id?: InputMaybe<Scalars["Int"]>;
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

export type MutationCreateMutedArgs = {
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["String"]>;
  id: Scalars["Int"];
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
  game: Game;
  games: Array<Game>;
  joinGame: Game;
  updateAdmins: Channel;
  updateBanned: Channel;
  updateFriend: User;
  updateFriendBy: User;
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

export type QueryGameArgs = {
  id: Scalars["Int"];
};

export type QueryGamesArgs = {
  finished?: InputMaybe<Scalars["Boolean"]>;
  id?: InputMaybe<Scalars["Int"]>;
};

export type QueryJoinGameArgs = {
  id: Scalars["Int"];
};

export type QueryUpdateAdminsArgs = {
  id: Scalars["Int"];
  userId: Scalars["Int"];
};

export type QueryUpdateBannedArgs = {
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["String"]>;
  id: Scalars["Int"];
  idchannel: Scalars["Int"];
  userId: Scalars["Int"];
};

export type QueryUpdateFriendArgs = {
  id: Scalars["Int"];
};

export type QueryUpdateFriendByArgs = {
  id: Scalars["Int"];
  meId: Scalars["Int"];
};

export type QueryUpdateMutedArgs = {
  channelId: Scalars["Int"];
  date?: InputMaybe<Scalars["String"]>;
  id: Scalars["Int"];
  idchannel: Scalars["Int"];
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

export type CreateChanelMutationVariables = Exact<{
  inviteOnly: Scalars["Boolean"];
  password: Scalars["String"];
  name: Scalars["String"];
}>;

export type CreateChanelMutation = {
  __typename?: "Mutation";
  createChanel: { __typename?: "Channel"; id: number; name: string };
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

export type GetChannelQueryVariables = Exact<{
  channelId: Scalars["Int"];
}>;

export type GetChannelQuery = {
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

export type GetChannelsQueryVariables = Exact<{ [key: string]: never }>;

export type GetChannelsQuery = {
  __typename?: "Query";
  user: {
    __typename?: "User";
    friends: Array<{ __typename: "User"; name: string; avatar: string }>;
    channels: Array<{ __typename: "Channel"; name: string }>;
  };
};

export type GetDirectMessagesQueryVariables = Exact<{
  userId?: InputMaybe<Scalars["Int"]>;
}>;

export type GetDirectMessagesQuery = {
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

export type GetInfoUsersQueryVariables = Exact<{
  userId?: InputMaybe<Scalars["Int"]>;
}>;

export type GetInfoUsersQuery = {
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
  };
};

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
export const GetChannelDocument = `
    query GetChannel($channelId: Int!) {
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
export const useGetChannelQuery = <TData = GetChannelQuery, TError = unknown>(
  variables: GetChannelQueryVariables,
  options?: UseQueryOptions<GetChannelQuery, TError, TData>
) =>
  useQuery<GetChannelQuery, TError, TData>(
    ["GetChannel", variables],
    fetcher<GetChannelQuery, GetChannelQueryVariables>(
      GetChannelDocument,
      variables
    ),
    options
  );
export const GetChannelsDocument = `
    query GetChannels {
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
export const useGetChannelsQuery = <TData = GetChannelsQuery, TError = unknown>(
  variables?: GetChannelsQueryVariables,
  options?: UseQueryOptions<GetChannelsQuery, TError, TData>
) =>
  useQuery<GetChannelsQuery, TError, TData>(
    variables === undefined ? ["GetChannels"] : ["GetChannels", variables],
    fetcher<GetChannelsQuery, GetChannelsQueryVariables>(
      GetChannelsDocument,
      variables
    ),
    options
  );
export const GetDirectMessagesDocument = `
    query GetDirectMessages($userId: Int) {
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
export const useGetDirectMessagesQuery = <
  TData = GetDirectMessagesQuery,
  TError = unknown
>(
  variables?: GetDirectMessagesQueryVariables,
  options?: UseQueryOptions<GetDirectMessagesQuery, TError, TData>
) =>
  useQuery<GetDirectMessagesQuery, TError, TData>(
    variables === undefined
      ? ["GetDirectMessages"]
      : ["GetDirectMessages", variables],
    fetcher<GetDirectMessagesQuery, GetDirectMessagesQueryVariables>(
      GetDirectMessagesDocument,
      variables
    ),
    options
  );
export const GetInfoUsersDocument = `
    query GetInfoUsers($userId: Int) {
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
export const useGetInfoUsersQuery = <
  TData = GetInfoUsersQuery,
  TError = unknown
>(
  variables?: GetInfoUsersQueryVariables,
  options?: UseQueryOptions<GetInfoUsersQuery, TError, TData>
) =>
  useQuery<GetInfoUsersQuery, TError, TData>(
    variables === undefined ? ["GetInfoUsers"] : ["GetInfoUsers", variables],
    fetcher<GetInfoUsersQuery, GetInfoUsersQueryVariables>(
      GetInfoUsersDocument,
      variables
    ),
    options
  );
export const GetUserProfileDocument = `
    query GetUserProfile($userId: Int) {
  user(id: $userId) {
    id
    name
    avatar
    rank
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
