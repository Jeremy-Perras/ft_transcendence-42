import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { GameRouter } from "./game/router";
import SideBar from "./sidebar/sidebar";
import queryClient from "./query";
import { useAuthStore } from "./stores";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";

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

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <GameRouter />
        {isLoggedIn ? <SideBar /> : null}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
