import React from "react";
import ReactDOM from "react-dom/client";
import Main from "./main/main";
import SideBar from "./sidebar/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="relative flex h-full overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <Main />
        <SideBar />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  </React.StrictMode>
);
