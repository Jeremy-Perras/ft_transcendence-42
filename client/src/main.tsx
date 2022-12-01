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
  useDirectMessagesQuery,
  useUserChatsAndFriendsQuery,
} from "./graphql/generated";
//TODO Mutation direct message invalidate all in once, or it's bugs
//TODO When submit a message not focus the sideBar
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
              break;
            case InvalidCacheTarget.INVITATION_FRIEND:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              break;
            case InvalidCacheTarget.REFUSE_INVITATION_FRIEND:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              break;
            case InvalidCacheTarget.UPDATE_USER_NAME:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              break;
            case InvalidCacheTarget.FRIEND_USER:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              break;
            case InvalidCacheTarget.UNFRIEND_USER:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              break;
            case InvalidCacheTarget.CANCEL_INVITATION:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
              );
              break;
            case InvalidCacheTarget.UNBLOCK_USER:
              queryClient.invalidateQueries(
                useUserChatsAndFriendsQuery.getKey({})
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
