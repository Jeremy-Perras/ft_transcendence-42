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

export type Message = {
  __typename?: 'Message';
  author: User;
  content: Scalars['String'];
  sendAt: Scalars['Timestamp'];
};

export type Query = {
  __typename?: 'Query';
  findUsers?: Maybe<Array<User>>;
  whoAmI: User;
};


export type QueryFindUsersArgs = {
  name?: InputMaybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
  rank: Scalars['Int'];
};

export type FindUsersQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']>;
}>;


export type FindUsersQuery = { __typename?: 'Query', findUsers?: Array<{ __typename?: 'User', id: number, name: string, avatar?: string | null, rank: number }> | null };


export const FindUsersDocument = `
    query FindUsers($name: String) {
  findUsers(name: $name) {
    id
    name
    avatar
    rank
  }
}
    `;
export const useFindUsersQuery = <
      TData = FindUsersQuery,
      TError = unknown
    >(
      variables?: FindUsersQueryVariables,
      options?: UseQueryOptions<FindUsersQuery, TError, TData>
    ) =>
    useQuery<FindUsersQuery, TError, TData>(
      variables === undefined ? ['FindUsers'] : ['FindUsers', variables],
      fetcher<FindUsersQuery, FindUsersQueryVariables>(FindUsersDocument, variables),
      options
    );