import { useQuery, UseQueryOptions } from "@tanstack/react-query";
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
  id: Scalars["Int"];
  members: Array<User>;
  messages: Array<ChannelMessage>;
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

export type Query = {
  __typename?: "Query";
  channel: Channel;
  channels: Array<Channel>;
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

export type QueryUserArgs = {
  id?: InputMaybe<Scalars["Int"]>;
};

export type QueryUsersArgs = {
  name?: InputMaybe<Scalars["String"]>;
};

export type User = {
  __typename?: "User";
  avatar: Scalars["String"];
  blocked: Scalars["Boolean"];
  blocking: Scalars["Boolean"];
  channels: Array<Channel>;
  friends: Array<User>;
  id: Scalars["Int"];
  messages: Array<DirectMessage>;
  name: Scalars["String"];
  rank: Scalars["Int"];
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

export type GetChatQueryVariables = Exact<{ [key: string]: never }>;

export type GetChatQuery = {
  __typename?: "Query";
  user: {
    __typename?: "User";
    friends: Array<{ __typename: "User"; name: string; avatar: string }>;
    channels: Array<{ __typename: "Channel"; name: string }>;
  };
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

export type DirectMessagesQueryVariables = Exact<{
  userId?: InputMaybe<Scalars["Int"]>;
}>;

export type DirectMessagesQuery = {
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
export const GetChatDocument = `
    query getChat {
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
export const useGetChatQuery = <TData = GetChatQuery, TError = unknown>(
  variables?: GetChatQueryVariables,
  options?: UseQueryOptions<GetChatQuery, TError, TData>
) =>
  useQuery<GetChatQuery, TError, TData>(
    variables === undefined ? ["getChat"] : ["getChat", variables],
    fetcher<GetChatQuery, GetChatQueryVariables>(GetChatDocument, variables),
    options
  );
export const GetChannelDocument = `
    query getChannel($channelId: Int!) {
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
    ["getChannel", variables],
    fetcher<GetChannelQuery, GetChannelQueryVariables>(
      GetChannelDocument,
      variables
    ),
    options
  );
export const DirectMessagesDocument = `
    query DirectMessages($userId: Int) {
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
export const useDirectMessagesQuery = <
  TData = DirectMessagesQuery,
  TError = unknown
>(
  variables?: DirectMessagesQueryVariables,
  options?: UseQueryOptions<DirectMessagesQuery, TError, TData>
) =>
  useQuery<DirectMessagesQuery, TError, TData>(
    variables === undefined
      ? ["DirectMessages"]
      : ["DirectMessages", variables],
    fetcher<DirectMessagesQuery, DirectMessagesQueryVariables>(
      DirectMessagesDocument,
      variables
    ),
    options
  );
export const GetInfoUsersDocument = `
    query getInfoUsers($userId: Int) {
  user(id: $userId) {
    id
    __typename
    name
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
    variables === undefined ? ["getInfoUsers"] : ["getInfoUsers", variables],
    fetcher<GetInfoUsersQuery, GetInfoUsersQueryVariables>(
      GetInfoUsersDocument,
      variables
    ),
    options
  );
