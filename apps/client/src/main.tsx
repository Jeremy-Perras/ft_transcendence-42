import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Main from "./main/main";
import SideBar from "./sidebar/sidebar";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="relative flex h-full overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <Main />
        <SideBar />
      </QueryClientProvider>
    </div>
  </React.StrictMode>
);
