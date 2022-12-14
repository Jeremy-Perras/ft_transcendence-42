/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** `Date` type as integer. Type represents date and time as number of milliseconds from start of UNIX epoch. */
  Timestamp: number;
};

export type Achievement = {
  __typename?: 'Achievement';
  name: Scalars['String'];
};

export type Channel = {
  __typename?: 'Channel';
  admins: Array<User>;
  banned: Array<ChannelRestrictedUser>;
  id: Scalars['Int'];
  members: Array<User>;
  messages: Array<ChannelMessage>;
  muted: Array<ChannelRestrictedUser>;
  name: Scalars['String'];
  owner: User;
  passwordProtected: Scalars['Boolean'];
  private: Scalars['Boolean'];
};

export type ChannelMessage = {
  __typename?: 'ChannelMessage';
  author: User;
  authorId: Scalars['Int'];
  content?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  readBy: Array<User>;
  sentAt: Scalars['Timestamp'];
};

export type ChannelRestrictedUser = {
  __typename?: 'ChannelRestrictedUser';
  endAt?: Maybe<Scalars['Timestamp']>;
  user: User;
};

export type Chat = {
  __typename?: 'Chat';
  avatar?: Maybe<Scalars['String']>;
  hasUnreadMessages: Scalars['Boolean'];
  id: Scalars['Int'];
  lastMessageContent?: Maybe<Scalars['String']>;
  lastMessageDate?: Maybe<Scalars['Timestamp']>;
  name: Scalars['String'];
  status?: Maybe<UserStatus>;
  type: ChatType;
};

export enum ChatType {
  Channel = 'CHANNEL',
  User = 'USER'
}

export type DirectMessage = {
  __typename?: 'DirectMessage';
  author: User;
  content: Scalars['String'];
  id: Scalars['Int'];
  readAt?: Maybe<Scalars['Timestamp']>;
  recipient: User;
  sentAt: Scalars['Timestamp'];
};

export enum FriendStatus {
  Friend = 'FRIEND',
  InvitationReceived = 'INVITATION_RECEIVED',
  InvitationSend = 'INVITATION_SEND',
  NotFriend = 'NOT_FRIEND'
}

export type Game = {
  __typename?: 'Game';
  finishedAt?: Maybe<Scalars['Timestamp']>;
  gameMode: GameMode;
  id: Scalars['Int'];
  players: Players;
  score: Score;
  startAt: Scalars['Timestamp'];
};

export enum GameMode {
  Classic = 'CLASSIC',
  Random = 'RANDOM',
  Speed = 'SPEED'
}

export type Mutation = {
  __typename?: 'Mutation';
  addAdmin: Scalars['Boolean'];
  banUser: Scalars['Boolean'];
  blockUser: Scalars['Boolean'];
  cancelInvitation: Scalars['Boolean'];
  createChannel: Scalars['Boolean'];
  deleteChannel: Scalars['Boolean'];
  friendUser: Scalars['Boolean'];
  inviteUser: Scalars['Boolean'];
  joinChannel: Scalars['Boolean'];
  leaveChannel: Scalars['Boolean'];
  muteUser: Scalars['Boolean'];
  refuseInvitation: Scalars['Boolean'];
  removeAdmin: Scalars['Boolean'];
  sendChannelMessage: Scalars['Boolean'];
  sendDirectMessage: Scalars['Boolean'];
  unbanUser: Scalars['Boolean'];
  unblockUser: Scalars['Boolean'];
  unfriendUser: Scalars['Boolean'];
  unmuteUser: Scalars['Boolean'];
  updatePassword: Scalars['Boolean'];
  updateUserName: Scalars['Boolean'];
};


