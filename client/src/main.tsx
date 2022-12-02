import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { GameRouter } from "./game/router";
import SideBar from "./sidebar/sidebar";
import queryClient from "./query";
import { useAuthStore } from "./stores";
import "./index.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { io } from "socket.io-client";
import { InvalidCacheTarget } from "@apps/shared";
import {
  useChannelDiscussionQuery,
  useChannelSettingsQuery,
  useDirectMessagesQuery,
  useUserChatsAndFriendsQuery,
  useUserProfileQuery,
} from "./graphql/generated";
//TODO Mutation direct message invalidate all in once, or it's bugs
// TODO Leave channel as owner make a other member owner randomly ?
// TODOFirefox localhost:5555 bug
//TODO how does it knows delete channel when nobody in
//TODO if ban not show the change inside channel ?
let init = false;
const App = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!init) {
      init = true;
      fetch("/auth/session").then(async (res) => {
        if (res.status === 200) {
          const data = await res.text();
          if (data === "ok") {
            useAuthStore.getState().login();
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const socket = io();

      socket.on("connect", () => {
        console.log("connected", socket);
      });

      socket.on("disconnect", () => {
        console.log("disconnected", socket);
      });

      socket.on(
        "invalidateCache",
        (data: { cacheTarget: InvalidCacheTarget; targetId: number }) => {
          switch (data.cacheTarget) {
            case InvalidCacheTarget.DIRECT_MESSAGE:
              queryClient.invalidateQueries(
                useDirectMessagesQuery.getKey({ userId: data.targetId })
              );
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              break;
            case InvalidCacheTarget.BLOCK_USER:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              queryClient.invalidateQueries(
                useUserProfileQuery.getKey({ userId: data.targetId })
              );
              queryClient.invalidateQueries(useDirectMessagesQuery.getKey({}));
              break;
            case InvalidCacheTarget.INVITATION_FRIEND:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              queryClient.invalidateQueries(
                useUserProfileQuery.getKey({ userId: data.targetId })
              );
              break;
            case InvalidCacheTarget.REFUSE_INVITATION_FRIEND:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              queryClient.invalidateQueries(
                useUserProfileQuery.getKey({ userId: data.targetId })
              );
              break;
            case InvalidCacheTarget.UPDATE_USER_NAME:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              queryClient.invalidateQueries(
                useUserProfileQuery.getKey({ userId: data.targetId })
              );
              break;
            case InvalidCacheTarget.FRIEND_USER:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              queryClient.invalidateQueries(
                useUserProfileQuery.getKey({ userId: data.targetId })
              );
              break;
            case InvalidCacheTarget.UNFRIEND_USER:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              queryClient.invalidateQueries(
                useUserProfileQuery.getKey({ userId: data.targetId })
              );
              queryClient.invalidateQueries(useDirectMessagesQuery.getKey({}));
              break;
            case InvalidCacheTarget.CANCEL_INVITATION:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              queryClient.invalidateQueries(
                useUserProfileQuery.getKey({ userId: data.targetId })
              );
              break;
            case InvalidCacheTarget.UNBLOCK_USER:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              queryClient.invalidateQueries(
                useUserProfileQuery.getKey({ userId: data.targetId })
              );
              break;
            case InvalidCacheTarget.READ_DIRECT_MESSAGE:
              queryClient.invalidateQueries(
                useDirectMessagesQuery.getKey({ userId: data.targetId })
              );
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              break;
            case InvalidCacheTarget.AVATAR_USER:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              queryClient.invalidateQueries(
                useUserProfileQuery.getKey({ userId: data.targetId })
              );
              break;
            case InvalidCacheTarget.JOIN_CHANNEL:
              queryClient.invalidateQueries(
                useChannelSettingsQuery.getKey({ channelId: data.targetId })
              );
              break;
            case InvalidCacheTarget.LEAVE_CHANNEL:
              queryClient.invalidateQueries(
                useChannelSettingsQuery.getKey({ channelId: data.targetId })
              );
              break;
            case InvalidCacheTarget.DELETE_CHANNEL:
              queryClient.invalidateQueries(
                useChannelSettingsQuery.getKey({ channelId: data.targetId })
              );
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              break;
            case InvalidCacheTarget.MUTE_USER:
              queryClient.invalidateQueries(
                useChannelSettingsQuery.getKey({ channelId: data.targetId })
              );
              queryClient.invalidateQueries(
                useChannelDiscussionQuery.getKey({ channelId: data.targetId })
              );
              break;
            case InvalidCacheTarget.BAN_USER:
              queryClient.invalidateQueries(
                useChannelSettingsQuery.getKey({ channelId: data.targetId })
              );
              queryClient.invalidateQueries(
                useChannelDiscussionQuery.getKey({ channelId: data.targetId })
              );
              break;
            case InvalidCacheTarget.UNMUTE_USER:
              queryClient.invalidateQueries(
                useChannelSettingsQuery.getKey({ channelId: data.targetId })
              );
              queryClient.invalidateQueries(
                useChannelDiscussionQuery.getKey({ channelId: data.targetId })
              );
              break;
            case InvalidCacheTarget.UNBAN_USER:
              queryClient.invalidateQueries(
                useChannelSettingsQuery.getKey({ channelId: data.targetId })
              );
              queryClient.invalidateQueries(
                useChannelDiscussionQuery.getKey({ channelId: data.targetId })
              );
              break;
            case InvalidCacheTarget.INVITE_USER:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              break;
            case InvalidCacheTarget.ADD_ADMIN:
              queryClient.invalidateQueries(
                useChannelSettingsQuery.getKey({ channelId: data.targetId })
              );
              break;
            case InvalidCacheTarget.REMOVE_ADMIN:
              queryClient.invalidateQueries(
                useChannelSettingsQuery.getKey({ channelId: data.targetId })
              );
              break;
            case InvalidCacheTarget.SEND_CHANNEL_MESSAGE:
              queryClient.invalidateQueries(
                useChannelDiscussionQuery.getKey({ channelId: data.targetId })
              );
              break;
            case InvalidCacheTarget.CREATE_CHANNEL_MESSAGE_READ:
              queryClient.invalidateQueries(
                useChannelDiscussionQuery.getKey({ channelId: data.targetId })
              );
              break;
            default:
              ((_: never) => _)(data.cacheTarget);
          }
        }
      );

      return () => {
        socket.close();
      };
    }
  }, [isLoggedIn]);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <GameRouter />
        {isLoggedIn ? <SideBar /> : null}
        <ReactQueryDevtools initialIsOpen={false} panelPosition="left" />
      </QueryClientProvider>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
