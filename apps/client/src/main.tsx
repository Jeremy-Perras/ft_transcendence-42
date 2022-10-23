import React from "react";
import ReactDOM from "react-dom/client";
import Main from "./main/main";
import SideBar from "./sidebar/sidebar";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="relative flex h-full overflow-hidden">
      <Main />
      <SideBar />
    </div>
  </React.StrictMode>
);
