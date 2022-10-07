import React from "react";
import ReactDOM from "react-dom/client";
import Icon from "@mdi/react";
import {
  mdiAccountGroup,
  mdiChevronRight,
  mdiCloseThick,
  mdiMenu,
} from "@mdi/js";

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
      className={`${className} m-2 flex self-center rounded-full bg-blue-500 p-2 py-2 px-4 font-bold text-white shadow-inner transition-all hover:bg-blue-700`}
      onClick={togglePopUp}
    >
      Join game !
    </button>
  );
};

const ClosePopUp = ({
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
      className={`${className} absolute top-0 right-0 m-2`}
      onClick={togglePopUp}
    >
      <Icon path={mdiCloseThick} title="Close popup" size={1} />
    </button>
  );
};
const CreateGameBtn = ({
  className,
  creategame,
  setCreateGame,
}: {
  className?: string;
  creategame: boolean;
  setCreateGame: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const togglePopUp = () => {
    setCreateGame(!creategame);
  };

  return (
    <button
      className={`${className} m-2 flex self-center rounded-full bg-blue-500 p-2 py-2 px-4 font-bold text-white shadow-inner transition-all hover:bg-blue-700`}
      onClick={togglePopUp}
    >
      Create game !
    </button>
  );
};
const CreateGameOption1 = ({
  className,
  checked,
  onChange,
}: {
  className?: string;
  checked: boolean;
  onChange: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const togglePopUp = () => {
    onChange(!checked);
  };

  return <div className={`${className} `} onClick={togglePopUp}></div>;
};

const App = () => {
  const [rightBar, setRightBar] = React.useState(false);
  const [popup, setPopUp] = React.useState(false);
  const [creategame, setCreateGame] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const handleChange = () => {
    setChecked(!checked);
  };
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
            <div className="flex h-full w-full  flex-row flex-wrap justify-center">
              <CreateGameBtn
                className=""
                creategame={creategame}
                setCreateGame={setCreateGame}
              />
              <div
                className={`${
                  creategame ? "" : "hidden"
                } absolute top-0 left-0 flex h-full w-full justify-center    bg-gray-900/80 `}
              >
                <div
                  className={`${
                    checked ? "bg-red-400" : "bg-yellow-200"
                  } flex h-2/3 w-2/3 flex-row self-center bg-slate-200 `}
                >
                  <div className="w-2/3">
                    {checked && (
                      <CreateGameOption1
                        className=""
                        checked={checked}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                  <div className=" flex  w-1/3 flex-col justify-center space-y-4">
                    <div className="">
                      <label htmlFor="red-toggle">
                        Setting
                        <input
                          className=" w-7 rounded-full bg-red-600"
                          type="checkbox"
                          checked={checked}
                          onChange={handleChange}
                        />
                      </label>
                    </div>

                    <div>
                      <label htmlFor="yellow-toggle">
                        Setting
                        <input
                          className="w-7 rounded-full bg-yellow-500"
                          type="checkbox"
                          value=""
                          id="yellow-toggle"
                        ></input>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <JoinGameBtn className="" popup={popup} setPopUp={setPopUp} />

              <div
                className={`${
                  popup ? "" : "hidden"
                } absolute top-0 left-0 flex h-full w-full justify-center    bg-gray-900/80 `}
              >
                <div className="relative flex h-2/3 w-2/3 flex-row self-center bg-slate-200">
                  <ClosePopUp className="" popup={popup} setPopUp={setPopUp} />
                  <div className="flex h-full w-2/3"></div>
                  <div className="w-1/3 flex-col ">
                    <div className="flex h-1/2 w-full justify-center">
                      <button className="flex h-2/3 w-2/3 items-center justify-center self-center rounded-full bg-slate-500 font-bold text-white shadow-inner transition-all hover:bg-slate-700 hover:text-xl">
                        Join classic game
                      </button>
                    </div>
                    <div className="flex h-1/2 w-full justify-center">
                      <button className=" flex h-2/3 w-2/3 items-center justify-center self-center rounded-full bg-slate-500 font-bold text-white shadow-inner transition-all hover:bg-slate-700 hover:text-xl">
                        Join custom game
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
