"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUnbanUserMutation = exports.UnbanUserDocument = exports.useSendDirectMessageMutation = exports.SendDirectMessageDocument = exports.useSendChannelMessageMutation = exports.SendChannelMessageDocument = exports.useSearchUsersAndChannelsQuery = exports.SearchUsersAndChannelsDocument = exports.useSearchUsersQuery = exports.SearchUsersDocument = exports.useRemoveAdminMutation = exports.RemoveAdminDocument = exports.useRefuseInvitationMutation = exports.RefuseInvitationDocument = exports.useReadDirectMessageMutation = exports.ReadDirectMessageDocument = exports.useMuteUserMutation = exports.MuteUserDocument = exports.useLeaveChannelMutation = exports.LeaveChannelDocument = exports.useJoinChannelMutation = exports.JoinChannelDocument = exports.useInviteUserMutation = exports.InviteUserDocument = exports.useDiscussionsAndInvitationsQuery = exports.DiscussionsAndInvitationsDocument = exports.useDirectMessagesQuery = exports.DirectMessagesDocument = exports.useDeleteChannelMutation = exports.DeleteChannelDocument = exports.useCreateChannelMessageReadMutation = exports.CreateChannelMessageReadDocument = exports.useCreateChannelMutation = exports.CreateChannelDocument = exports.useChannelSettingsQuery = exports.ChannelSettingsDocument = exports.useChannelDiscussionQuery = exports.ChannelDiscussionDocument = exports.useCancelInvitationMutation = exports.CancelInvitationDocument = exports.useBlockUserMutation = exports.BlockUserDocument = exports.useBanUserMutation = exports.BanUserDocument = exports.useAddFriendMutation = exports.AddFriendDocument = exports.useAddAdminMutation = exports.AddAdminDocument = exports.FriendStatus = exports.ChatType = void 0;
exports.useUserProfileHeaderQuery = exports.UserProfileHeaderDocument = exports.useUserProfileQuery = exports.UserProfileDocument = exports.useUserChatsAndFriendsQuery = exports.UserChatsAndFriendsDocument = exports.useUpdateUserNameMutation = exports.UpdateUserNameDocument = exports.useUpdateChannelPasswordMutation = exports.UpdateChannelPasswordDocument = exports.useUnmuteUserMutation = exports.UnmuteUserDocument = exports.useUnfriendUserMutation = exports.UnfriendUserDocument = exports.useUnblockUserMutation = exports.UnblockUserDocument = void 0;
const react_query_1 = require("@tanstack/react-query");
function fetcher(query, variables) {
    return async () => {
        const res = await fetch("http://localhost:5173/graphql", {
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
var ChatType;
(function (ChatType) {
    ChatType["Channel"] = "CHANNEL";
    ChatType["User"] = "USER";
})(ChatType = exports.ChatType || (exports.ChatType = {}));
var FriendStatus;
(function (FriendStatus) {
    FriendStatus["Friend"] = "FRIEND";
    FriendStatus["InvitationReceived"] = "INVITATION_RECEIVED";
    FriendStatus["InvitationSend"] = "INVITATION_SEND";
    FriendStatus["NotFriend"] = "NOT_FRIEND";
})(FriendStatus = exports.FriendStatus || (exports.FriendStatus = {}));
exports.AddAdminDocument = `
    mutation AddAdmin($channelId: Int!, $userId: Int!) {
  addAdmin(channelId: $channelId, userId: $userId)
}
    `;
const useAddAdminMutation = (options) => (0, react_query_1.useMutation)(["AddAdmin"], (variables) => fetcher(exports.AddAdminDocument, variables)(), options);
exports.useAddAdminMutation = useAddAdminMutation;
exports.useAddAdminMutation.fetcher = (variables) => fetcher(exports.AddAdminDocument, variables);
exports.AddFriendDocument = `
    mutation AddFriend($userId: Int!) {
  friendUser(userId: $userId)
}
    `;
const useAddFriendMutation = (options) => (0, react_query_1.useMutation)(["AddFriend"], (variables) => fetcher(exports.AddFriendDocument, variables)(), options);
exports.useAddFriendMutation = useAddFriendMutation;
exports.useAddFriendMutation.fetcher = (variables) => fetcher(exports.AddFriendDocument, variables);
exports.BanUserDocument = `
    mutation BanUser($userId: Int!, $channelId: Int!) {
  banUser(userId: $userId, channelId: $channelId)
}
    `;
const useBanUserMutation = (options) => (0, react_query_1.useMutation)(["BanUser"], (variables) => fetcher(exports.BanUserDocument, variables)(), options);
exports.useBanUserMutation = useBanUserMutation;
exports.useBanUserMutation.fetcher = (variables) => fetcher(exports.BanUserDocument, variables);
exports.BlockUserDocument = `
    mutation BlockUser($userId: Int!) {
  blockUser(userId: $userId)
}
    `;
const useBlockUserMutation = (options) => (0, react_query_1.useMutation)(["BlockUser"], (variables) => fetcher(exports.BlockUserDocument, variables)(), options);
exports.useBlockUserMutation = useBlockUserMutation;
exports.useBlockUserMutation.fetcher = (variables) => fetcher(exports.BlockUserDocument, variables);
exports.CancelInvitationDocument = `
    mutation CancelInvitation($userId: Int!) {
  cancelInvitation(userId: $userId)
}
    `;
const useCancelInvitationMutation = (options) => (0, react_query_1.useMutation)(["CancelInvitation"], (variables) => fetcher(exports.CancelInvitationDocument, variables)(), options);
exports.useCancelInvitationMutation = useCancelInvitationMutation;
exports.useCancelInvitationMutation.fetcher = (variables) => fetcher(exports.CancelInvitationDocument, variables);
exports.ChannelDiscussionDocument = `
    query ChannelDiscussion($channelId: Int!, $userId: Int) {
  channel(id: $channelId) {
    banned {
      id
    }
    muted {
      id
    }
    private
    passwordProtected
    name
    id
    owner {
      id
      name
      avatar
    }
    members {
      id
    }
    admins {
      id
    }
    messages {
      readBy {
        user {
          id
          name
          avatar
        }
      }
      content
      id
      sentAt
      author {
        id
        name
        avatar
      }
    }
  }
  user(id: $userId) {
    id
    blocked
    blocking
  }
}
    `;
const useChannelDiscussionQuery = (variables, options) => (0, react_query_1.useQuery)(["ChannelDiscussion", variables], fetcher(exports.ChannelDiscussionDocument, variables), options);
exports.useChannelDiscussionQuery = useChannelDiscussionQuery;
exports.useChannelDiscussionQuery.getKey = (variables) => ["ChannelDiscussion", variables];
exports.useChannelDiscussionQuery.fetcher = (variables) => fetcher(exports.ChannelDiscussionDocument, variables);
exports.ChannelSettingsDocument = `
    query ChannelSettings($channelId: Int!, $userId: Int) {
  channel(id: $channelId) {
    id
    name
    owner {
      id
      name
      avatar
    }
    admins {
      id
      avatar
      name
    }
    members {
      id
      name
      avatar
    }
    banned {
      id
      name
      avatar
      endAt
    }
    muted {
      id
      endAt
    }
    passwordProtected
    private
  }
  user(id: $userId) {
    id
  }
}
    `;
const useChannelSettingsQuery = (variables, options) => (0, react_query_1.useQuery)(["ChannelSettings", variables], fetcher(exports.ChannelSettingsDocument, variables), options);
exports.useChannelSettingsQuery = useChannelSettingsQuery;
exports.useChannelSettingsQuery.getKey = (variables) => [
    "ChannelSettings",
    variables,
];
exports.useChannelSettingsQuery.fetcher = (variables) => fetcher(exports.ChannelSettingsDocument, variables);
exports.CreateChannelDocument = `
    mutation CreateChannel($inviteOnly: Boolean!, $name: String!, $password: String) {
  createChannel(inviteOnly: $inviteOnly, name: $name, password: $password)
}
    `;
const useCreateChannelMutation = (options) => (0, react_query_1.useMutation)(["CreateChannel"], (variables) => fetcher(exports.CreateChannelDocument, variables)(), options);
exports.useCreateChannelMutation = useCreateChannelMutation;
exports.useCreateChannelMutation.fetcher = (variables) => fetcher(exports.CreateChannelDocument, variables);
exports.CreateChannelMessageReadDocument = `
    mutation createChannelMessageRead($messageId: Int!) {
  createChannelMessageRead(messageId: $messageId)
}
    `;
const useCreateChannelMessageReadMutation = (options) => (0, react_query_1.useMutation)(["createChannelMessageRead"], (variables) => fetcher(exports.CreateChannelMessageReadDocument, variables)(), options);
exports.useCreateChannelMessageReadMutation = useCreateChannelMessageReadMutation;
exports.useCreateChannelMessageReadMutation.fetcher = (variables) => fetcher(exports.CreateChannelMessageReadDocument, variables);
exports.DeleteChannelDocument = `
    mutation DeleteChannel($channelId: Int!) {
  deleteChannel(channelId: $channelId)
}
    `;
const useDeleteChannelMutation = (options) => (0, react_query_1.useMutation)(["DeleteChannel"], (variables) => fetcher(exports.DeleteChannelDocument, variables)(), options);
exports.useDeleteChannelMutation = useDeleteChannelMutation;
exports.useDeleteChannelMutation.fetcher = (variables) => fetcher(exports.DeleteChannelDocument, variables);
exports.DirectMessagesDocument = `
    query DirectMessages($userId: Int) {
  user(id: $userId) {
    rank
    name
    avatar
    messages {
      id
      content
      readAt
      sentAt
      recipient {
        id
        name
        avatar
      }
      author {
        id
        avatar
        name
      }
    }
    blocked
    blocking
  }
}
    `;
const useDirectMessagesQuery = (variables, options) => (0, react_query_1.useQuery)(variables === undefined
    ? ["DirectMessages"]
    : ["DirectMessages", variables], fetcher(exports.DirectMessagesDocument, variables), options);
exports.useDirectMessagesQuery = useDirectMessagesQuery;
exports.useDirectMessagesQuery.getKey = (variables) => variables === undefined ? ["DirectMessages"] : ["DirectMessages", variables];
exports.useDirectMessagesQuery.fetcher = (variables) => fetcher(exports.DirectMessagesDocument, variables);
exports.DiscussionsAndInvitationsDocument = `
    query DiscussionsAndInvitations($userId: Int) {
  user(id: $userId) {
    id
    chats {
      avatar
      hasUnreadMessages
      id
      lastMessageContent
      lastMessageDate
      name
      type
    }
    pendingFriends {
      id
      avatar
      name
    }
  }
}
    `;
const useDiscussionsAndInvitationsQuery = (variables, options) => (0, react_query_1.useQuery)(variables === undefined
    ? ["DiscussionsAndInvitations"]
    : ["DiscussionsAndInvitations", variables], fetcher(exports.DiscussionsAndInvitationsDocument, variables), options);
exports.useDiscussionsAndInvitationsQuery = useDiscussionsAndInvitationsQuery;
exports.useDiscussionsAndInvitationsQuery.getKey = (variables) => variables === undefined
    ? ["DiscussionsAndInvitations"]
    : ["DiscussionsAndInvitations", variables];
exports.useDiscussionsAndInvitationsQuery.fetcher = (variables) => fetcher(exports.DiscussionsAndInvitationsDocument, variables);
exports.InviteUserDocument = `
    mutation InviteUser($channelId: Int!, $userId: Int!) {
  inviteUser(channelId: $channelId, userId: $userId)
}
    `;
const useInviteUserMutation = (options) => (0, react_query_1.useMutation)(["InviteUser"], (variables) => fetcher(exports.InviteUserDocument, variables)(), options);
exports.useInviteUserMutation = useInviteUserMutation;
exports.useInviteUserMutation.fetcher = (variables) => fetcher(exports.InviteUserDocument, variables);
exports.JoinChannelDocument = `
    mutation JoinChannel($channelId: Int!, $password: String) {
  joinChannel(channelId: $channelId, password: $password)
}
    `;
const useJoinChannelMutation = (options) => (0, react_query_1.useMutation)(["JoinChannel"], (variables) => fetcher(exports.JoinChannelDocument, variables)(), options);
exports.useJoinChannelMutation = useJoinChannelMutation;
exports.useJoinChannelMutation.fetcher = (variables) => fetcher(exports.JoinChannelDocument, variables);
exports.LeaveChannelDocument = `
    mutation LeaveChannel($channelId: Int!) {
  leaveChannel(channelId: $channelId)
}
    `;
const useLeaveChannelMutation = (options) => (0, react_query_1.useMutation)(["LeaveChannel"], (variables) => fetcher(exports.LeaveChannelDocument, variables)(), options);
exports.useLeaveChannelMutation = useLeaveChannelMutation;
exports.useLeaveChannelMutation.fetcher = (variables) => fetcher(exports.LeaveChannelDocument, variables);
exports.MuteUserDocument = `
    mutation MuteUser($userId: Int!, $channelId: Int!) {
  muteUser(userId: $userId, channelId: $channelId)
}
    `;
const useMuteUserMutation = (options) => (0, react_query_1.useMutation)(["MuteUser"], (variables) => fetcher(exports.MuteUserDocument, variables)(), options);
exports.useMuteUserMutation = useMuteUserMutation;
exports.useMuteUserMutation.fetcher = (variables) => fetcher(exports.MuteUserDocument, variables);
exports.ReadDirectMessageDocument = `
    mutation ReadDirectMessage($messageId: Int!) {
  readDirectMessage(messageId: $messageId)
}
    `;
const useReadDirectMessageMutation = (options) => (0, react_query_1.useMutation)(["ReadDirectMessage"], (variables) => fetcher(exports.ReadDirectMessageDocument, variables)(), options);
exports.useReadDirectMessageMutation = useReadDirectMessageMutation;
exports.useReadDirectMessageMutation.fetcher = (variables) => fetcher(exports.ReadDirectMessageDocument, variables);
exports.RefuseInvitationDocument = `
    mutation RefuseInvitation($userId: Int!) {
  refuseInvitation(userId: $userId)
}
    `;
const useRefuseInvitationMutation = (options) => (0, react_query_1.useMutation)(["RefuseInvitation"], (variables) => fetcher(exports.RefuseInvitationDocument, variables)(), options);
exports.useRefuseInvitationMutation = useRefuseInvitationMutation;
exports.useRefuseInvitationMutation.fetcher = (variables) => fetcher(exports.RefuseInvitationDocument, variables);
exports.RemoveAdminDocument = `
    mutation RemoveAdmin($channelId: Int!, $userId: Int!) {
  removeAdmin(channelId: $channelId, userId: $userId)
}
    `;
const useRemoveAdminMutation = (options) => (0, react_query_1.useMutation)(["RemoveAdmin"], (variables) => fetcher(exports.RemoveAdminDocument, variables)(), options);
exports.useRemoveAdminMutation = useRemoveAdminMutation;
exports.useRemoveAdminMutation.fetcher = (variables) => fetcher(exports.RemoveAdminDocument, variables);
exports.SearchUsersDocument = `
    query SearchUsers($name: String) {
  users(name: $name) {
    id
    name
    avatar
    channels {
      id
    }
  }
}
    `;
const useSearchUsersQuery = (variables, options) => (0, react_query_1.useQuery)(variables === undefined ? ["SearchUsers"] : ["SearchUsers", variables], fetcher(exports.SearchUsersDocument, variables), options);
exports.useSearchUsersQuery = useSearchUsersQuery;
exports.useSearchUsersQuery.getKey = (variables) => variables === undefined ? ["SearchUsers"] : ["SearchUsers", variables];
exports.useSearchUsersQuery.fetcher = (variables) => fetcher(exports.SearchUsersDocument, variables);
exports.SearchUsersAndChannelsDocument = `
    query SearchUsersAndChannels($name: String, $userId: Int) {
  users(name: $name) {
    __typename
    avatar
    id
    name
  }
  channels(name: $name) {
    __typename
    name
    id
  }
  user(id: $userId) {
    id
  }
}
    `;
const useSearchUsersAndChannelsQuery = (variables, options) => (0, react_query_1.useQuery)(variables === undefined
    ? ["SearchUsersAndChannels"]
    : ["SearchUsersAndChannels", variables], fetcher(exports.SearchUsersAndChannelsDocument, variables), options);
exports.useSearchUsersAndChannelsQuery = useSearchUsersAndChannelsQuery;
exports.useSearchUsersAndChannelsQuery.getKey = (variables) => variables === undefined
    ? ["SearchUsersAndChannels"]
    : ["SearchUsersAndChannels", variables];
exports.useSearchUsersAndChannelsQuery.fetcher = (variables) => fetcher(exports.SearchUsersAndChannelsDocument, variables);
exports.SendChannelMessageDocument = `
    mutation sendChannelMessage($message: String!, $channelId: Int!) {
  sendChannelMessage(message: $message, channelId: $channelId)
}
    `;
const useSendChannelMessageMutation = (options) => (0, react_query_1.useMutation)(["sendChannelMessage"], (variables) => fetcher(exports.SendChannelMessageDocument, variables)(), options);
exports.useSendChannelMessageMutation = useSendChannelMessageMutation;
exports.useSendChannelMessageMutation.fetcher = (variables) => fetcher(exports.SendChannelMessageDocument, variables);
exports.SendDirectMessageDocument = `
    mutation SendDirectMessage($message: String!, $userId: Int!) {
  sendDirectMessage(message: $message, userId: $userId)
}
    `;
const useSendDirectMessageMutation = (options) => (0, react_query_1.useMutation)(["SendDirectMessage"], (variables) => fetcher(exports.SendDirectMessageDocument, variables)(), options);
exports.useSendDirectMessageMutation = useSendDirectMessageMutation;
exports.useSendDirectMessageMutation.fetcher = (variables) => fetcher(exports.SendDirectMessageDocument, variables);
exports.UnbanUserDocument = `
    mutation UnbanUser($channelId: Int!, $userId: Int!) {
  unbanUser(channelId: $channelId, userId: $userId)
}
    `;
const useUnbanUserMutation = (options) => (0, react_query_1.useMutation)(["UnbanUser"], (variables) => fetcher(exports.UnbanUserDocument, variables)(), options);
exports.useUnbanUserMutation = useUnbanUserMutation;
exports.useUnbanUserMutation.fetcher = (variables) => fetcher(exports.UnbanUserDocument, variables);
exports.UnblockUserDocument = `
    mutation UnblockUser($userId: Int!) {
  unblockUser(userId: $userId)
}
    `;
const useUnblockUserMutation = (options) => (0, react_query_1.useMutation)(["UnblockUser"], (variables) => fetcher(exports.UnblockUserDocument, variables)(), options);
exports.useUnblockUserMutation = useUnblockUserMutation;
exports.useUnblockUserMutation.fetcher = (variables) => fetcher(exports.UnblockUserDocument, variables);
exports.UnfriendUserDocument = `
    mutation UnfriendUser($userId: Int!) {
  unfriendUser(userId: $userId)
}
    `;
const useUnfriendUserMutation = (options) => (0, react_query_1.useMutation)(["UnfriendUser"], (variables) => fetcher(exports.UnfriendUserDocument, variables)(), options);
exports.useUnfriendUserMutation = useUnfriendUserMutation;
exports.useUnfriendUserMutation.fetcher = (variables) => fetcher(exports.UnfriendUserDocument, variables);
exports.UnmuteUserDocument = `
    mutation UnmuteUser($channelId: Int!, $userId: Int!) {
  unmuteUser(channelId: $channelId, userId: $userId)
}
    `;
const useUnmuteUserMutation = (options) => (0, react_query_1.useMutation)(["UnmuteUser"], (variables) => fetcher(exports.UnmuteUserDocument, variables)(), options);
exports.useUnmuteUserMutation = useUnmuteUserMutation;
exports.useUnmuteUserMutation.fetcher = (variables) => fetcher(exports.UnmuteUserDocument, variables);
exports.UpdateChannelPasswordDocument = `
    mutation UpdateChannelPassword($channelId: Int!, $password: String) {
  updatePassword(channelId: $channelId, password: $password)
}
    `;
const useUpdateChannelPasswordMutation = (options) => (0, react_query_1.useMutation)(["UpdateChannelPassword"], (variables) => fetcher(exports.UpdateChannelPasswordDocument, variables)(), options);
exports.useUpdateChannelPasswordMutation = useUpdateChannelPasswordMutation;
exports.useUpdateChannelPasswordMutation.fetcher = (variables) => fetcher(exports.UpdateChannelPasswordDocument, variables);
exports.UpdateUserNameDocument = `
    mutation UpdateUserName($name: String!) {
  updateUserName(name: $name)
}
    `;
const useUpdateUserNameMutation = (options) => (0, react_query_1.useMutation)(["UpdateUserName"], (variables) => fetcher(exports.UpdateUserNameDocument, variables)(), options);
exports.useUpdateUserNameMutation = useUpdateUserNameMutation;
exports.useUpdateUserNameMutation.fetcher = (variables) => fetcher(exports.UpdateUserNameDocument, variables);
exports.UserChatsAndFriendsDocument = `
    query UserChatsAndFriends {
  user {
    id
    channels {
      __typename
      id
      name
      messages {
        __typename
        author {
          id
        }
        content
        sentAt
        readBy {
          user {
            id
          }
        }
      }
    }
    friends {
      __typename
      id
      name
      avatar
      messages {
        __typename
        author {
          id
        }
        content
        sentAt
        readAt
      }
      friendStatus
    }
    pendingFriends {
      __typename
      id
      name
      avatar
      friendStatus
    }
  }
}
    `;
const useUserChatsAndFriendsQuery = (variables, options) => (0, react_query_1.useQuery)(variables === undefined
    ? ["UserChatsAndFriends"]
    : ["UserChatsAndFriends", variables], fetcher(exports.UserChatsAndFriendsDocument, variables), options);
exports.useUserChatsAndFriendsQuery = useUserChatsAndFriendsQuery;
exports.useUserChatsAndFriendsQuery.getKey = (variables) => variables === undefined
    ? ["UserChatsAndFriends"]
    : ["UserChatsAndFriends", variables];
exports.useUserChatsAndFriendsQuery.fetcher = (variables) => fetcher(exports.UserChatsAndFriendsDocument, variables);
exports.UserProfileDocument = `
    query UserProfile($userId: Int) {
  user(id: $userId) {
    id
    name
    avatar
    rank
    games {
      finishedAt
      gamemode
      players {
        player1 {
          avatar
          name
          rank
          id
        }
        player2 {
          avatar
          name
          rank
          id
        }
      }
      score {
        player1Score
        player2Score
      }
      startAt
    }
    blocked
    blocking
    friends {
      id
    }
    achievements {
      name
      icon
    }
    friendStatus
  }
}
    `;
const useUserProfileQuery = (variables, options) => (0, react_query_1.useQuery)(variables === undefined ? ["UserProfile"] : ["UserProfile", variables], fetcher(exports.UserProfileDocument, variables), options);
exports.useUserProfileQuery = useUserProfileQuery;
exports.useUserProfileQuery.getKey = (variables) => variables === undefined ? ["UserProfile"] : ["UserProfile", variables];
exports.useUserProfileQuery.fetcher = (variables) => fetcher(exports.UserProfileDocument, variables);
exports.UserProfileHeaderDocument = `
    query UserProfileHeader {
  user {
    id
    avatar
  }
}
    `;
const useUserProfileHeaderQuery = (variables, options) => (0, react_query_1.useQuery)(variables === undefined
    ? ["UserProfileHeader"]
    : ["UserProfileHeader", variables], fetcher(exports.UserProfileHeaderDocument, variables), options);
exports.useUserProfileHeaderQuery = useUserProfileHeaderQuery;
exports.useUserProfileHeaderQuery.getKey = (variables) => variables === undefined
    ? ["UserProfileHeader"]
    : ["UserProfileHeader", variables];
exports.useUserProfileHeaderQuery.fetcher = (variables) => fetcher(exports.UserProfileHeaderDocument, variables);
//# sourceMappingURL=generated.js.map