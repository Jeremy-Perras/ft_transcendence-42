import React from "react";
import { useState } from "react";
import ReactDOM from "react-dom/client";
import { Transition } from "@headlessui/react";
import Icon from "@mdi/react";
import { mdiAccountGroup, mdiClose } from "@mdi/js";

import Dialog from "./Dialog";

import "./index.css";

function Social({ className }: { className?: string }) {
  const [isShowing, setIsShowing] = useState(true);
  const [showSocialBtn, setShowSocialBtn] = useState(false);

  return (
    <div className="flex overflow-hidden">
      {showSocialBtn && (
        <span className=" delay-700 relative inline-flex self-start">
          <button
            type="button"
            className="inline-flex  px-4 py-2"
            onClick={() => {
              setIsShowing(() => true);
              setShowSocialBtn(() => false);
            }}
          >
            <Icon
              path={mdiAccountGroup}
              title="Social"
              size={1.5}
              className={isShowing ? "text-slate-800" : "text-slate-300"}
            />
          </button>
          <span className="absolute top-3 right-3 -mt-1 -mr-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
        </span>
      )}
      <Transition
        show={isShowing}
        enter="transform transition ease-in-out duration-500"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-500"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
        afterLeave={() => setShowSocialBtn(() => true)}
      >
        <div
          className={`${className} top-0 right-0 h-full w-96 grow-0 bg-slate-300 lg:static lg:block lg:basis-96`}
        >
          <button
            type="button"
            className="inline-flex  px-4 py-2"
            onClick={() => setIsShowing(() => false)}
          >
            <Icon path={mdiClose} title="close" size={1} />
          </button>
        </div>
      </Transition>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="flex h-full bg-slate-50">
      <div className="flex grow basis-auto flex-col  "></div>
      <Dialog />
      <Social />
    </div>
  </React.StrictMode>
);
