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
};

export type ChannelMessage = {
  __typename?: 'ChannelMessage';
  author: User;
  content: Scalars['String'];
  id: Scalars['Int'];
  readBy: Array<ChannelMessageRead>;
  sentAt: Scalars['Timestamp'];
};

export type ChannelMessageRead = {
  __typename?: 'ChannelMessageRead';
  id: Scalars['Int'];
  readAt: Scalars['Timestamp'];
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
  friends: Array<User>;
  id: Scalars['Int'];
  messages: Array<DirectMessage>;
  name: Scalars['String'];
  rank: Scalars['Int'];
};

export type ChannelsFromIdQueryVariables = Exact<{
  memberId?: InputMaybe<Scalars['Int']>;
}>;


export type ChannelsFromIdQuery = { __typename?: 'Query', channels: Array<{ __typename?: 'Channel', name: string, members?: Array<{ __typename?: 'User', name: string }> | null, admins?: Array<{ __typename?: 'User', name: string }> | null }> };

export type GetFriendsQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['Int']>;
}>;


export type GetFriendsQuery = { __typename?: 'Query', user: { __typename?: 'User', friends: Array<{ __typename?: 'User', avatar: string, rank: number, name: string }> } };


export const ChannelsFromIdDocument = `
    query ChannelsFromId($memberId: Int) {
  channels(memberId: $memberId) {
    name
    members {
      name
    }
    admins {
      name
    }
  }
}
    `;
export const useChannelsFromIdQuery = <
      TData = ChannelsFromIdQuery,
      TError = unknown
    >(
      variables?: ChannelsFromIdQueryVariables,
      options?: UseQueryOptions<ChannelsFromIdQuery, TError, TData>
    ) =>
    useQuery<ChannelsFromIdQuery, TError, TData>(
      variables === undefined ? ['ChannelsFromId'] : ['ChannelsFromId', variables],
      fetcher<ChannelsFromIdQuery, ChannelsFromIdQueryVariables>(ChannelsFromIdDocument, variables),
      options
    );
export const GetFriendsDocument = `
    query getFriends($userId: Int) {
  user(id: $userId) {
    friends {
      avatar
      rank
      name
    }
  }
}
    `;
export const useGetFriendsQuery = <
      TData = GetFriendsQuery,
      TError = unknown
    >(
      variables?: GetFriendsQueryVariables,
      options?: UseQueryOptions<GetFriendsQuery, TError, TData>
    ) =>
    useQuery<GetFriendsQuery, TError, TData>(
      variables === undefined ? ['getFriends'] : ['getFriends', variables],
      fetcher<GetFriendsQuery, GetFriendsQueryVariables>(GetFriendsDocument, variables),
      options
    );