export type MutationAddAdminArgs = {
  channelId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationBanUserArgs = {
  channelId: Scalars['Int'];
  restrictUntil?: InputMaybe<Scalars['Timestamp']>;
  userId: Scalars['Int'];
};


export type MutationBlockUserArgs = {
  userId: Scalars['Int'];
};


export type MutationCancelInvitationArgs = {
  userId: Scalars['Int'];
};


export type MutationCreateChannelArgs = {
  inviteOnly: Scalars['Boolean'];
  name: Scalars['String'];
  password?: InputMaybe<Scalars['String']>;
};


export type MutationDeleteChannelArgs = {
  channelId: Scalars['Int'];
};


export type MutationFriendUserArgs = {
  userId: Scalars['Int'];
};


export type MutationInviteUserArgs = {
  channelId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationJoinChannelArgs = {
  channelId: Scalars['Int'];
  password?: InputMaybe<Scalars['String']>;
};


export type MutationLeaveChannelArgs = {
  channelId: Scalars['Int'];
};


export type MutationMuteUserArgs = {
  channelId: Scalars['Int'];
  restrictUntil?: InputMaybe<Scalars['Timestamp']>;
  userId: Scalars['Int'];
};


export type MutationRefuseInvitationArgs = {
  userId: Scalars['Int'];
};


export type MutationRemoveAdminArgs = {
  channelId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationSendChannelMessageArgs = {
  channelId: Scalars['Int'];
  message: Scalars['String'];
};


export type MutationSendDirectMessageArgs = {
  message: Scalars['String'];
  userId: Scalars['Int'];
};


export type MutationUnbanUserArgs = {
  channelId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationUnblockUserArgs = {
  userId: Scalars['Int'];
};


export type MutationUnfriendUserArgs = {
  userId: Scalars['Int'];
};


export type MutationUnmuteUserArgs = {
  channelId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationUpdatePasswordArgs = {
  channelId: Scalars['Int'];
  password?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateUserNameArgs = {
  name: Scalars['String'];
};

export type Players = {
  __typename?: 'Players';
  player1: User;
  player2: User;
};

export type Query = {
  __typename?: 'Query';
  channel: Channel;
  channels: Array<Channel>;
  game: Game;
  games: Array<Game>;
  user: User;
  users: Array<Maybe<User>>;
};


export type QueryChannelArgs = {
  id: Scalars['Int'];
};


export type QueryChannelsArgs = {
  name: Scalars['String'];
};


export type QueryGameArgs = {
  id: Scalars['Int'];
};


export type QueryGamesArgs = {
  finished?: InputMaybe<Scalars['Boolean']>;
  gameMode?: InputMaybe<GameMode>;
  id?: InputMaybe<Scalars['Int']>;
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['Int']>;
};


export type QueryUsersArgs = {
  name: Scalars['String'];
};

export type Score = {
  __typename?: 'Score';
  player1Score: Scalars['Int'];
  player2Score: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  achievements: Array<Achievement>;
  avatar: Scalars['String'];
  blocked: Scalars['Boolean'];
  blocking: Scalars['Boolean'];
  channels: Array<Channel>;
  chats: Array<Chat>;
  friendStatus?: Maybe<FriendStatus>;
  friends: Array<User>;
  games: Array<Game>;
  id: Scalars['Int'];
  messages: Array<DirectMessage>;
  name: Scalars['String'];
  pendingFriends: Array<User>;
  rank: Scalars['Int'];
  status: UserStatus;
};


export type UserGamesArgs = {
  finished?: InputMaybe<Scalars['Boolean']>;
};

export enum UserStatus {
  Offline = 'OFFLINE',
  Online = 'ONLINE',
  Playing = 'PLAYING'
}

export type CreateChannelMutationVariables = Exact<{
  inviteOnly: Scalars['Boolean'];
  password?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
}>;


export type CreateChannelMutation = { __typename?: 'Mutation', createChannel: boolean };

export type UserHeaderQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['Int']>;
}>;


export type UserHeaderQuery = { __typename?: 'Query', user: { __typename?: 'User', id: number, name: string, avatar: string, status: UserStatus } };

export type SearchUsersAndChannelsQueryVariables = Exact<{
  name: Scalars['String'];
}>;


export type SearchUsersAndChannelsQuery = { __typename?: 'Query', users: Array<{ __typename: 'User', avatar: string, id: number, name: string, status: UserStatus } | null>, channels: Array<{ __typename: 'Channel', name: string, id: number }> };

export type ChannelDiscussionQueryVariables = Exact<{
  channelId: Scalars['Int'];
}>;


export type ChannelDiscussionQuery = { __typename?: 'Query', channel: { __typename?: 'Channel', name: string, private: boolean, passwordProtected: boolean, owner: { __typename?: 'User', id: number, name: string, avatar: string }, members: Array<{ __typename?: 'User', id: number }>, admins: Array<{ __typename?: 'User', id: number }>, messages: Array<{ __typename?: 'ChannelMessage', content?: string | null, sentAt: number, author: { __typename?: 'User', id: number, name: string, avatar: string, status: UserStatus }, readBy: Array<{ __typename?: 'User', id: number, name: string, avatar: string, status: UserStatus }> }>, banned: Array<{ __typename?: 'ChannelRestrictedUser', endAt?: number | null, user: { __typename?: 'User', id: number } }>, muted: Array<{ __typename?: 'ChannelRestrictedUser', endAt?: number | null, user: { __typename?: 'User', id: number } }> } };

export type JoinChannelMutationVariables = Exact<{
  channelId: Scalars['Int'];
  password?: InputMaybe<Scalars['String']>;
}>;


export type JoinChannelMutation = { __typename?: 'Mutation', joinChannel: boolean };

export type SendChannelMessageMutationVariables = Exact<{
  message: Scalars['String'];
  channelId: Scalars['Int'];
}>;


export type SendChannelMessageMutation = { __typename?: 'Mutation', sendChannelMessage: boolean };

export type SearchUsersQueryVariables = Exact<{
  name: Scalars['String'];
}>;


export type SearchUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: number, name: string, avatar: string, status: UserStatus, channels: Array<{ __typename?: 'Channel', id: number }> } | null> };

export type ChannelSettingsQueryVariables = Exact<{
  channelId: Scalars['Int'];
}>;


export type ChannelSettingsQuery = { __typename?: 'Query', channel: { __typename?: 'Channel', id: number, name: string, passwordProtected: boolean, private: boolean, owner: { __typename?: 'User', id: number, name: string, avatar: string }, admins: Array<{ __typename?: 'User', id: number }>, members: Array<{ __typename?: 'User', id: number, name: string, avatar: string }>, banned: Array<{ __typename?: 'ChannelRestrictedUser', endAt?: number | null, user: { __typename?: 'User', id: number, name: string, avatar: string } }>, muted: Array<{ __typename?: 'ChannelRestrictedUser', endAt?: number | null, user: { __typename?: 'User', id: number } }> } };

export type DirectMessagesQueryVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type DirectMessagesQuery = { __typename?: 'Query', user: { __typename?: 'User', rank: number, name: string, avatar: string, status: UserStatus, friendStatus?: FriendStatus | null, blocked: boolean, blocking: boolean, messages: Array<{ __typename?: 'DirectMessage', id: number, content: string, readAt?: number | null, sentAt: number, recipient: { __typename?: 'User', id: number, name: string, avatar: string }, author: { __typename?: 'User', id: number, avatar: string, name: string } }> } };

export type SendDirectMessageMutationVariables = Exact<{
  userId: Scalars['Int'];
  message: Scalars['String'];
}>;


export type SendDirectMessageMutation = { __typename?: 'Mutation', sendDirectMessage: boolean };

export type DiscussionsAndInvitationsQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['Int']>;
}>;


export type DiscussionsAndInvitationsQuery = { __typename?: 'Query', user: { __typename?: 'User', id: number, chats: Array<{ __typename?: 'Chat', avatar?: string | null, hasUnreadMessages: boolean, id: number, lastMessageContent?: string | null, lastMessageDate?: number | null, name: string, type: ChatType, status?: UserStatus | null }>, pendingFriends: Array<{ __typename?: 'User', id: number, avatar: string, name: string }> } };

export type AcceptInvitationMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type AcceptInvitationMutation = { __typename?: 'Mutation', friendUser: boolean };

export type RefuseInvitationMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type RefuseInvitationMutation = { __typename?: 'Mutation', refuseInvitation: boolean };

export type UserProfileQueryVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type UserProfileQuery = { __typename?: 'Query', user: { __typename?: 'User', id: number, name: string, avatar: string, rank: number, blocked: boolean, blocking: boolean, friendStatus?: FriendStatus | null, status: UserStatus, games: Array<{ __typename?: 'Game', finishedAt?: number | null, gameMode: GameMode, startAt: number, players: { __typename?: 'Players', player1: { __typename?: 'User', avatar: string, status: UserStatus, name: string, rank: number, id: number }, player2: { __typename?: 'User', avatar: string, status: UserStatus, name: string, rank: number, id: number } }, score: { __typename?: 'Score', player1Score: number, player2Score: number } }>, achievements: Array<{ __typename?: 'Achievement', name: string }> } };

export type FriendUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type FriendUserMutation = { __typename?: 'Mutation', friendUser: boolean };

export type UnfriendUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type UnfriendUserMutation = { __typename?: 'Mutation', unfriendUser: boolean };

export type BlockUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type BlockUserMutation = { __typename?: 'Mutation', blockUser: boolean };

export type UnblockUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type UnblockUserMutation = { __typename?: 'Mutation', unblockUser: boolean };

export type CancelInvitationMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type CancelInvitationMutation = { __typename?: 'Mutation', cancelInvitation: boolean };

export type UpdateUserNameMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type UpdateUserNameMutation = { __typename?: 'Mutation', updateUserName: boolean };

export type NewMessagesQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['Int']>;
}>;


export type NewMessagesQuery = { __typename?: 'Query', user: { __typename?: 'User', id: number, chats: Array<{ __typename?: 'Chat', hasUnreadMessages: boolean }> } };


export const CreateChannelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateChannel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"inviteOnly"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createChannel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"inviteOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"inviteOnly"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}]}]}}]} as unknown as DocumentNode<CreateChannelMutation, CreateChannelMutationVariables>;
export const UserHeaderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserHeader"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UserHeaderQuery, UserHeaderQueryVariables>;
export const SearchUsersAndChannelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchUsersAndChannels"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SearchUsersAndChannelsQuery, SearchUsersAndChannelsQueryVariables>;
export const ChannelDiscussionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChannelDiscussion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"channelId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"channelId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"private"}},{"kind":"Field","name":{"kind":"Name","value":"passwordProtected"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"admins"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"readBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"banned"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"endAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"muted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"endAt"}}]}}]}}]}}]} as unknown as DocumentNode<ChannelDiscussionQuery, ChannelDiscussionQueryVariables>;
export const JoinChannelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinChannel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"channelId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinChannel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"channelId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"channelId"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}]}}]} as unknown as DocumentNode<JoinChannelMutation, JoinChannelMutationVariables>;
export const SendChannelMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendChannelMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"message"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"channelId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendChannelMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"message"}}},{"kind":"Argument","name":{"kind":"Name","value":"channelId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"channelId"}}}]}]}}]} as unknown as DocumentNode<SendChannelMessageMutation, SendChannelMessageMutationVariables>;
export const SearchUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"channels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<SearchUsersQuery, SearchUsersQueryVariables>;
export const ChannelSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChannelSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"channelId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"channelId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"admins"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"banned"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"endAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"muted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"endAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"passwordProtected"}},{"kind":"Field","name":{"kind":"Name","value":"private"}}]}}]}}]} as unknown as DocumentNode<ChannelSettingsQuery, ChannelSettingsQueryVariables>;
export const DirectMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DirectMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"friendStatus"}},{"kind":"Field","name":{"kind":"Name","value":"blocked"}},{"kind":"Field","name":{"kind":"Name","value":"blocking"}}]}}]}}]} as unknown as DocumentNode<DirectMessagesQuery, DirectMessagesQueryVariables>;
export const SendDirectMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendDirectMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"message"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendDirectMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"message"}}}]}]}}]} as unknown as DocumentNode<SendDirectMessageMutation, SendDirectMessageMutationVariables>;
export const DiscussionsAndInvitationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DiscussionsAndInvitations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"chats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"hasUnreadMessages"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lastMessageContent"}},{"kind":"Field","name":{"kind":"Name","value":"lastMessageDate"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pendingFriends"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<DiscussionsAndInvitationsQuery, DiscussionsAndInvitationsQueryVariables>;
export const AcceptInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"friendUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<AcceptInvitationMutation, AcceptInvitationMutationVariables>;
export const RefuseInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefuseInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refuseInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<RefuseInvitationMutation, RefuseInvitationMutationVariables>;
export const UserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"rank"}},{"kind":"Field","name":{"kind":"Name","value":"games"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"gameMode"}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"player1"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rank"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"player2"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rank"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"score"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"player1Score"}},{"kind":"Field","name":{"kind":"Name","value":"player2Score"}}]}},{"kind":"Field","name":{"kind":"Name","value":"startAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"blocked"}},{"kind":"Field","name":{"kind":"Name","value":"blocking"}},{"kind":"Field","name":{"kind":"Name","value":"achievements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"friendStatus"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UserProfileQuery, UserProfileQueryVariables>;
export const FriendUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FriendUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"friendUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<FriendUserMutation, FriendUserMutationVariables>;
export const UnfriendUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnfriendUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unfriendUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<UnfriendUserMutation, UnfriendUserMutationVariables>;
export const BlockUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BlockUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<BlockUserMutation, BlockUserMutationVariables>;
export const UnblockUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnblockUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unblockUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<UnblockUserMutation, UnblockUserMutationVariables>;
export const CancelInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<CancelInvitationMutation, CancelInvitationMutationVariables>;
export const UpdateUserNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserName"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}]}]}}]} as unknown as DocumentNode<UpdateUserNameMutation, UpdateUserNameMutationVariables>;
export const NewMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NewMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"chats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasUnreadMessages"}}]}}]}}]}}]} as unknown as DocumentNode<NewMessagesQuery, NewMessagesQueryVariables>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** `Date` type as integer. Type represents date and time as number of milliseconds from start of UNIX epoch. */
  Timestamp: number;
};

