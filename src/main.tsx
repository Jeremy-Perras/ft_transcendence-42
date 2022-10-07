import React from "react";
import ReactDOM from "react-dom/client";
import Icon from "@mdi/react";
import {
  mdiAccountGroup,
  mdiChevronRight,
  mdiCloseThick,
  mdiDotsCircle,
} from "@mdi/js";
import { motion } from "framer-motion";

import Pong from "./pong.png";
import PongGif from "./pong.gif";
import Title from "./title.png";
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
      className={`${className} p-1 transition-colors duration-200 hover:text-gray-500 lg:invisible`}
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

const CreateGameBtn = ({
  className,
  popUpCreate,
  setPopUpCreate,
}: {
  className?: string;
  popUpCreate: boolean;
  setPopUpCreate: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const togglePopUp = () => {
    setPopUpCreate(!popUpCreate);
  };

  return (
    <button
      className={`${className} m-12 h-20 w-20 items-center justify-center self-center rounded-full bg-gradient-to-r 
    from-cyan-400 to-blue-400 p-2 py-2 px-4 font-mono text-xs font-bold text-white shadow-lg 
    transition-all hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-sm hover:shadow-xl
    sm:h-36 sm:w-36 sm:text-sm sm:hover:text-base lg:text-lg lg:hover:text-xl xl:h-52 xl:w-52 xl:text-xl xl:hover:text-2xl`}
      onClick={togglePopUp}
    >
      Create
      <br />
      game
    </button>
  );
};

const JoinGameBtn = ({
  className,
  popUpJoin,
  setPopUpJoin,
}: {
  className?: string;
  popUpJoin: boolean;
  setPopUpJoin: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const togglePopUp = () => {
    setPopUpJoin(!popUpJoin);
  };

  return (
    <button
      className={`${className} m-12 h-20 w-20 items-center justify-center self-center rounded-full bg-gradient-to-r 
      from-cyan-400 to-blue-400 p-2 py-2 px-4 font-mono text-xs font-bold text-white shadow-lg 
      transition-all hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-sm hover:shadow-xl
      sm:h-36 sm:w-36 sm:text-sm sm:hover:text-base lg:text-lg lg:hover:text-xl xl:h-52 xl:w-52 xl:text-xl xl:hover:text-2xl`}
      onClick={togglePopUp}
    >
      Join
      <br />
      game
    </button>
  );
};

const ClosePopUp = ({
  className,
  popUp,
  setPopUp,
}: {
  className?: string;
  popUp: boolean;
  setPopUp: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const togglePopUp = () => {
    setPopUp(!popUp);
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

const JoinClassic = ({
  className,
  popUpJoin,
  setPopUpJoin,
  popUpJoinClassic,
  setPopUpJoinClassic,
}: {
  className?: string;
  popUpJoin: boolean;
  setPopUpJoin: React.Dispatch<React.SetStateAction<boolean>>;
  popUpJoinClassic: boolean;
  setPopUpJoinClassic: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const togglePopUp = () => {
    setPopUpJoinClassic(!popUpJoinClassic);
    setPopUpJoin(!popUpJoin);
  };

  return (
    <button
      onClick={togglePopUp}
      className="flex h-20 w-20 items-center justify-center self-center rounded-full bg-slate-500 
                      font-mono font-bold text-white shadow-lg transition-all
                       duration-100 hover:bg-slate-700 hover:shadow-xl hover:duration-300 sm:h-36 sm:w-36
                       sm:text-sm sm:hover:text-base lg:text-lg lg:hover:text-xl xl:h-52 
                       xl:w-52 xl:text-xl xl:hover:text-2xl"
    >
      Join
      <br />
      classic
    </button>
  );
};

const App = () => {
  const [rightBar, setRightBar] = React.useState(false);
  const [popUpJoin, setPopUpJoin] = React.useState(false);
  const [popUpJoinClassic, setPopUpJoinClassic] = React.useState(false);
  const [popUpCreate, setPopUpCreate] = React.useState(false);
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
          <div
            className="flex h-full w-full grow basis-auto  flex-col "
            style={{
              backgroundImage: `url(${Pong})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
              flex: 1,
              width: "100%",
              height: "100vh",
            }}
          >
            <div
              className="flex align-top "
              style={{
                backgroundImage: `url(${Title})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                height: "25%",
                backgroundSize: "40%",
              }}
            ></div>
            {/* <div>
              {" "}
              <motion.div
                className="w-48 h-48 bg-blue-500"
                /**
                 * Setting the initial keyframe to "null" will use
                 * the current value to allow for interruptable keyframes.
                 */
                whileHover={{ scale: [null, 1.5, 1.4] }}
                transition={{ duration: 0.3 }}
              />
            </div> */}
            <div className="flex h-full w-full flex-row  justify-center">
              <CreateGameBtn
                className=""
                popUpCreate={popUpCreate}
                setPopUpCreate={setPopUpCreate}
              />
              <JoinGameBtn
                className=""
                popUpJoin={popUpJoin}
                setPopUpJoin={setPopUpJoin}
              />
              {/* POP-UP JOIN GAME */}
              <div
                className={`${
                  popUpJoin ? "visible opacity-100" : "invisible opacity-0"
                } absolute top-0 left-0 flex h-full w-full justify-center bg-gray-900/80 `}
              >
                <div
                  className={`${
                    popUpJoin ? "visible opacity-100" : "invisible opacity-0"
                  } relative flex h-2/3 w-2/3 flex-row self-center bg-slate-200 transition-all  duration-300 `}
                >
                  <ClosePopUp
                    className=""
                    popUp={popUpJoin}
                    setPopUp={setPopUpJoin}
                  />
                  <div className="flex h-full w-2/3"></div>
                  <div className="w-1/3 flex-col ">
                    <div className="flex h-1/2 w-full justify-center">
                      <JoinClassic
                        className=""
                        popUpJoin={popUpJoin}
                        setPopUpJoin={setPopUpJoin}
                        popUpJoinClassic={popUpJoinClassic}
                        setPopUpJoinClassic={setPopUpJoinClassic}
                      />
                    </div>
                    <div className="flex h-1/2 w-full justify-center">
                      <button
                        className="flex h-20 w-20 items-center justify-center self-center rounded-full bg-slate-500 font-mono
                       font-bold text-white shadow-lg transition-all duration-100
                        hover:bg-slate-700 hover:shadow-xl hover:duration-300 
                        sm:h-36 sm:w-36 sm:text-sm sm:hover:text-base lg:text-lg lg:hover:text-xl 
                        xl:h-52 xl:w-52 xl:text-xl xl:hover:text-2xl"
                      >
                        Join
                        <br />
                        custom
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* POP-UP JOIN CLASSIC GAME */}
              <div
                className={`${
                  popUpJoinClassic
                    ? "visible opacity-100"
                    : "invisible opacity-0"
                } absolute top-0 left-0 flex h-full w-full justify-center bg-gray-900/80 `}
              >
                <div
                  className={`${
                    popUpJoinClassic
                      ? "visible opacity-100"
                      : "invisible opacity-0"
                  } relative flex h-2/3 w-2/3 flex-row self-center bg-slate-200`}
                >
                  <ClosePopUp
                    className=""
                    popUp={popUpJoinClassic}
                    setPopUp={setPopUpJoinClassic}
                  />
                  <div className="w-full relative flex flex-col justify-center self-center items-center">
                    <div className="items-center flex justify-center self-center text-3xl font-bold p-10">
                      Matchmaking...
                    </div>
                    <Icon
                      path={mdiDotsCircle}
                      color="black-100"
                      title="Waiting"
                      size={5}
                      className="animate-spin"
                    />
                  </div>
                </div>
              </div>
              {/* POP-UP CREATE GAME */}
              <div
                className={`${
                  popUpCreate ? "visible opacity-100" : "invisible opacity-0"
                } absolute top-0 left-0 flex h-full w-full justify-center bg-gray-900/80 transition-all   duration-300 `}
              >
                <div className="relative flex h-2/3 w-2/3 flex-row self-center bg-slate-200">
                  <ClosePopUp
                    className=""
                    popUp={popUpCreate}
                    setPopUp={setPopUpCreate}
                  />
                  <div className="flex h-full w-2/3"></div>
                  <div className="w-1/3 flex-col ">
                    <div className="flex h-1/2 w-full justify-center">
                      <button
                        className="flex h-20 w-20 items-center justify-center self-center rounded-full bg-slate-500 
                      font-mono font-bold text-white shadow-lg transition-all
                       duration-100 hover:bg-slate-700 hover:shadow-xl hover:duration-300 sm:h-36 sm:w-36
                       sm:text-sm sm:hover:text-base lg:text-lg lg:hover:text-xl xl:h-52 
                       xl:w-52 xl:text-xl xl:hover:text-2xl"
                      >
                        Create
                        <br />
                        classic
                      </button>
                    </div>
                    <div className="flex h-1/2 w-full justify-center">
                      <button
                        className="flex h-20 w-20 items-center justify-center self-center rounded-full bg-slate-500 font-mono
                       font-bold text-white shadow-lg transition-all duration-100
                        hover:bg-slate-700 hover:shadow-xl hover:duration-300 
                        sm:h-36 sm:w-36 sm:text-sm sm:hover:text-base lg:text-lg lg:hover:text-xl 
                        xl:h-52 xl:w-52 xl:text-xl xl:hover:text-2xl"
                      >
                        Create
                        <br />
                        custom
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
          className={`${rightBar ? "" : "invisible"}
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

// export default function App() {
//   return (
//     <motion.div
//       className="box"
//       /**
//        * Setting the initial keyframe to "null" will use
//        * the current value to allow for interruptable keyframes.
//        */
//       whileHover={{ scale: [null, 1.5, 1.4] }}
//       transition={{ duration: 0.3 }}
//     />
//   );
// }
