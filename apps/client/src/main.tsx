import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { GameRouter } from "./game/router";
import SideBar from "./sidebar/sidebar";
import queryClient from "./query";
import { useAuthStore } from "./stores";
import "./index.css";
import { io, Socket } from "socket.io-client";
import { useInfoUserProfileQuery } from "./graphql/generated";
import { DefaultEventsMap } from "@socket.io/component-emitter";
let init = false;
export let socket: Socket<DefaultEventsMap, DefaultEventsMap>; //TODO : mutation to set socket ? shared table with connected clients?
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
            socket = io("http://localhost:8080");
          }
        }
      });
    }
  }, []);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <GameRouter />
        {isLoggedIn ? <SideBar /> : null}
      </QueryClientProvider>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