export type Achievement = {
  __typename?: 'Achievement';
  name: Scalars['String'];
};

export type Channel = {
  __typename?: 'Channel';
  admins: Array<User>;
  banned: Array<ChannelRestrictedUser>;
  id: Scalars['Int'];
  members: Array<User>;
  messages: Array<ChannelMessage>;
  muted: Array<ChannelRestrictedUser>;
  name: Scalars['String'];
  owner: User;
  passwordProtected: Scalars['Boolean'];
  private: Scalars['Boolean'];
};

export type ChannelMessage = {
  __typename?: 'ChannelMessage';
  author: User;
  authorId: Scalars['Int'];
  content?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  readBy: Array<User>;
  sentAt: Scalars['Timestamp'];
};

export type ChannelRestrictedUser = {
  __typename?: 'ChannelRestrictedUser';
  endAt?: Maybe<Scalars['Timestamp']>;
  user: User;
};

export type Chat = {
  __typename?: 'Chat';
  avatar?: Maybe<Scalars['String']>;
  hasUnreadMessages: Scalars['Boolean'];
  id: Scalars['Int'];
  lastMessageContent?: Maybe<Scalars['String']>;
  lastMessageDate?: Maybe<Scalars['Timestamp']>;
  name: Scalars['String'];
  status?: Maybe<UserStatus>;
  type: ChatType;
};

