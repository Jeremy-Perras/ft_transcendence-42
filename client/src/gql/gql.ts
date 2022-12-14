/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel-plugin for production.
 */
const documents = {
    "\n  query ChannelDiscussionQuery($channelId: Int!) {\n    channel(id: $channelId) {\n      name\n      private\n      passwordProtected\n      owner {\n        id\n        name\n        avatar\n      }\n      members {\n        id\n      }\n      admins {\n        id\n      }\n      messages {\n        content\n        sentAt\n        author {\n          id\n          name\n          avatar\n          status\n        }\n        readBy {\n          id\n          name\n          avatar\n          status\n        }\n      }\n      banned {\n        user {\n          id\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n    }\n  }\n": types.ChannelDiscussionQueryDocument,
    "\n  query SearchUsers($name: String!) {\n    users(name: $name) {\n      id\n      name\n      avatar\n      status\n      channels {\n        id\n      }\n    }\n  }\n": types.SearchUsersDocument,
    "\n  query ChannelSettings($channelId: Int!) {\n    channel(id: $channelId) {\n      id\n      name\n      owner {\n        id\n        name\n        avatar\n      }\n      admins {\n        id\n      }\n      members {\n        id\n        name\n        avatar\n      }\n      banned {\n        user {\n          id\n          name\n          avatar\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n      passwordProtected\n      private\n    }\n  }\n": types.ChannelSettingsDocument,
    "\n  query DirectMessagesQuery($userId: Int!) {\n    user(id: $userId) {\n      rank\n      name\n      avatar\n      status\n      messages {\n        id\n        content\n        readAt\n        sentAt\n        recipient {\n          id\n          name\n          avatar\n        }\n        author {\n          id\n          avatar\n          name\n        }\n      }\n      friendStatus\n      blocked\n      blocking\n    }\n  }\n": types.DirectMessagesQueryDocument,
    "\n  query DiscussionsAndInvitations($userId: Int) {\n    user(id: $userId) {\n      id\n      chats {\n        avatar\n        hasUnreadMessages\n        id\n        lastMessageContent\n        lastMessageDate\n        name\n        type\n        status\n      }\n      pendingFriends {\n        id\n        avatar\n        name\n      }\n    }\n  }\n": types.DiscussionsAndInvitationsDocument,
    "\n  query UserProfileQuery($userId: Int!) {\n    user(id: $userId) {\n      id\n      name\n      avatar\n      rank\n      games {\n        finishedAt\n        gameMode\n        players {\n          player1 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n          player2 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n        }\n        score {\n          player1Score\n          player2Score\n        }\n        startAt\n      }\n      blocked\n      blocking\n      achievements {\n        name\n      }\n      friendStatus\n      status\n    }\n  }\n": types.UserProfileQueryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChannelDiscussionQuery($channelId: Int!) {\n    channel(id: $channelId) {\n      name\n      private\n      passwordProtected\n      owner {\n        id\n        name\n        avatar\n      }\n      members {\n        id\n      }\n      admins {\n        id\n      }\n      messages {\n        content\n        sentAt\n        author {\n          id\n          name\n          avatar\n          status\n        }\n        readBy {\n          id\n          name\n          avatar\n          status\n        }\n      }\n      banned {\n        user {\n          id\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChannelDiscussionQuery($channelId: Int!) {\n    channel(id: $channelId) {\n      name\n      private\n      passwordProtected\n      owner {\n        id\n        name\n        avatar\n      }\n      members {\n        id\n      }\n      admins {\n        id\n      }\n      messages {\n        content\n        sentAt\n        author {\n          id\n          name\n          avatar\n          status\n        }\n        readBy {\n          id\n          name\n          avatar\n          status\n        }\n      }\n      banned {\n        user {\n          id\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchUsers($name: String!) {\n    users(name: $name) {\n      id\n      name\n      avatar\n      status\n      channels {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query SearchUsers($name: String!) {\n    users(name: $name) {\n      id\n      name\n      avatar\n      status\n      channels {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChannelSettings($channelId: Int!) {\n    channel(id: $channelId) {\n      id\n      name\n      owner {\n        id\n        name\n        avatar\n      }\n      admins {\n        id\n      }\n      members {\n        id\n        name\n        avatar\n      }\n      banned {\n        user {\n          id\n          name\n          avatar\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n      passwordProtected\n      private\n    }\n  }\n"): (typeof documents)["\n  query ChannelSettings($channelId: Int!) {\n    channel(id: $channelId) {\n      id\n      name\n      owner {\n        id\n        name\n        avatar\n      }\n      admins {\n        id\n      }\n      members {\n        id\n        name\n        avatar\n      }\n      banned {\n        user {\n          id\n          name\n          avatar\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n      passwordProtected\n      private\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DirectMessagesQuery($userId: Int!) {\n    user(id: $userId) {\n      rank\n      name\n      avatar\n      status\n      messages {\n        id\n        content\n        readAt\n        sentAt\n        recipient {\n          id\n          name\n          avatar\n        }\n        author {\n          id\n          avatar\n          name\n        }\n      }\n      friendStatus\n      blocked\n      blocking\n    }\n  }\n"): (typeof documents)["\n  query DirectMessagesQuery($userId: Int!) {\n    user(id: $userId) {\n      rank\n      name\n      avatar\n      status\n      messages {\n        id\n        content\n        readAt\n        sentAt\n        recipient {\n          id\n          name\n          avatar\n        }\n        author {\n          id\n          avatar\n          name\n        }\n      }\n      friendStatus\n      blocked\n      blocking\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DiscussionsAndInvitations($userId: Int) {\n    user(id: $userId) {\n      id\n      chats {\n        avatar\n        hasUnreadMessages\n        id\n        lastMessageContent\n        lastMessageDate\n        name\n        type\n        status\n      }\n      pendingFriends {\n        id\n        avatar\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query DiscussionsAndInvitations($userId: Int) {\n    user(id: $userId) {\n      id\n      chats {\n        avatar\n        hasUnreadMessages\n        id\n        lastMessageContent\n        lastMessageDate\n        name\n        type\n        status\n      }\n      pendingFriends {\n        id\n        avatar\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserProfileQuery($userId: Int!) {\n    user(id: $userId) {\n      id\n      name\n      avatar\n      rank\n      games {\n        finishedAt\n        gameMode\n        players {\n          player1 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n          player2 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n        }\n        score {\n          player1Score\n          player2Score\n        }\n        startAt\n      }\n      blocked\n      blocking\n      achievements {\n        name\n      }\n      friendStatus\n      status\n    }\n  }\n"): (typeof documents)["\n  query UserProfileQuery($userId: Int!) {\n    user(id: $userId) {\n      id\n      name\n      avatar\n      rank\n      games {\n        finishedAt\n        gameMode\n        players {\n          player1 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n          player2 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n        }\n        score {\n          player1Score\n          player2Score\n        }\n        startAt\n      }\n      blocked\n      blocking\n      achievements {\n        name\n      }\n      friendStatus\n      status\n    }\n  }\n"];

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
**/
export function graphql(source: string): unknown;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;