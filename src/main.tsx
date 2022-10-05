import React from "react";
import ReactDOM from "react-dom/client";
import Icon from "@mdi/react";
import { mdiAccountGroup, mdiChevronRight, mdiMenu } from "@mdi/js";

import "./index.css";

const RightBarBtn = ({
  className,
  rightBar,
  setRightBar,
}: {
  className?: string;
  rightBar: boolean;
  setRightBar: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const toggleBar = () => {
    setRightBar(!rightBar);
  };

  return (
    <button
      className={`${className} p-1 transition-colors duration-200 hover:text-gray-500 lg:hidden`}
      onClick={toggleBar}
    >
      <Icon
        path={rightBar ? mdiChevronRight : mdiAccountGroup}
        title="Close menu"
        size={1}
      />
    </button>
  );
};

const App = () => {
  const [rightBar, setRightBar] = React.useState(false);

  return (
    <div className="relative flex h-full">
      <div className="flex grow-0 basis-12 bg-slate-900 2xl:block 2xl:basis-64">
        <div className="flex grow justify-center">
          <span className="hidden text-white 2xl:block">PONG</span>
          <Icon
            className="2xl:hidden"
            path={mdiMenu}
            size={1.4}
            color="white"
          />
        </div>
      </div>

      <div className="flex grow basis-auto flex-col  bg-slate-50">
        <div className="flex">
          <button>create game</button>
          <button>join game</button>
        </div>
        {!rightBar && (
          <RightBarBtn
            className="absolute top-0 right-0"
            rightBar={rightBar}
            setRightBar={setRightBar}
          />
        )}

        <p>hello</p>
      </div>

      <div
        className={`${rightBar ? "" : "hidden"}
        absolute 
          top-0 right-0 h-full w-96 grow-0 bg-slate-300 shadow-[0_0_20px_5px_rgba(15,23,42,0.3)] lg:static lg:block lg:basis-96 lg:shadow-none`}
      >
        <RightBarBtn rightBar={rightBar} setRightBar={setRightBar} />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
