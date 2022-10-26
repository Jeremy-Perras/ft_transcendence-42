import { useQuery, UseQueryOptions } from '@tanstack/react-query';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch("http://localhost:3000/graphql", {
    method: "POST",
    ...({"headers":{"Content-Type":"application/json"}}),
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  }
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** `Date` type as integer. Type represents date and time as number of milliseconds from start of UNIX epoch. */
  Timestamp: any;
};

export type Channel = {
  __typename?: 'Channel';
  admins?: Maybe<Array<User>>;
  id: Scalars['Int'];
  members?: Maybe<Array<User>>;
  messages?: Maybe<Array<ChannelMessage>>;
  name: Scalars['String'];
  owner: User;
  passwordProtected: Scalars['Boolean'];
  private: Scalars['Boolean'];
  typename: Scalars['String'];
};

export type ChannelMessage = {
  __typename?: 'ChannelMessage';
  author: User;
  content: Scalars['String'];
  id: Scalars['Int'];
  readBy: Array<ChannelMessageRead>;
  sentAt: Scalars['Timestamp'];
  typename: Scalars['String'];
};

export type ChannelMessageRead = {
  __typename?: 'ChannelMessageRead';
  id: Scalars['Int'];
  readAt: Scalars['Timestamp'];
  typename: Scalars['String'];
  user: User;
};

export type DirectMessage = {
  __typename?: 'DirectMessage';
  author: User;
  content: Scalars['String'];
  id: Scalars['Int'];
  readAt?: Maybe<Scalars['Timestamp']>;
  recipient: User;
  sentAt: Scalars['Timestamp'];
  typename: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  channel: Channel;
  channels: Array<Channel>;
  user: User;
  users: Array<User>;
};


export type QueryChannelArgs = {
  id: Scalars['Int'];
};


export type QueryChannelsArgs = {
  adminId?: InputMaybe<Scalars['Int']>;
  memberId?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  ownerId?: InputMaybe<Scalars['Int']>;
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['Int']>;
};


export type QueryUsersArgs = {
  name?: InputMaybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  avatar: Scalars['String'];
  blocked: Scalars['Boolean'];
  blocking: Scalars['Boolean'];
  channels: Array<Channel>;
  friends: Array<User>;
  id: Scalars['Int'];
  messages: Array<DirectMessage>;
  name: Scalars['String'];
  rank: Scalars['Int'];
  typename: Scalars['String'];
};

export type GetChatQueryVariables = Exact<{ [key: string]: never; }>;


export type GetChatQuery = { __typename?: 'Query', user: { __typename?: 'User', friends: Array<{ __typename?: 'User', typename: string, name: string, avatar: string }>, channels: Array<{ __typename?: 'Channel', typename: string, name: string }> } };

export type GetChannelsMessagesQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']>;
}>;


export type GetChannelsMessagesQuery = { __typename?: 'Query', channels: Array<{ __typename?: 'Channel', messages?: Array<{ __typename?: 'ChannelMessage', sentAt: any, content: string, readBy: Array<{ __typename?: 'ChannelMessageRead', user: { __typename?: 'User', name: string } }>, author: { __typename?: 'User', name: string } }> | null }> };

export type GetInfoUsersQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['Int']>;
}>;


export type GetInfoUsersQuery = { __typename?: 'Query', user: { __typename?: 'User', typename: string, name: string, avatar: string, rank: number, channels: Array<{ __typename?: 'Channel', typename: string, name: string, admins?: Array<{ __typename?: 'User', typename: string, name: string }> | null }>, friends: Array<{ __typename?: 'User', typename: string, name: string, rank: number }> } };


export const GetChatDocument = `
    query getChat {
  user {
    friends {
      typename
      name
      avatar
    }
    channels {
      typename
      name
    }
  }
}
    `;
export const useGetChatQuery = <
      TData = GetChatQuery,
      TError = unknown
    >(
      variables?: GetChatQueryVariables,
      options?: UseQueryOptions<GetChatQuery, TError, TData>
    ) =>
    useQuery<GetChatQuery, TError, TData>(
      variables === undefined ? ['getChat'] : ['getChat', variables],
      fetcher<GetChatQuery, GetChatQueryVariables>(GetChatDocument, variables),
      options
    );
export const GetChannelsMessagesDocument = `
    query getChannelsMessages($name: String) {
  channels(name: $name) {
    messages {
      sentAt
      content
      readBy {
        user {
          name
        }
      }
      author {
        name
      }
    }
  }
}
    `;
export const useGetChannelsMessagesQuery = <
      TData = GetChannelsMessagesQuery,
      TError = unknown
    >(
      variables?: GetChannelsMessagesQueryVariables,
      options?: UseQueryOptions<GetChannelsMessagesQuery, TError, TData>
    ) =>
    useQuery<GetChannelsMessagesQuery, TError, TData>(
      variables === undefined ? ['getChannelsMessages'] : ['getChannelsMessages', variables],
      fetcher<GetChannelsMessagesQuery, GetChannelsMessagesQueryVariables>(GetChannelsMessagesDocument, variables),
      options
    );
export const GetInfoUsersDocument = `
    query getInfoUsers($userId: Int) {
  user(id: $userId) {
    typename
    name
    avatar
    rank
    channels {
      typename
      name
      admins {
        typename
        name
      }
    }
    friends {
      typename
      name
      rank
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
      variables === undefined ? ['getInfoUsers'] : ['getInfoUsers', variables],
      fetcher<GetInfoUsersQuery, GetInfoUsersQueryVariables>(GetInfoUsersDocument, variables),
      options
    );