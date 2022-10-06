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

const JoinGameBtn = ({
  className,
  popup,
  setPopUp,
}: {
  className?: string;
  popup: boolean;
  setPopUp: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const togglePopUp = () => {
    setPopUp(!popup);
  };

  return (
    <button
      className={`${className} m-2 flex self-center rounded-full bg-blue-500 p-2 py-2 px-4 font-bold text-white hover:bg-blue-700`}
      onClick={togglePopUp}
    >
      Join game !
    </button>
  );
};

const App = () => {
  const [rightBar, setRightBar] = React.useState(false);
  const [popup, setPopUp] = React.useState(false);
  return (
    <>
      <div className="relative flex h-full">
        <div className="absolute top-0 left-0 m-1 flex">
          <Icon
            className="mr-2"
            path={rightBar ? mdiChevronRight : mdiAccountGroup}
            title="Close menu"
            size={1}
          />
          <Icon
            path={rightBar ? mdiChevronRight : mdiAccountGroup}
            title="Close menu"
            size={1}
          />
        </div>
        <div className="relative h-full w-full">
          <div className="flex h-full w-full grow basis-auto  flex-col  bg-slate-50">
            <div className="flex justify-center p-3 text-8xl font-bold">
              Title
            </div>
            <div className="flex h-full  flex-row flex-wrap justify-center">
              <button className="m-2 self-center rounded-full bg-blue-500 p-2 py-2  px-4  font-bold text-white hover:bg-blue-700">
                create game
              </button>

              <JoinGameBtn className="" popup={popup} setPopUp={setPopUp} />

              <div
                className={`${
                  popup ? "" : "hidden"
                } absolute top-0 left-0 flex h-full w-full justify-center    bg-gray-900/30 `}
              >
                <div className="relative flex h-2/3 w-2/3 flex-row self-center border-2 bg-sky-400">
                  <div className="flex h-full w-2/3"></div>
                  <div className="w-1/3 flex-col ">
                    <div className="flex h-1/2 w-full justify-center">
                      <button className="flex h-2/3 w-1/3 items-center justify-center self-center rounded-full bg-blue-500  font-bold text-white hover:bg-blue-700">
                        Button
                      </button>
                    </div>
                    <div className="flex h-1/2 w-full justify-center">
                      <button className=" flex h-2/3 w-1/3 items-center justify-center self-center rounded-full bg-blue-500  font-bold text-white hover:bg-blue-700">
                        Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!rightBar && (
            <RightBarBtn
              className="absolute top-0 right-0"
              rightBar={rightBar}
              setRightBar={setRightBar}
            />
          )}
        </div>
        <div
          className={`${rightBar ? "" : "hidden"}
        absolute 
          top-0 right-0 h-full w-96 grow-0 bg-slate-300 shadow-[0_0_20px_5px_rgba(15,23,42,0.3)] lg:static lg:block lg:basis-96 lg:shadow-none`}
        >
          <RightBarBtn rightBar={rightBar} setRightBar={setRightBar} />
        </div>
      </div>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