export enum ChatType {
  Channel = 'CHANNEL',
  User = 'USER'
}

export type DirectMessage = {
  __typename?: 'DirectMessage';
  author: User;
  content: Scalars['String'];
  id: Scalars['Int'];
  readAt?: Maybe<Scalars['Timestamp']>;
  recipient: User;
  sentAt: Scalars['Timestamp'];
};

export enum FriendStatus {
  Friend = 'FRIEND',
  InvitationReceived = 'INVITATION_RECEIVED',
  InvitationSend = 'INVITATION_SEND',
  NotFriend = 'NOT_FRIEND'
}

export type Game = {
  __typename?: 'Game';
  finishedAt?: Maybe<Scalars['Timestamp']>;
  gameMode: GameMode;
  id: Scalars['Int'];
  players: Players;
  score: Score;
  startAt: Scalars['Timestamp'];
};

export enum GameMode {
  Classic = 'CLASSIC',
  Random = 'RANDOM',
  Speed = 'SPEED'
}

export type Mutation = {
  __typename?: 'Mutation';
  addAdmin: Scalars['Boolean'];
  banUser: Scalars['Boolean'];
  blockUser: Scalars['Boolean'];
  cancelInvitation: Scalars['Boolean'];
  createChannel: Scalars['Boolean'];
  deleteChannel: Scalars['Boolean'];
  friendUser: Scalars['Boolean'];
  inviteUser: Scalars['Boolean'];
  joinChannel: Scalars['Boolean'];
  leaveChannel: Scalars['Boolean'];
  muteUser: Scalars['Boolean'];
  refuseInvitation: Scalars['Boolean'];
  removeAdmin: Scalars['Boolean'];
  sendChannelMessage: Scalars['Boolean'];
  sendDirectMessage: Scalars['Boolean'];
  unbanUser: Scalars['Boolean'];
  unblockUser: Scalars['Boolean'];
  unfriendUser: Scalars['Boolean'];
  unmuteUser: Scalars['Boolean'];
  updatePassword: Scalars['Boolean'];
  updateUserName: Scalars['Boolean'];
};


