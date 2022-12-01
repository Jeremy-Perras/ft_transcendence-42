import { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
export declare type Maybe<T> = T | null;
export declare type InputMaybe<T> = Maybe<T>;
export declare type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export declare type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export declare type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
export declare type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    Timestamp: number;
};
export declare type Achievement = {
    __typename?: "Achievement";
    icon: Scalars["String"];
    name: Scalars["String"];
};
export declare type Channel = {
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
export declare type ChannelMessage = {
    __typename?: "ChannelMessage";
    author: User;
    content: Scalars["String"];
    id: Scalars["Int"];
    readBy: Array<ChannelMessageRead>;
    sentAt: Scalars["Timestamp"];
};
export declare type ChannelMessageRead = {
    __typename?: "ChannelMessageRead";
    messageID: Scalars["Int"];
    readAt: Scalars["Timestamp"];
    user: User;
};
export declare type Chat = {
    __typename?: "Chat";
    avatar?: Maybe<Scalars["String"]>;
    hasUnreadMessages: Scalars["Boolean"];
    id: Scalars["Int"];
    lastMessageContent?: Maybe<Scalars["String"]>;
    lastMessageDate?: Maybe<Scalars["Timestamp"]>;
    name: Scalars["String"];
    type: ChatType;
};
export declare type DirectMessage = {
    __typename?: "DirectMessage";
    author: User;
    content: Scalars["String"];
    id: Scalars["Int"];
    readAt?: Maybe<Scalars["Timestamp"]>;
    recipient: User;
    sentAt: Scalars["Timestamp"];
};
export declare type Game = {
    __typename?: "Game";
    finishedAt?: Maybe<Scalars["Timestamp"]>;
    gamemode: Scalars["String"];
    id: Scalars["Int"];
    players: Players;
    score: Score;
    startAt: Scalars["Timestamp"];
};
export declare type Mutation = {
    __typename?: "Mutation";
    addAdmin: Scalars["Boolean"];
    banUser: Scalars["Boolean"];
    blockUser: Scalars["Boolean"];
    cancelInvitation: Scalars["Boolean"];
    createChannel: Scalars["Boolean"];
    createChannelMessageRead: Scalars["Boolean"];
    deleteChannel: Scalars["Boolean"];
    friendUser: Scalars["Boolean"];
    inviteUser: Scalars["Boolean"];
    joinChannel: Scalars["Boolean"];
    leaveChannel: Scalars["Boolean"];
    muteUser: Scalars["Boolean"];
    readDirectMessage: Scalars["Boolean"];
    refuseInvitation: Scalars["Boolean"];
    removeAdmin: Scalars["Boolean"];
    removeUser: Scalars["Boolean"];
    sendChannelMessage: Scalars["Boolean"];
    sendDirectMessage: Scalars["Boolean"];
    unbanUser: Scalars["Boolean"];
    unblockUser: Scalars["Boolean"];
    unfriendUser: Scalars["Boolean"];
    unmuteUser: Scalars["Boolean"];
    updatePassword: Scalars["Boolean"];
    updateUserName: Scalars["Boolean"];
};
export declare type MutationAddAdminArgs = {
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
};
export declare type MutationBanUserArgs = {
    banUntil?: InputMaybe<Scalars["Timestamp"]>;
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
};
export declare type MutationBlockUserArgs = {
    userId: Scalars["Int"];
};
export declare type MutationCancelInvitationArgs = {
    userId: Scalars["Int"];
};
export declare type MutationCreateChannelArgs = {
    inviteOnly: Scalars["Boolean"];
    name: Scalars["String"];
    password?: InputMaybe<Scalars["String"]>;
};
export declare type MutationCreateChannelMessageReadArgs = {
    messageId: Scalars["Int"];
};
export declare type MutationDeleteChannelArgs = {
    channelId: Scalars["Int"];
};
export declare type MutationFriendUserArgs = {
    userId: Scalars["Int"];
};
export declare type MutationInviteUserArgs = {
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
};
export declare type MutationJoinChannelArgs = {
    channelId: Scalars["Int"];
    password?: InputMaybe<Scalars["String"]>;
};
export declare type MutationLeaveChannelArgs = {
    channelId: Scalars["Int"];
};
export declare type MutationMuteUserArgs = {
    channelId: Scalars["Int"];
    muteUntil?: InputMaybe<Scalars["Timestamp"]>;
    userId: Scalars["Int"];
};
export declare type MutationReadDirectMessageArgs = {
    messageId: Scalars["Int"];
};
export declare type MutationRefuseInvitationArgs = {
    userId: Scalars["Int"];
};
export declare type MutationRemoveAdminArgs = {
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
};
export declare type MutationRemoveUserArgs = {
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
};
export declare type MutationSendChannelMessageArgs = {
    channelId: Scalars["Int"];
    message: Scalars["String"];
};
export declare type MutationSendDirectMessageArgs = {
    message: Scalars["String"];
    userId: Scalars["Int"];
};
export declare type MutationUnbanUserArgs = {
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
};
export declare type MutationUnblockUserArgs = {
    userId: Scalars["Int"];
};
export declare type MutationUnfriendUserArgs = {
    userId: Scalars["Int"];
};
export declare type MutationUnmuteUserArgs = {
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
};
export declare type MutationUpdatePasswordArgs = {
    channelId: Scalars["Int"];
    password?: InputMaybe<Scalars["String"]>;
};
export declare type MutationUpdateUserNameArgs = {
    name: Scalars["String"];
};
export declare type Players = {
    __typename?: "Players";
    player1: User;
    player2: User;
};
export declare type Query = {
    __typename?: "Query";
    channel: Channel;
    channels: Array<Channel>;
    game: Game;
    games: Array<Game>;
    user: User;
    users: Array<Maybe<User>>;
};
export declare type QueryChannelArgs = {
    id: Scalars["Int"];
};
export declare type QueryChannelsArgs = {
    adminId?: InputMaybe<Scalars["Int"]>;
    memberId?: InputMaybe<Scalars["Int"]>;
    name?: InputMaybe<Scalars["String"]>;
    ownerId?: InputMaybe<Scalars["Int"]>;
};
export declare type QueryGameArgs = {
    id: Scalars["Int"];
};
export declare type QueryGamesArgs = {
    finished?: InputMaybe<Scalars["Boolean"]>;
    gameMode?: InputMaybe<Scalars["Int"]>;
    id?: InputMaybe<Scalars["Int"]>;
};
export declare type QueryUserArgs = {
    id?: InputMaybe<Scalars["Int"]>;
};
export declare type QueryUsersArgs = {
    name?: InputMaybe<Scalars["String"]>;
};
export declare type RestrictedMember = {
    __typename?: "RestrictedMember";
    achievements: Array<Achievement>;
    avatar: Scalars["String"];
    blocked: Scalars["Boolean"];
    blocking: Scalars["Boolean"];
    channels: Array<Channel>;
    chats: Array<Chat>;
    endAt?: Maybe<Scalars["Timestamp"]>;
    friendStatus?: Maybe<FriendStatus>;
    friends: Array<User>;
    games: Array<Game>;
    id: Scalars["Int"];
    messages: Array<DirectMessage>;
    name: Scalars["String"];
    pendingFriends: Array<User>;
    rank: Scalars["Int"];
};
export declare type Score = {
    __typename?: "Score";
    player1Score: Scalars["Int"];
    player2Score: Scalars["Int"];
};
export declare type User = {
    __typename?: "User";
    achievements: Array<Achievement>;
    avatar: Scalars["String"];
    blocked: Scalars["Boolean"];
    blocking: Scalars["Boolean"];
    channels: Array<Channel>;
    chats: Array<Chat>;
    friendStatus?: Maybe<FriendStatus>;
    friends: Array<User>;
    games: Array<Game>;
    id: Scalars["Int"];
    messages: Array<DirectMessage>;
    name: Scalars["String"];
    pendingFriends: Array<User>;
    rank: Scalars["Int"];
};
export declare type UserGamesArgs = {
    finished?: InputMaybe<Scalars["Boolean"]>;
};
export declare enum ChatType {
    Channel = "CHANNEL",
    User = "USER"
}
export declare enum FriendStatus {
    Friend = "FRIEND",
    InvitationReceived = "INVITATION_RECEIVED",
    InvitationSend = "INVITATION_SEND",
    NotFriend = "NOT_FRIEND"
}
export declare type AddAdminMutationVariables = Exact<{
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
}>;
export declare type AddAdminMutation = {
    __typename?: "Mutation";
    addAdmin: boolean;
};
export declare type AddFriendMutationVariables = Exact<{
    userId: Scalars["Int"];
}>;
export declare type AddFriendMutation = {
    __typename?: "Mutation";
    friendUser: boolean;
};
export declare type BanUserMutationVariables = Exact<{
    userId: Scalars["Int"];
    channelId: Scalars["Int"];
}>;
export declare type BanUserMutation = {
    __typename?: "Mutation";
    banUser: boolean;
};
export declare type BlockUserMutationVariables = Exact<{
    userId: Scalars["Int"];
}>;
export declare type BlockUserMutation = {
    __typename?: "Mutation";
    blockUser: boolean;
};
export declare type CancelInvitationMutationVariables = Exact<{
    userId: Scalars["Int"];
}>;
export declare type CancelInvitationMutation = {
    __typename?: "Mutation";
    cancelInvitation: boolean;
};
export declare type ChannelDiscussionQueryVariables = Exact<{
    channelId: Scalars["Int"];
    userId?: InputMaybe<Scalars["Int"]>;
}>;
export declare type ChannelDiscussionQuery = {
    __typename?: "Query";
    channel: {
        __typename?: "Channel";
        private: boolean;
        passwordProtected: boolean;
        name: string;
        id: number;
        banned: Array<{
            __typename?: "RestrictedMember";
            id: number;
        }>;
        muted: Array<{
            __typename?: "RestrictedMember";
            id: number;
        }>;
        owner: {
            __typename?: "User";
            id: number;
            name: string;
            avatar: string;
        };
        members: Array<{
            __typename?: "User";
            id: number;
        }>;
        admins: Array<{
            __typename?: "User";
            id: number;
        }>;
        messages: Array<{
            __typename?: "ChannelMessage";
            content: string;
            id: number;
            sentAt: number;
            readBy: Array<{
                __typename?: "ChannelMessageRead";
                user: {
                    __typename?: "User";
                    id: number;
                    name: string;
                    avatar: string;
                };
            }>;
            author: {
                __typename?: "User";
                id: number;
                name: string;
                avatar: string;
            };
        }>;
    };
    user: {
        __typename?: "User";
        id: number;
        blocked: boolean;
        blocking: boolean;
    };
};
export declare type ChannelSettingsQueryVariables = Exact<{
    channelId: Scalars["Int"];
    userId?: InputMaybe<Scalars["Int"]>;
}>;
export declare type ChannelSettingsQuery = {
    __typename?: "Query";
    channel: {
        __typename?: "Channel";
        id: number;
        name: string;
        passwordProtected: boolean;
        private: boolean;
        owner: {
            __typename?: "User";
            id: number;
            name: string;
            avatar: string;
        };
        admins: Array<{
            __typename?: "User";
            id: number;
            avatar: string;
            name: string;
        }>;
        members: Array<{
            __typename?: "User";
            id: number;
            name: string;
            avatar: string;
        }>;
        banned: Array<{
            __typename?: "RestrictedMember";
            id: number;
            name: string;
            avatar: string;
            endAt?: number | null;
        }>;
        muted: Array<{
            __typename?: "RestrictedMember";
            id: number;
            endAt?: number | null;
        }>;
    };
    user: {
        __typename?: "User";
        id: number;
    };
};
export declare type CreateChannelMutationVariables = Exact<{
    inviteOnly: Scalars["Boolean"];
    name: Scalars["String"];
    password?: InputMaybe<Scalars["String"]>;
}>;
export declare type CreateChannelMutation = {
    __typename?: "Mutation";
    createChannel: boolean;
};
export declare type CreateChannelMessageReadMutationVariables = Exact<{
    messageId: Scalars["Int"];
}>;
export declare type CreateChannelMessageReadMutation = {
    __typename?: "Mutation";
    createChannelMessageRead: boolean;
};
export declare type DeleteChannelMutationVariables = Exact<{
    channelId: Scalars["Int"];
}>;
export declare type DeleteChannelMutation = {
    __typename?: "Mutation";
    deleteChannel: boolean;
};
export declare type DirectMessagesQueryVariables = Exact<{
    userId?: InputMaybe<Scalars["Int"]>;
}>;
export declare type DirectMessagesQuery = {
    __typename?: "Query";
    user: {
        __typename?: "User";
        rank: number;
        name: string;
        avatar: string;
        blocked: boolean;
        blocking: boolean;
        messages: Array<{
            __typename?: "DirectMessage";
            id: number;
            content: string;
            readAt?: number | null;
            sentAt: number;
            recipient: {
                __typename?: "User";
                id: number;
                name: string;
                avatar: string;
            };
            author: {
                __typename?: "User";
                id: number;
                avatar: string;
                name: string;
            };
        }>;
    };
};
export declare type DiscussionsAndInvitationsQueryVariables = Exact<{
    userId?: InputMaybe<Scalars["Int"]>;
}>;
export declare type DiscussionsAndInvitationsQuery = {
    __typename?: "Query";
    user: {
        __typename?: "User";
        id: number;
        chats: Array<{
            __typename?: "Chat";
            avatar?: string | null;
            hasUnreadMessages: boolean;
            id: number;
            lastMessageContent?: string | null;
            lastMessageDate?: number | null;
            name: string;
            type: ChatType;
        }>;
        pendingFriends: Array<{
            __typename?: "User";
            id: number;
            avatar: string;
            name: string;
        }>;
    };
};
export declare type InviteUserMutationVariables = Exact<{
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
}>;
export declare type InviteUserMutation = {
    __typename?: "Mutation";
    inviteUser: boolean;
};
export declare type JoinChannelMutationVariables = Exact<{
    channelId: Scalars["Int"];
    password?: InputMaybe<Scalars["String"]>;
}>;
export declare type JoinChannelMutation = {
    __typename?: "Mutation";
    joinChannel: boolean;
};
export declare type LeaveChannelMutationVariables = Exact<{
    channelId: Scalars["Int"];
}>;
export declare type LeaveChannelMutation = {
    __typename?: "Mutation";
    leaveChannel: boolean;
};
export declare type MuteUserMutationVariables = Exact<{
    userId: Scalars["Int"];
    channelId: Scalars["Int"];
}>;
export declare type MuteUserMutation = {
    __typename?: "Mutation";
    muteUser: boolean;
};
export declare type ReadDirectMessageMutationVariables = Exact<{
    messageId: Scalars["Int"];
}>;
export declare type ReadDirectMessageMutation = {
    __typename?: "Mutation";
    readDirectMessage: boolean;
};
export declare type RefuseInvitationMutationVariables = Exact<{
    userId: Scalars["Int"];
}>;
export declare type RefuseInvitationMutation = {
    __typename?: "Mutation";
    refuseInvitation: boolean;
};
export declare type RemoveAdminMutationVariables = Exact<{
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
}>;
export declare type RemoveAdminMutation = {
    __typename?: "Mutation";
    removeAdmin: boolean;
};
export declare type SearchUsersQueryVariables = Exact<{
    name?: InputMaybe<Scalars["String"]>;
}>;
export declare type SearchUsersQuery = {
    __typename?: "Query";
    users: Array<{
        __typename?: "User";
        id: number;
        name: string;
        avatar: string;
        channels: Array<{
            __typename?: "Channel";
            id: number;
        }>;
    } | null>;
};
export declare type SearchUsersAndChannelsQueryVariables = Exact<{
    name?: InputMaybe<Scalars["String"]>;
    userId?: InputMaybe<Scalars["Int"]>;
}>;
export declare type SearchUsersAndChannelsQuery = {
    __typename?: "Query";
    users: Array<{
        __typename: "User";
        avatar: string;
        id: number;
        name: string;
    } | null>;
    channels: Array<{
        __typename: "Channel";
        name: string;
        id: number;
    }>;
    user: {
        __typename?: "User";
        id: number;
    };
};
export declare type SendChannelMessageMutationVariables = Exact<{
    message: Scalars["String"];
    channelId: Scalars["Int"];
}>;
export declare type SendChannelMessageMutation = {
    __typename?: "Mutation";
    sendChannelMessage: boolean;
};
export declare type SendDirectMessageMutationVariables = Exact<{
    message: Scalars["String"];
    userId: Scalars["Int"];
}>;
export declare type SendDirectMessageMutation = {
    __typename?: "Mutation";
    sendDirectMessage: boolean;
};
export declare type UnbanUserMutationVariables = Exact<{
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
}>;
export declare type UnbanUserMutation = {
    __typename?: "Mutation";
    unbanUser: boolean;
};
export declare type UnblockUserMutationVariables = Exact<{
    userId: Scalars["Int"];
}>;
export declare type UnblockUserMutation = {
    __typename?: "Mutation";
    unblockUser: boolean;
};
export declare type UnfriendUserMutationVariables = Exact<{
    userId: Scalars["Int"];
}>;
export declare type UnfriendUserMutation = {
    __typename?: "Mutation";
    unfriendUser: boolean;
};
export declare type UnmuteUserMutationVariables = Exact<{
    channelId: Scalars["Int"];
    userId: Scalars["Int"];
}>;
export declare type UnmuteUserMutation = {
    __typename?: "Mutation";
    unmuteUser: boolean;
};
export declare type UpdateChannelPasswordMutationVariables = Exact<{
    channelId: Scalars["Int"];
    password?: InputMaybe<Scalars["String"]>;
}>;
export declare type UpdateChannelPasswordMutation = {
    __typename?: "Mutation";
    updatePassword: boolean;
};
export declare type UpdateUserNameMutationVariables = Exact<{
    name: Scalars["String"];
}>;
export declare type UpdateUserNameMutation = {
    __typename?: "Mutation";
    updateUserName: boolean;
};
export declare type UserChatsAndFriendsQueryVariables = Exact<{
    [key: string]: never;
}>;
export declare type UserChatsAndFriendsQuery = {
    __typename?: "Query";
    user: {
        __typename?: "User";
        id: number;
        channels: Array<{
            __typename: "Channel";
            id: number;
            name: string;
            messages: Array<{
                __typename: "ChannelMessage";
                content: string;
                sentAt: number;
                author: {
                    __typename?: "User";
                    id: number;
                };
                readBy: Array<{
                    __typename?: "ChannelMessageRead";
                    user: {
                        __typename?: "User";
                        id: number;
                    };
                }>;
            }>;
        }>;
        friends: Array<{
            __typename: "User";
            id: number;
            name: string;
            avatar: string;
            friendStatus?: FriendStatus | null;
            messages: Array<{
                __typename: "DirectMessage";
                content: string;
                sentAt: number;
                readAt?: number | null;
                author: {
                    __typename?: "User";
                    id: number;
                };
            }>;
        }>;
        pendingFriends: Array<{
            __typename: "User";
            id: number;
            name: string;
            avatar: string;
            friendStatus?: FriendStatus | null;
        }>;
    };
};
export declare type UserProfileQueryVariables = Exact<{
    userId?: InputMaybe<Scalars["Int"]>;
}>;
export declare type UserProfileQuery = {
    __typename?: "Query";
    user: {
        __typename?: "User";
        id: number;
        name: string;
        avatar: string;
        rank: number;
        blocked: boolean;
        blocking: boolean;
        friendStatus?: FriendStatus | null;
        games: Array<{
            __typename?: "Game";
            finishedAt?: number | null;
            gamemode: string;
            startAt: number;
            players: {
                __typename?: "Players";
                player1: {
                    __typename?: "User";
                    avatar: string;
                    name: string;
                    rank: number;
                    id: number;
                };
                player2: {
                    __typename?: "User";
                    avatar: string;
                    name: string;
                    rank: number;
                    id: number;
                };
            };
            score: {
                __typename?: "Score";
                player1Score: number;
                player2Score: number;
            };
        }>;
        friends: Array<{
            __typename?: "User";
            id: number;
        }>;
        achievements: Array<{
            __typename?: "Achievement";
            name: string;
            icon: string;
        }>;
    };
};
export declare type UserProfileHeaderQueryVariables = Exact<{
    [key: string]: never;
}>;
export declare type UserProfileHeaderQuery = {
    __typename?: "Query";
    user: {
        __typename?: "User";
        id: number;
        avatar: string;
    };
};
export declare const AddAdminDocument = "\n    mutation AddAdmin($channelId: Int!, $userId: Int!) {\n  addAdmin(channelId: $channelId, userId: $userId)\n}\n    ";
export declare const useAddAdminMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<AddAdminMutation, TError, Exact<{
        channelId: Scalars["Int"];
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<AddAdminMutation, TError, Exact<{
        channelId: Scalars["Int"];
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: AddAdminMutationVariables): () => Promise<AddAdminMutation>;
};
export declare const AddFriendDocument = "\n    mutation AddFriend($userId: Int!) {\n  friendUser(userId: $userId)\n}\n    ";
export declare const useAddFriendMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<AddFriendMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<AddFriendMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: AddFriendMutationVariables): () => Promise<AddFriendMutation>;
};
export declare const BanUserDocument = "\n    mutation BanUser($userId: Int!, $channelId: Int!) {\n  banUser(userId: $userId, channelId: $channelId)\n}\n    ";
export declare const useBanUserMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<BanUserMutation, TError, Exact<{
        userId: Scalars["Int"];
        channelId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<BanUserMutation, TError, Exact<{
        userId: Scalars["Int"];
        channelId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: BanUserMutationVariables): () => Promise<BanUserMutation>;
};
export declare const BlockUserDocument = "\n    mutation BlockUser($userId: Int!) {\n  blockUser(userId: $userId)\n}\n    ";
export declare const useBlockUserMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<BlockUserMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<BlockUserMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: BlockUserMutationVariables): () => Promise<BlockUserMutation>;
};
export declare const CancelInvitationDocument = "\n    mutation CancelInvitation($userId: Int!) {\n  cancelInvitation(userId: $userId)\n}\n    ";
export declare const useCancelInvitationMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<CancelInvitationMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<CancelInvitationMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: CancelInvitationMutationVariables): () => Promise<CancelInvitationMutation>;
};
export declare const ChannelDiscussionDocument = "\n    query ChannelDiscussion($channelId: Int!, $userId: Int) {\n  channel(id: $channelId) {\n    banned {\n      id\n    }\n    muted {\n      id\n    }\n    private\n    passwordProtected\n    name\n    id\n    owner {\n      id\n      name\n      avatar\n    }\n    members {\n      id\n    }\n    admins {\n      id\n    }\n    messages {\n      readBy {\n        user {\n          id\n          name\n          avatar\n        }\n      }\n      content\n      id\n      sentAt\n      author {\n        id\n        name\n        avatar\n      }\n    }\n  }\n  user(id: $userId) {\n    id\n    blocked\n    blocking\n  }\n}\n    ";
export declare const useChannelDiscussionQuery: {
    <TData = ChannelDiscussionQuery, TError = unknown>(variables: ChannelDiscussionQueryVariables, options?: UseQueryOptions<ChannelDiscussionQuery, TError, TData, import("@tanstack/react-query").QueryKey> | undefined): import("@tanstack/react-query").UseQueryResult<TData, TError>;
    getKey(variables: ChannelDiscussionQueryVariables): (string | Exact<{
        channelId: Scalars["Int"];
        userId?: InputMaybe<number> | undefined;
    }>)[];
    fetcher(variables: ChannelDiscussionQueryVariables): () => Promise<ChannelDiscussionQuery>;
};
export declare const ChannelSettingsDocument = "\n    query ChannelSettings($channelId: Int!, $userId: Int) {\n  channel(id: $channelId) {\n    id\n    name\n    owner {\n      id\n      name\n      avatar\n    }\n    admins {\n      id\n      avatar\n      name\n    }\n    members {\n      id\n      name\n      avatar\n    }\n    banned {\n      id\n      name\n      avatar\n      endAt\n    }\n    muted {\n      id\n      endAt\n    }\n    passwordProtected\n    private\n  }\n  user(id: $userId) {\n    id\n  }\n}\n    ";
export declare const useChannelSettingsQuery: {
    <TData = ChannelSettingsQuery, TError = unknown>(variables: ChannelSettingsQueryVariables, options?: UseQueryOptions<ChannelSettingsQuery, TError, TData, import("@tanstack/react-query").QueryKey> | undefined): import("@tanstack/react-query").UseQueryResult<TData, TError>;
    getKey(variables: ChannelSettingsQueryVariables): (string | Exact<{
        channelId: Scalars["Int"];
        userId?: InputMaybe<number> | undefined;
    }>)[];
    fetcher(variables: ChannelSettingsQueryVariables): () => Promise<ChannelSettingsQuery>;
};
export declare const CreateChannelDocument = "\n    mutation CreateChannel($inviteOnly: Boolean!, $name: String!, $password: String) {\n  createChannel(inviteOnly: $inviteOnly, name: $name, password: $password)\n}\n    ";
export declare const useCreateChannelMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<CreateChannelMutation, TError, Exact<{
        inviteOnly: Scalars["Boolean"];
        name: Scalars["String"];
        password?: InputMaybe<string> | undefined;
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<CreateChannelMutation, TError, Exact<{
        inviteOnly: Scalars["Boolean"];
        name: Scalars["String"];
        password?: InputMaybe<string> | undefined;
    }>, TContext>;
    fetcher(variables: CreateChannelMutationVariables): () => Promise<CreateChannelMutation>;
};
export declare const CreateChannelMessageReadDocument = "\n    mutation createChannelMessageRead($messageId: Int!) {\n  createChannelMessageRead(messageId: $messageId)\n}\n    ";
export declare const useCreateChannelMessageReadMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<CreateChannelMessageReadMutation, TError, Exact<{
        messageId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<CreateChannelMessageReadMutation, TError, Exact<{
        messageId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: CreateChannelMessageReadMutationVariables): () => Promise<CreateChannelMessageReadMutation>;
};
export declare const DeleteChannelDocument = "\n    mutation DeleteChannel($channelId: Int!) {\n  deleteChannel(channelId: $channelId)\n}\n    ";
export declare const useDeleteChannelMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<DeleteChannelMutation, TError, Exact<{
        channelId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<DeleteChannelMutation, TError, Exact<{
        channelId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: DeleteChannelMutationVariables): () => Promise<DeleteChannelMutation>;
};
export declare const DirectMessagesDocument = "\n    query DirectMessages($userId: Int) {\n  user(id: $userId) {\n    rank\n    name\n    avatar\n    messages {\n      id\n      content\n      readAt\n      sentAt\n      recipient {\n        id\n        name\n        avatar\n      }\n      author {\n        id\n        avatar\n        name\n      }\n    }\n    blocked\n    blocking\n  }\n}\n    ";
export declare const useDirectMessagesQuery: {
    <TData = DirectMessagesQuery, TError = unknown>(variables?: DirectMessagesQueryVariables, options?: UseQueryOptions<DirectMessagesQuery, TError, TData, import("@tanstack/react-query").QueryKey> | undefined): import("@tanstack/react-query").UseQueryResult<TData, TError>;
    getKey(variables?: DirectMessagesQueryVariables): (string | Exact<{
        userId?: InputMaybe<number> | undefined;
    }>)[];
    fetcher(variables?: DirectMessagesQueryVariables): () => Promise<DirectMessagesQuery>;
};
export declare const DiscussionsAndInvitationsDocument = "\n    query DiscussionsAndInvitations($userId: Int) {\n  user(id: $userId) {\n    id\n    chats {\n      avatar\n      hasUnreadMessages\n      id\n      lastMessageContent\n      lastMessageDate\n      name\n      type\n    }\n    pendingFriends {\n      id\n      avatar\n      name\n    }\n  }\n}\n    ";
export declare const useDiscussionsAndInvitationsQuery: {
    <TData = DiscussionsAndInvitationsQuery, TError = unknown>(variables?: DiscussionsAndInvitationsQueryVariables, options?: UseQueryOptions<DiscussionsAndInvitationsQuery, TError, TData, import("@tanstack/react-query").QueryKey> | undefined): import("@tanstack/react-query").UseQueryResult<TData, TError>;
    getKey(variables?: DiscussionsAndInvitationsQueryVariables): (string | Exact<{
        userId?: InputMaybe<number> | undefined;
    }>)[];
    fetcher(variables?: DiscussionsAndInvitationsQueryVariables): () => Promise<DiscussionsAndInvitationsQuery>;
};
export declare const InviteUserDocument = "\n    mutation InviteUser($channelId: Int!, $userId: Int!) {\n  inviteUser(channelId: $channelId, userId: $userId)\n}\n    ";
export declare const useInviteUserMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<InviteUserMutation, TError, Exact<{
        channelId: Scalars["Int"];
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<InviteUserMutation, TError, Exact<{
        channelId: Scalars["Int"];
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: InviteUserMutationVariables): () => Promise<InviteUserMutation>;
};
export declare const JoinChannelDocument = "\n    mutation JoinChannel($channelId: Int!, $password: String) {\n  joinChannel(channelId: $channelId, password: $password)\n}\n    ";
export declare const useJoinChannelMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<JoinChannelMutation, TError, Exact<{
        channelId: Scalars["Int"];
        password?: InputMaybe<string> | undefined;
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<JoinChannelMutation, TError, Exact<{
        channelId: Scalars["Int"];
        password?: InputMaybe<string> | undefined;
    }>, TContext>;
    fetcher(variables: JoinChannelMutationVariables): () => Promise<JoinChannelMutation>;
};
export declare const LeaveChannelDocument = "\n    mutation LeaveChannel($channelId: Int!) {\n  leaveChannel(channelId: $channelId)\n}\n    ";
export declare const useLeaveChannelMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<LeaveChannelMutation, TError, Exact<{
        channelId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<LeaveChannelMutation, TError, Exact<{
        channelId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: LeaveChannelMutationVariables): () => Promise<LeaveChannelMutation>;
};
export declare const MuteUserDocument = "\n    mutation MuteUser($userId: Int!, $channelId: Int!) {\n  muteUser(userId: $userId, channelId: $channelId)\n}\n    ";
export declare const useMuteUserMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<MuteUserMutation, TError, Exact<{
        userId: Scalars["Int"];
        channelId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<MuteUserMutation, TError, Exact<{
        userId: Scalars["Int"];
        channelId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: MuteUserMutationVariables): () => Promise<MuteUserMutation>;
};
export declare const ReadDirectMessageDocument = "\n    mutation ReadDirectMessage($messageId: Int!) {\n  readDirectMessage(messageId: $messageId)\n}\n    ";
export declare const useReadDirectMessageMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<ReadDirectMessageMutation, TError, Exact<{
        messageId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<ReadDirectMessageMutation, TError, Exact<{
        messageId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: ReadDirectMessageMutationVariables): () => Promise<ReadDirectMessageMutation>;
};
export declare const RefuseInvitationDocument = "\n    mutation RefuseInvitation($userId: Int!) {\n  refuseInvitation(userId: $userId)\n}\n    ";
export declare const useRefuseInvitationMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<RefuseInvitationMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<RefuseInvitationMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: RefuseInvitationMutationVariables): () => Promise<RefuseInvitationMutation>;
};
export declare const RemoveAdminDocument = "\n    mutation RemoveAdmin($channelId: Int!, $userId: Int!) {\n  removeAdmin(channelId: $channelId, userId: $userId)\n}\n    ";
export declare const useRemoveAdminMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<RemoveAdminMutation, TError, Exact<{
        channelId: Scalars["Int"];
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<RemoveAdminMutation, TError, Exact<{
        channelId: Scalars["Int"];
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: RemoveAdminMutationVariables): () => Promise<RemoveAdminMutation>;
};
export declare const SearchUsersDocument = "\n    query SearchUsers($name: String) {\n  users(name: $name) {\n    id\n    name\n    avatar\n    channels {\n      id\n    }\n  }\n}\n    ";
export declare const useSearchUsersQuery: {
    <TData = SearchUsersQuery, TError = unknown>(variables?: SearchUsersQueryVariables, options?: UseQueryOptions<SearchUsersQuery, TError, TData, import("@tanstack/react-query").QueryKey> | undefined): import("@tanstack/react-query").UseQueryResult<TData, TError>;
    getKey(variables?: SearchUsersQueryVariables): (string | Exact<{
        name?: InputMaybe<string> | undefined;
    }>)[];
    fetcher(variables?: SearchUsersQueryVariables): () => Promise<SearchUsersQuery>;
};
export declare const SearchUsersAndChannelsDocument = "\n    query SearchUsersAndChannels($name: String, $userId: Int) {\n  users(name: $name) {\n    __typename\n    avatar\n    id\n    name\n  }\n  channels(name: $name) {\n    __typename\n    name\n    id\n  }\n  user(id: $userId) {\n    id\n  }\n}\n    ";
export declare const useSearchUsersAndChannelsQuery: {
    <TData = SearchUsersAndChannelsQuery, TError = unknown>(variables?: SearchUsersAndChannelsQueryVariables, options?: UseQueryOptions<SearchUsersAndChannelsQuery, TError, TData, import("@tanstack/react-query").QueryKey> | undefined): import("@tanstack/react-query").UseQueryResult<TData, TError>;
    getKey(variables?: SearchUsersAndChannelsQueryVariables): (string | Exact<{
        name?: InputMaybe<string> | undefined;
        userId?: InputMaybe<number> | undefined;
    }>)[];
    fetcher(variables?: SearchUsersAndChannelsQueryVariables): () => Promise<SearchUsersAndChannelsQuery>;
};
export declare const SendChannelMessageDocument = "\n    mutation sendChannelMessage($message: String!, $channelId: Int!) {\n  sendChannelMessage(message: $message, channelId: $channelId)\n}\n    ";
export declare const useSendChannelMessageMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<SendChannelMessageMutation, TError, Exact<{
        message: Scalars["String"];
        channelId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<SendChannelMessageMutation, TError, Exact<{
        message: Scalars["String"];
        channelId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: SendChannelMessageMutationVariables): () => Promise<SendChannelMessageMutation>;
};
export declare const SendDirectMessageDocument = "\n    mutation SendDirectMessage($message: String!, $userId: Int!) {\n  sendDirectMessage(message: $message, userId: $userId)\n}\n    ";
export declare const useSendDirectMessageMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<SendDirectMessageMutation, TError, Exact<{
        message: Scalars["String"];
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<SendDirectMessageMutation, TError, Exact<{
        message: Scalars["String"];
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: SendDirectMessageMutationVariables): () => Promise<SendDirectMessageMutation>;
};
export declare const UnbanUserDocument = "\n    mutation UnbanUser($channelId: Int!, $userId: Int!) {\n  unbanUser(channelId: $channelId, userId: $userId)\n}\n    ";
export declare const useUnbanUserMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<UnbanUserMutation, TError, Exact<{
        channelId: Scalars["Int"];
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<UnbanUserMutation, TError, Exact<{
        channelId: Scalars["Int"];
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: UnbanUserMutationVariables): () => Promise<UnbanUserMutation>;
};
export declare const UnblockUserDocument = "\n    mutation UnblockUser($userId: Int!) {\n  unblockUser(userId: $userId)\n}\n    ";
export declare const useUnblockUserMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<UnblockUserMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<UnblockUserMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: UnblockUserMutationVariables): () => Promise<UnblockUserMutation>;
};
export declare const UnfriendUserDocument = "\n    mutation UnfriendUser($userId: Int!) {\n  unfriendUser(userId: $userId)\n}\n    ";
export declare const useUnfriendUserMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<UnfriendUserMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<UnfriendUserMutation, TError, Exact<{
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: UnfriendUserMutationVariables): () => Promise<UnfriendUserMutation>;
};
export declare const UnmuteUserDocument = "\n    mutation UnmuteUser($channelId: Int!, $userId: Int!) {\n  unmuteUser(channelId: $channelId, userId: $userId)\n}\n    ";
export declare const useUnmuteUserMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<UnmuteUserMutation, TError, Exact<{
        channelId: Scalars["Int"];
        userId: Scalars["Int"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<UnmuteUserMutation, TError, Exact<{
        channelId: Scalars["Int"];
        userId: Scalars["Int"];
    }>, TContext>;
    fetcher(variables: UnmuteUserMutationVariables): () => Promise<UnmuteUserMutation>;
};
export declare const UpdateChannelPasswordDocument = "\n    mutation UpdateChannelPassword($channelId: Int!, $password: String) {\n  updatePassword(channelId: $channelId, password: $password)\n}\n    ";
export declare const useUpdateChannelPasswordMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<UpdateChannelPasswordMutation, TError, Exact<{
        channelId: Scalars["Int"];
        password?: InputMaybe<string> | undefined;
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<UpdateChannelPasswordMutation, TError, Exact<{
        channelId: Scalars["Int"];
        password?: InputMaybe<string> | undefined;
    }>, TContext>;
    fetcher(variables: UpdateChannelPasswordMutationVariables): () => Promise<UpdateChannelPasswordMutation>;
};
export declare const UpdateUserNameDocument = "\n    mutation UpdateUserName($name: String!) {\n  updateUserName(name: $name)\n}\n    ";
export declare const useUpdateUserNameMutation: {
    <TError = unknown, TContext = unknown>(options?: UseMutationOptions<UpdateUserNameMutation, TError, Exact<{
        name: Scalars["String"];
    }>, TContext> | undefined): import("@tanstack/react-query").UseMutationResult<UpdateUserNameMutation, TError, Exact<{
        name: Scalars["String"];
    }>, TContext>;
    fetcher(variables: UpdateUserNameMutationVariables): () => Promise<UpdateUserNameMutation>;
};
export declare const UserChatsAndFriendsDocument = "\n    query UserChatsAndFriends {\n  user {\n    id\n    channels {\n      __typename\n      id\n      name\n      messages {\n        __typename\n        author {\n          id\n        }\n        content\n        sentAt\n        readBy {\n          user {\n            id\n          }\n        }\n      }\n    }\n    friends {\n      __typename\n      id\n      name\n      avatar\n      messages {\n        __typename\n        author {\n          id\n        }\n        content\n        sentAt\n        readAt\n      }\n      friendStatus\n    }\n    pendingFriends {\n      __typename\n      id\n      name\n      avatar\n      friendStatus\n    }\n  }\n}\n    ";
export declare const useUserChatsAndFriendsQuery: {
    <TData = UserChatsAndFriendsQuery, TError = unknown>(variables?: UserChatsAndFriendsQueryVariables, options?: UseQueryOptions<UserChatsAndFriendsQuery, TError, TData, import("@tanstack/react-query").QueryKey> | undefined): import("@tanstack/react-query").UseQueryResult<TData, TError>;
    getKey(variables?: UserChatsAndFriendsQueryVariables): (string | Exact<{
        [key: string]: never;
    }>)[];
    fetcher(variables?: UserChatsAndFriendsQueryVariables): () => Promise<UserChatsAndFriendsQuery>;
};
export declare const UserProfileDocument = "\n    query UserProfile($userId: Int) {\n  user(id: $userId) {\n    id\n    name\n    avatar\n    rank\n    games {\n      finishedAt\n      gamemode\n      players {\n        player1 {\n          avatar\n          name\n          rank\n          id\n        }\n        player2 {\n          avatar\n          name\n          rank\n          id\n        }\n      }\n      score {\n        player1Score\n        player2Score\n      }\n      startAt\n    }\n    blocked\n    blocking\n    friends {\n      id\n    }\n    achievements {\n      name\n      icon\n    }\n    friendStatus\n  }\n}\n    ";
export declare const useUserProfileQuery: {
    <TData = UserProfileQuery, TError = unknown>(variables?: UserProfileQueryVariables, options?: UseQueryOptions<UserProfileQuery, TError, TData, import("@tanstack/react-query").QueryKey> | undefined): import("@tanstack/react-query").UseQueryResult<TData, TError>;
    getKey(variables?: UserProfileQueryVariables): (string | Exact<{
        userId?: InputMaybe<number> | undefined;
    }>)[];
    fetcher(variables?: UserProfileQueryVariables): () => Promise<UserProfileQuery>;
};
export declare const UserProfileHeaderDocument = "\n    query UserProfileHeader {\n  user {\n    id\n    avatar\n  }\n}\n    ";
export declare const useUserProfileHeaderQuery: {
    <TData = UserProfileHeaderQuery, TError = unknown>(variables?: UserProfileHeaderQueryVariables, options?: UseQueryOptions<UserProfileHeaderQuery, TError, TData, import("@tanstack/react-query").QueryKey> | undefined): import("@tanstack/react-query").UseQueryResult<TData, TError>;
    getKey(variables?: UserProfileHeaderQueryVariables): (string | Exact<{
        [key: string]: never;
    }>)[];
    fetcher(variables?: UserProfileHeaderQueryVariables): () => Promise<UserProfileHeaderQuery>;
};
