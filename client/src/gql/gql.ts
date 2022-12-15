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
    "\n  mutation CreateChannel(\n    $inviteOnly: Boolean!\n    $password: String\n    $name: String!\n  ) {\n    createChannel(inviteOnly: $inviteOnly, password: $password, name: $name)\n  }\n": types.CreateChannelDocument,
    "\n  query UserHeader($userId: Int) {\n    user(id: $userId) {\n      id\n      name\n      avatar\n      status\n    }\n  }\n": types.UserHeaderDocument,
    "\n  query SearchUsersAndChannels($name: String!) {\n    users(name: $name) {\n      __typename\n      avatar\n      id\n      name\n      status\n    }\n    channels(name: $name) {\n      __typename\n      name\n      id\n    }\n  }\n": types.SearchUsersAndChannelsDocument,
    "\n  query ChannelDiscussion($channelId: Int!) {\n    channel(id: $channelId) {\n      name\n      private\n      passwordProtected\n      owner {\n        id\n        name\n        avatar\n      }\n      members {\n        id\n      }\n      admins {\n        id\n      }\n      messages {\n        content\n        sentAt\n        author {\n          id\n          name\n          avatar\n          status\n        }\n        readBy {\n          id\n          name\n          avatar\n          status\n        }\n      }\n      banned {\n        user {\n          id\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n    }\n  }\n": types.ChannelDiscussionDocument,
    "\n  mutation JoinChannel($channelId: Int!, $password: String) {\n    joinChannel(channelId: $channelId, password: $password)\n  }\n": types.JoinChannelDocument,
    "\n  mutation SendChannelMessage($message: String!, $channelId: Int!) {\n    sendChannelMessage(message: $message, channelId: $channelId)\n  }\n": types.SendChannelMessageDocument,
    "\n  query SearchUsers($name: String!) {\n    users(name: $name) {\n      id\n      name\n      avatar\n      status\n      channels {\n        id\n      }\n    }\n  }\n": types.SearchUsersDocument,
    "\n  query ChannelSettings($channelId: Int!) {\n    channel(id: $channelId) {\n      id\n      name\n      owner {\n        id\n        name\n        avatar\n      }\n      admins {\n        id\n        name\n        avatar\n      }\n      members {\n        id\n        name\n        avatar\n      }\n      banned {\n        user {\n          id\n          name\n          avatar\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n      passwordProtected\n      private\n    }\n  }\n": types.ChannelSettingsDocument,
    "\n  mutation BanUser(\n    $channelId: Int!\n    $restrictedId: Int!\n    $restrictUntil: Timestamp\n  ) {\n    banUser(\n      channelId: $channelId\n      userId: $restrictedId\n      restrictUntil: $restrictUntil\n    )\n  }\n": types.BanUserDocument,
    "\n  mutation UnbanUser($userId: Int!, $channelId: Int!) {\n    unbanUser(userId: $userId, channelId: $channelId)\n  }\n": types.UnbanUserDocument,
    "\n  mutation MuteUser(\n    $channelId: Int!\n    $restrictedId: Int!\n    $restrictUntil: Timestamp\n  ) {\n    muteUser(\n      channelId: $channelId\n      userId: $restrictedId\n      restrictUntil: $restrictUntil\n    )\n  }\n": types.MuteUserDocument,
    "\n  mutation UnmuteUser($userId: Int!, $channelId: Int!) {\n    unmuteUser(userId: $userId, channelId: $channelId)\n  }\n": types.UnmuteUserDocument,
    "\n  mutation AddAdmin($userId: Int!, $channelId: Int!) {\n    addAdmin(userId: $userId, channelId: $channelId)\n  }\n": types.AddAdminDocument,
    "\n  mutation RemoveAdmin($userId: Int!, $channelId: Int!) {\n    removeAdmin(userId: $userId, channelId: $channelId)\n  }\n": types.RemoveAdminDocument,
    "\n  mutation InviteUser($userId: Int!, $channelId: Int!) {\n    inviteUser(userId: $userId, channelId: $channelId)\n  }\n": types.InviteUserDocument,
    "\n  mutation LeaveChannel($channelId: Int!) {\n    leaveChannel(channelId: $channelId)\n  }\n": types.LeaveChannelDocument,
    "\n  mutation DeleteChannel($channelId: Int!) {\n    deleteChannel(channelId: $channelId)\n  }\n": types.DeleteChannelDocument,
    "\n  mutation UpdatePassword($password: String, $channelId: Int!) {\n    updatePassword(password: $password, channelId: $channelId)\n  }\n": types.UpdatePasswordDocument,
    "\n  query DirectMessages($userId: Int!) {\n    user(id: $userId) {\n      rank\n      name\n      avatar\n      status\n      messages {\n        id\n        content\n        readAt\n        sentAt\n        recipient {\n          id\n          name\n          avatar\n        }\n        author {\n          id\n          avatar\n          name\n        }\n      }\n      friendStatus\n      blocked\n      blocking\n    }\n  }\n": types.DirectMessagesDocument,
    "\n  mutation SendDirectMessage($userId: Int!, $message: String!) {\n    sendDirectMessage(userId: $userId, message: $message)\n  }\n": types.SendDirectMessageDocument,
    "\n  query DiscussionsAndInvitations($userId: Int) {\n    user(id: $userId) {\n      id\n      chats {\n        avatar\n        hasUnreadMessages\n        id\n        lastMessageContent\n        lastMessageDate\n        name\n        type\n        status\n      }\n      pendingFriends {\n        id\n        avatar\n        name\n      }\n    }\n  }\n": types.DiscussionsAndInvitationsDocument,
    "\n  mutation AcceptInvitation($userId: Int!) {\n    friendUser(userId: $userId)\n  }\n": types.AcceptInvitationDocument,
    "\n  mutation RefuseInvitation($userId: Int!) {\n    refuseInvitation(userId: $userId)\n  }\n": types.RefuseInvitationDocument,
    "\n  query UserProfile($userId: Int!) {\n    user(id: $userId) {\n      id\n      name\n      avatar\n      rank\n      games {\n        finishedAt\n        gameMode\n        players {\n          player1 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n          player2 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n        }\n        score {\n          player1Score\n          player2Score\n        }\n        startAt\n      }\n      blocked\n      blocking\n      achievements {\n        name\n      }\n      friendStatus\n      status\n    }\n  }\n": types.UserProfileDocument,
    "\n  mutation FriendUser($userId: Int!) {\n    friendUser(userId: $userId)\n  }\n": types.FriendUserDocument,
    "\n  mutation UnfriendUser($userId: Int!) {\n    unfriendUser(userId: $userId)\n  }\n": types.UnfriendUserDocument,
    "\n  mutation BlockUser($userId: Int!) {\n    blockUser(userId: $userId)\n  }\n": types.BlockUserDocument,
    "\n  mutation UnblockUser($userId: Int!) {\n    unblockUser(userId: $userId)\n  }\n": types.UnblockUserDocument,
    "\n  mutation CancelInvitation($userId: Int!) {\n    cancelInvitation(userId: $userId)\n  }\n": types.CancelInvitationDocument,
    "\n  mutation UpdateUserName($name: String!) {\n    updateUserName(name: $name)\n  }\n": types.UpdateUserNameDocument,
    "\n  query NewMessages($userId: Int) {\n    user(id: $userId) {\n      id\n      chats {\n        hasUnreadMessages\n      }\n    }\n  }\n": types.NewMessagesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateChannel(\n    $inviteOnly: Boolean!\n    $password: String\n    $name: String!\n  ) {\n    createChannel(inviteOnly: $inviteOnly, password: $password, name: $name)\n  }\n"): (typeof documents)["\n  mutation CreateChannel(\n    $inviteOnly: Boolean!\n    $password: String\n    $name: String!\n  ) {\n    createChannel(inviteOnly: $inviteOnly, password: $password, name: $name)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserHeader($userId: Int) {\n    user(id: $userId) {\n      id\n      name\n      avatar\n      status\n    }\n  }\n"): (typeof documents)["\n  query UserHeader($userId: Int) {\n    user(id: $userId) {\n      id\n      name\n      avatar\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchUsersAndChannels($name: String!) {\n    users(name: $name) {\n      __typename\n      avatar\n      id\n      name\n      status\n    }\n    channels(name: $name) {\n      __typename\n      name\n      id\n    }\n  }\n"): (typeof documents)["\n  query SearchUsersAndChannels($name: String!) {\n    users(name: $name) {\n      __typename\n      avatar\n      id\n      name\n      status\n    }\n    channels(name: $name) {\n      __typename\n      name\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChannelDiscussion($channelId: Int!) {\n    channel(id: $channelId) {\n      name\n      private\n      passwordProtected\n      owner {\n        id\n        name\n        avatar\n      }\n      members {\n        id\n      }\n      admins {\n        id\n      }\n      messages {\n        content\n        sentAt\n        author {\n          id\n          name\n          avatar\n          status\n        }\n        readBy {\n          id\n          name\n          avatar\n          status\n        }\n      }\n      banned {\n        user {\n          id\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query ChannelDiscussion($channelId: Int!) {\n    channel(id: $channelId) {\n      name\n      private\n      passwordProtected\n      owner {\n        id\n        name\n        avatar\n      }\n      members {\n        id\n      }\n      admins {\n        id\n      }\n      messages {\n        content\n        sentAt\n        author {\n          id\n          name\n          avatar\n          status\n        }\n        readBy {\n          id\n          name\n          avatar\n          status\n        }\n      }\n      banned {\n        user {\n          id\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation JoinChannel($channelId: Int!, $password: String) {\n    joinChannel(channelId: $channelId, password: $password)\n  }\n"): (typeof documents)["\n  mutation JoinChannel($channelId: Int!, $password: String) {\n    joinChannel(channelId: $channelId, password: $password)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SendChannelMessage($message: String!, $channelId: Int!) {\n    sendChannelMessage(message: $message, channelId: $channelId)\n  }\n"): (typeof documents)["\n  mutation SendChannelMessage($message: String!, $channelId: Int!) {\n    sendChannelMessage(message: $message, channelId: $channelId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchUsers($name: String!) {\n    users(name: $name) {\n      id\n      name\n      avatar\n      status\n      channels {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query SearchUsers($name: String!) {\n    users(name: $name) {\n      id\n      name\n      avatar\n      status\n      channels {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChannelSettings($channelId: Int!) {\n    channel(id: $channelId) {\n      id\n      name\n      owner {\n        id\n        name\n        avatar\n      }\n      admins {\n        id\n        name\n        avatar\n      }\n      members {\n        id\n        name\n        avatar\n      }\n      banned {\n        user {\n          id\n          name\n          avatar\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n      passwordProtected\n      private\n    }\n  }\n"): (typeof documents)["\n  query ChannelSettings($channelId: Int!) {\n    channel(id: $channelId) {\n      id\n      name\n      owner {\n        id\n        name\n        avatar\n      }\n      admins {\n        id\n        name\n        avatar\n      }\n      members {\n        id\n        name\n        avatar\n      }\n      banned {\n        user {\n          id\n          name\n          avatar\n        }\n        endAt\n      }\n      muted {\n        user {\n          id\n        }\n        endAt\n      }\n      passwordProtected\n      private\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation BanUser(\n    $channelId: Int!\n    $restrictedId: Int!\n    $restrictUntil: Timestamp\n  ) {\n    banUser(\n      channelId: $channelId\n      userId: $restrictedId\n      restrictUntil: $restrictUntil\n    )\n  }\n"): (typeof documents)["\n  mutation BanUser(\n    $channelId: Int!\n    $restrictedId: Int!\n    $restrictUntil: Timestamp\n  ) {\n    banUser(\n      channelId: $channelId\n      userId: $restrictedId\n      restrictUntil: $restrictUntil\n    )\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnbanUser($userId: Int!, $channelId: Int!) {\n    unbanUser(userId: $userId, channelId: $channelId)\n  }\n"): (typeof documents)["\n  mutation UnbanUser($userId: Int!, $channelId: Int!) {\n    unbanUser(userId: $userId, channelId: $channelId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MuteUser(\n    $channelId: Int!\n    $restrictedId: Int!\n    $restrictUntil: Timestamp\n  ) {\n    muteUser(\n      channelId: $channelId\n      userId: $restrictedId\n      restrictUntil: $restrictUntil\n    )\n  }\n"): (typeof documents)["\n  mutation MuteUser(\n    $channelId: Int!\n    $restrictedId: Int!\n    $restrictUntil: Timestamp\n  ) {\n    muteUser(\n      channelId: $channelId\n      userId: $restrictedId\n      restrictUntil: $restrictUntil\n    )\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnmuteUser($userId: Int!, $channelId: Int!) {\n    unmuteUser(userId: $userId, channelId: $channelId)\n  }\n"): (typeof documents)["\n  mutation UnmuteUser($userId: Int!, $channelId: Int!) {\n    unmuteUser(userId: $userId, channelId: $channelId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddAdmin($userId: Int!, $channelId: Int!) {\n    addAdmin(userId: $userId, channelId: $channelId)\n  }\n"): (typeof documents)["\n  mutation AddAdmin($userId: Int!, $channelId: Int!) {\n    addAdmin(userId: $userId, channelId: $channelId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveAdmin($userId: Int!, $channelId: Int!) {\n    removeAdmin(userId: $userId, channelId: $channelId)\n  }\n"): (typeof documents)["\n  mutation RemoveAdmin($userId: Int!, $channelId: Int!) {\n    removeAdmin(userId: $userId, channelId: $channelId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation InviteUser($userId: Int!, $channelId: Int!) {\n    inviteUser(userId: $userId, channelId: $channelId)\n  }\n"): (typeof documents)["\n  mutation InviteUser($userId: Int!, $channelId: Int!) {\n    inviteUser(userId: $userId, channelId: $channelId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LeaveChannel($channelId: Int!) {\n    leaveChannel(channelId: $channelId)\n  }\n"): (typeof documents)["\n  mutation LeaveChannel($channelId: Int!) {\n    leaveChannel(channelId: $channelId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteChannel($channelId: Int!) {\n    deleteChannel(channelId: $channelId)\n  }\n"): (typeof documents)["\n  mutation DeleteChannel($channelId: Int!) {\n    deleteChannel(channelId: $channelId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdatePassword($password: String, $channelId: Int!) {\n    updatePassword(password: $password, channelId: $channelId)\n  }\n"): (typeof documents)["\n  mutation UpdatePassword($password: String, $channelId: Int!) {\n    updatePassword(password: $password, channelId: $channelId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DirectMessages($userId: Int!) {\n    user(id: $userId) {\n      rank\n      name\n      avatar\n      status\n      messages {\n        id\n        content\n        readAt\n        sentAt\n        recipient {\n          id\n          name\n          avatar\n        }\n        author {\n          id\n          avatar\n          name\n        }\n      }\n      friendStatus\n      blocked\n      blocking\n    }\n  }\n"): (typeof documents)["\n  query DirectMessages($userId: Int!) {\n    user(id: $userId) {\n      rank\n      name\n      avatar\n      status\n      messages {\n        id\n        content\n        readAt\n        sentAt\n        recipient {\n          id\n          name\n          avatar\n        }\n        author {\n          id\n          avatar\n          name\n        }\n      }\n      friendStatus\n      blocked\n      blocking\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SendDirectMessage($userId: Int!, $message: String!) {\n    sendDirectMessage(userId: $userId, message: $message)\n  }\n"): (typeof documents)["\n  mutation SendDirectMessage($userId: Int!, $message: String!) {\n    sendDirectMessage(userId: $userId, message: $message)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DiscussionsAndInvitations($userId: Int) {\n    user(id: $userId) {\n      id\n      chats {\n        avatar\n        hasUnreadMessages\n        id\n        lastMessageContent\n        lastMessageDate\n        name\n        type\n        status\n      }\n      pendingFriends {\n        id\n        avatar\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query DiscussionsAndInvitations($userId: Int) {\n    user(id: $userId) {\n      id\n      chats {\n        avatar\n        hasUnreadMessages\n        id\n        lastMessageContent\n        lastMessageDate\n        name\n        type\n        status\n      }\n      pendingFriends {\n        id\n        avatar\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AcceptInvitation($userId: Int!) {\n    friendUser(userId: $userId)\n  }\n"): (typeof documents)["\n  mutation AcceptInvitation($userId: Int!) {\n    friendUser(userId: $userId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RefuseInvitation($userId: Int!) {\n    refuseInvitation(userId: $userId)\n  }\n"): (typeof documents)["\n  mutation RefuseInvitation($userId: Int!) {\n    refuseInvitation(userId: $userId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserProfile($userId: Int!) {\n    user(id: $userId) {\n      id\n      name\n      avatar\n      rank\n      games {\n        finishedAt\n        gameMode\n        players {\n          player1 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n          player2 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n        }\n        score {\n          player1Score\n          player2Score\n        }\n        startAt\n      }\n      blocked\n      blocking\n      achievements {\n        name\n      }\n      friendStatus\n      status\n    }\n  }\n"): (typeof documents)["\n  query UserProfile($userId: Int!) {\n    user(id: $userId) {\n      id\n      name\n      avatar\n      rank\n      games {\n        finishedAt\n        gameMode\n        players {\n          player1 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n          player2 {\n            avatar\n            status\n            name\n            rank\n            id\n          }\n        }\n        score {\n          player1Score\n          player2Score\n        }\n        startAt\n      }\n      blocked\n      blocking\n      achievements {\n        name\n      }\n      friendStatus\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation FriendUser($userId: Int!) {\n    friendUser(userId: $userId)\n  }\n"): (typeof documents)["\n  mutation FriendUser($userId: Int!) {\n    friendUser(userId: $userId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnfriendUser($userId: Int!) {\n    unfriendUser(userId: $userId)\n  }\n"): (typeof documents)["\n  mutation UnfriendUser($userId: Int!) {\n    unfriendUser(userId: $userId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation BlockUser($userId: Int!) {\n    blockUser(userId: $userId)\n  }\n"): (typeof documents)["\n  mutation BlockUser($userId: Int!) {\n    blockUser(userId: $userId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnblockUser($userId: Int!) {\n    unblockUser(userId: $userId)\n  }\n"): (typeof documents)["\n  mutation UnblockUser($userId: Int!) {\n    unblockUser(userId: $userId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CancelInvitation($userId: Int!) {\n    cancelInvitation(userId: $userId)\n  }\n"): (typeof documents)["\n  mutation CancelInvitation($userId: Int!) {\n    cancelInvitation(userId: $userId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUserName($name: String!) {\n    updateUserName(name: $name)\n  }\n"): (typeof documents)["\n  mutation UpdateUserName($name: String!) {\n    updateUserName(name: $name)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query NewMessages($userId: Int) {\n    user(id: $userId) {\n      id\n      chats {\n        hasUnreadMessages\n      }\n    }\n  }\n"): (typeof documents)["\n  query NewMessages($userId: Int) {\n    user(id: $userId) {\n      id\n      chats {\n        hasUnreadMessages\n      }\n    }\n  }\n"];

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