export type MutationAddAdminArgs = {
  channelId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationBanUserArgs = {
  channelId: Scalars['Int'];
  restrictUntil?: InputMaybe<Scalars['Timestamp']>;
  userId: Scalars['Int'];
};


export type MutationBlockUserArgs = {
  userId: Scalars['Int'];
};


export type MutationCancelInvitationArgs = {
  userId: Scalars['Int'];
};


export type MutationCreateChannelArgs = {
  inviteOnly: Scalars['Boolean'];
  name: Scalars['String'];
  password?: InputMaybe<Scalars['String']>;
};


export type MutationDeleteChannelArgs = {
  channelId: Scalars['Int'];
};


export type MutationFriendUserArgs = {
  userId: Scalars['Int'];
};


export type MutationInviteUserArgs = {
  channelId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationJoinChannelArgs = {
  channelId: Scalars['Int'];
  password?: InputMaybe<Scalars['String']>;
};


export type MutationLeaveChannelArgs = {
  channelId: Scalars['Int'];
};


export type MutationMuteUserArgs = {
  channelId: Scalars['Int'];
  restrictUntil?: InputMaybe<Scalars['Timestamp']>;
  userId: Scalars['Int'];
};


export type MutationRefuseInvitationArgs = {
  userId: Scalars['Int'];
};


export type MutationRemoveAdminArgs = {
  channelId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationSendChannelMessageArgs = {
  channelId: Scalars['Int'];
  message: Scalars['String'];
};


export type MutationSendDirectMessageArgs = {
  message: Scalars['String'];
  userId: Scalars['Int'];
};


export type MutationUnbanUserArgs = {
  channelId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationUnblockUserArgs = {
  userId: Scalars['Int'];
};


export type MutationUnfriendUserArgs = {
  userId: Scalars['Int'];
};


export type MutationUnmuteUserArgs = {
  channelId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationUpdatePasswordArgs = {
  channelId: Scalars['Int'];
  password?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateUserNameArgs = {
  name: Scalars['String'];
};

export type Players = {
  __typename?: 'Players';
  player1: User;
  player2: User;
};

export type Query = {
  __typename?: 'Query';
  channel: Channel;
  channels: Array<Channel>;
  game: Game;
  games: Array<Game>;
  user: User;
  users: Array<Maybe<User>>;
};


export type QueryChannelArgs = {
  id: Scalars['Int'];
};


export type QueryChannelsArgs = {
  name: Scalars['String'];
};


export type QueryGameArgs = {
  id: Scalars['Int'];
};


export type QueryGamesArgs = {
  finished?: InputMaybe<Scalars['Boolean']>;
  gameMode?: InputMaybe<GameMode>;
  id?: InputMaybe<Scalars['Int']>;
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['Int']>;
};


export type QueryUsersArgs = {
  name: Scalars['String'];
};

export type Score = {
  __typename?: 'Score';
  player1Score: Scalars['Int'];
  player2Score: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  achievements: Array<Achievement>;
  avatar: Scalars['String'];
  blocked: Scalars['Boolean'];
  blocking: Scalars['Boolean'];
  channels: Array<Channel>;
  chats: Array<Chat>;
  friendStatus?: Maybe<FriendStatus>;
  friends: Array<User>;
  games: Array<Game>;
  id: Scalars['Int'];
  messages: Array<DirectMessage>;
  name: Scalars['String'];
  pendingFriends: Array<User>;
  rank: Scalars['Int'];
  status: UserStatus;
};


export type UserGamesArgs = {
  finished?: InputMaybe<Scalars['Boolean']>;
};

export enum UserStatus {
  Offline = 'OFFLINE',
  Online = 'ONLINE',
  Playing = 'PLAYING'
}

export type CreateChannelMutationVariables = Exact<{
  inviteOnly: Scalars['Boolean'];
  password?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
}>;


export type CreateChannelMutation = { __typename?: 'Mutation', createChannel: boolean };

export type UserHeaderQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['Int']>;
}>;


export type UserHeaderQuery = { __typename?: 'Query', user: { __typename?: 'User', id: number, name: string, avatar: string, status: UserStatus } };

export type SearchUsersAndChannelsQueryVariables = Exact<{
  name: Scalars['String'];
}>;


export type SearchUsersAndChannelsQuery = { __typename?: 'Query', users: Array<{ __typename: 'User', avatar: string, id: number, name: string, status: UserStatus } | null>, channels: Array<{ __typename: 'Channel', name: string, id: number }> };

export type ChannelDiscussionQueryVariables = Exact<{
  channelId: Scalars['Int'];
}>;


export type ChannelDiscussionQuery = { __typename?: 'Query', channel: { __typename?: 'Channel', name: string, private: boolean, passwordProtected: boolean, owner: { __typename?: 'User', id: number, name: string, avatar: string }, members: Array<{ __typename?: 'User', id: number }>, admins: Array<{ __typename?: 'User', id: number }>, messages: Array<{ __typename?: 'ChannelMessage', content?: string | null, sentAt: number, author: { __typename?: 'User', id: number, name: string, avatar: string, status: UserStatus }, readBy: Array<{ __typename?: 'User', id: number, name: string, avatar: string, status: UserStatus }> }>, banned: Array<{ __typename?: 'ChannelRestrictedUser', endAt?: number | null, user: { __typename?: 'User', id: number } }>, muted: Array<{ __typename?: 'ChannelRestrictedUser', endAt?: number | null, user: { __typename?: 'User', id: number } }> } };

export type JoinChannelMutationVariables = Exact<{
  channelId: Scalars['Int'];
  password?: InputMaybe<Scalars['String']>;
}>;


export type JoinChannelMutation = { __typename?: 'Mutation', joinChannel: boolean };

export type SendChannelMessageMutationVariables = Exact<{
  message: Scalars['String'];
  channelId: Scalars['Int'];
}>;


export type SendChannelMessageMutation = { __typename?: 'Mutation', sendChannelMessage: boolean };

export type SearchUsersQueryVariables = Exact<{
  name: Scalars['String'];
}>;


export type SearchUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: number, name: string, avatar: string, status: UserStatus, channels: Array<{ __typename?: 'Channel', id: number }> } | null> };

export type ChannelSettingsQueryVariables = Exact<{
  channelId: Scalars['Int'];
}>;


export type ChannelSettingsQuery = { __typename?: 'Query', channel: { __typename?: 'Channel', id: number, name: string, passwordProtected: boolean, private: boolean, owner: { __typename?: 'User', id: number, name: string, avatar: string }, admins: Array<{ __typename?: 'User', id: number }>, members: Array<{ __typename?: 'User', id: number, name: string, avatar: string }>, banned: Array<{ __typename?: 'ChannelRestrictedUser', endAt?: number | null, user: { __typename?: 'User', id: number, name: string, avatar: string } }>, muted: Array<{ __typename?: 'ChannelRestrictedUser', endAt?: number | null, user: { __typename?: 'User', id: number } }> } };

export type DirectMessagesQueryVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type DirectMessagesQuery = { __typename?: 'Query', user: { __typename?: 'User', rank: number, name: string, avatar: string, status: UserStatus, friendStatus?: FriendStatus | null, blocked: boolean, blocking: boolean, messages: Array<{ __typename?: 'DirectMessage', id: number, content: string, readAt?: number | null, sentAt: number, recipient: { __typename?: 'User', id: number, name: string, avatar: string }, author: { __typename?: 'User', id: number, avatar: string, name: string } }> } };

export type SendDirectMessageMutationVariables = Exact<{
  userId: Scalars['Int'];
  message: Scalars['String'];
}>;


export type SendDirectMessageMutation = { __typename?: 'Mutation', sendDirectMessage: boolean };

export type DiscussionsAndInvitationsQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['Int']>;
}>;


export type DiscussionsAndInvitationsQuery = { __typename?: 'Query', user: { __typename?: 'User', id: number, chats: Array<{ __typename?: 'Chat', avatar?: string | null, hasUnreadMessages: boolean, id: number, lastMessageContent?: string | null, lastMessageDate?: number | null, name: string, type: ChatType, status?: UserStatus | null }>, pendingFriends: Array<{ __typename?: 'User', id: number, avatar: string, name: string }> } };

export type AcceptInvitationMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type AcceptInvitationMutation = { __typename?: 'Mutation', friendUser: boolean };

export type RefuseInvitationMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type RefuseInvitationMutation = { __typename?: 'Mutation', refuseInvitation: boolean };

export type UserProfileQueryVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type UserProfileQuery = { __typename?: 'Query', user: { __typename?: 'User', id: number, name: string, avatar: string, rank: number, blocked: boolean, blocking: boolean, friendStatus?: FriendStatus | null, status: UserStatus, games: Array<{ __typename?: 'Game', finishedAt?: number | null, gameMode: GameMode, startAt: number, players: { __typename?: 'Players', player1: { __typename?: 'User', avatar: string, status: UserStatus, name: string, rank: number, id: number }, player2: { __typename?: 'User', avatar: string, status: UserStatus, name: string, rank: number, id: number } }, score: { __typename?: 'Score', player1Score: number, player2Score: number } }>, achievements: Array<{ __typename?: 'Achievement', name: string }> } };

export type FriendUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type FriendUserMutation = { __typename?: 'Mutation', friendUser: boolean };

export type UnfriendUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type UnfriendUserMutation = { __typename?: 'Mutation', unfriendUser: boolean };

export type BlockUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type BlockUserMutation = { __typename?: 'Mutation', blockUser: boolean };

export type UnblockUserMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type UnblockUserMutation = { __typename?: 'Mutation', unblockUser: boolean };

export type CancelInvitationMutationVariables = Exact<{
  userId: Scalars['Int'];
}>;


export type CancelInvitationMutation = { __typename?: 'Mutation', cancelInvitation: boolean };

export type UpdateUserNameMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type UpdateUserNameMutation = { __typename?: 'Mutation', updateUserName: boolean };

export type NewMessagesQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['Int']>;
}>;


export type NewMessagesQuery = { __typename?: 'Query', user: { __typename?: 'User', id: number, chats: Array<{ __typename?: 'Chat', hasUnreadMessages: boolean }> } };
