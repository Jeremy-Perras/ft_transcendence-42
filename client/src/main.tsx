import { Model, AppEvent, SocketParser } from "@apps/shared";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { io, Socket } from "socket.io-client";
import { z } from "zod";
import { useAuthStore } from "./stores";

let init = false;
const App = () => {
  let socket: Socket;

  const isLoggedIn = !!useAuthStore((state) => state.userId);

  useEffect(() => {
    if (!init) {
      init = true;
      fetch("/auth/session").then(async (res) => {
        if (res.status === 200) {
          const data = await res.json();
          const userId = data?.userId;
          if (userId) {
            useAuthStore.setState({ userId });
          }
        }
      });
    }
  }, []);

  const handleData = (
    data: z.infer<typeof Model> | z.infer<typeof Model>[]
  ) => {
    if (Array.isArray(data)) data.forEach((d) => handleData(d));
    else {
      const parsed = Model.safeParse(data);
      if (parsed.success) {
        switch (parsed.data.type) {
          case "OTHER_USER":
            console.log(parsed.data);
            break;
          case "SELF":
            console.log(parsed.data);
            break;
          case "DIRECT_MESSAGE":
            console.log(parsed.data);
            break;
          case "CHANNEL":
            console.log(parsed.data);
            break;
          case "CHANNEL_MEMBER":
            console.log(parsed.data);
            break;
          case "CHANNEL_RESTRICTION":
            console.log(parsed.data);
            break;
          case "CHANNEL_MESSAGE":
            console.log(parsed.data);
            break;
          case "SEARCH_RESULT":
            console.log(parsed.data);
            break;
          case "CHATS":
            console.log(parsed.data);
            break;
          case "DELETED_CHANNEL":
            console.log(parsed.data);
            break;
          case "REMOVE_MEMBER":
            console.log(parsed.data);
            break;
          default:
            ((_: never) => _)(parsed.data);
        }
      }
    }
  };

  const sendEvent = (event: z.infer<typeof AppEvent>) => {
    socket.emit("event", event, handleData);
  };

  useEffect(() => {
    if (isLoggedIn) {
      socket = io({ parser: SocketParser });

      socket.on("connect", () => {
        console.warn("Socket connected: ", socket); // TODO
      });

      socket.on("disconnect", () => {
        console.warn("Socket disconnected: ", socket); // TODO
      });

      socket.on("event", handleData);

      socket.on("test", (data) => {
        console.log(data);
      });
    }

    return () => {
      if (socket) socket.close();
    };
  }, [isLoggedIn]);

  return (
    <div>
      {isLoggedIn ? (
        <button
          onClick={() => {
            sendEvent({ event: "GET_USER", data: { userId: 1 } });
          }}
        >
          send event
        </button>
      ) : (
        <a href="http://localhost:3000/auth/login">login</a>
      )}
    </div>
  );
};

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
