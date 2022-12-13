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
import {
  useDirectMessagesQuery,
  useDiscussionsAndInvitationsQuery,
  useChannelDiscussionQuery,
} from "./graphql/generated";
let init = false;
const App = () => {
  const isLoggedIn = !!useAuthStore((state) => state.userId);

  useEffect(() => {
    if (!init) {
      init = true;
      fetch("/auth/session").then(async (res) => {
        if (res.status === 200) {
          const data = await res.json();
          const userId = data?.userId;
          if (userId) {
            useAuthStore.getState().login(userId);
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

      // TODO: invalidate cache events
      socket.on("invalidateDirectMessageCache", (targetId: number) => {
        queryClient.invalidateQueries(
          useDirectMessagesQuery.getKey({ userId: targetId })
        );
        queryClient.invalidateQueries(
          useDiscussionsAndInvitationsQuery.getKey({})
        );
        queryClient.invalidateQueries(
          useDiscussionsAndInvitationsQuery.getKey({
            userId: targetId,
          })
        );
      });

      socket.on("invalidateChannelMessageCache", (targetId: number) => {
        queryClient.invalidateQueries(
          useChannelDiscussionQuery.getKey({ channelId: targetId })
        );
        queryClient.invalidateQueries(
          useDiscussionsAndInvitationsQuery.getKey({})
        );
      });

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
