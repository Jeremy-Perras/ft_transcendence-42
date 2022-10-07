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
      <div className="relative flex flex-row h-full w-full p-2 lg:p-10 2xl:p-28 justify-center items-center bg-slate-200">
        <div className="flex h-2/3 w-1/3 justify-center items-center">
          {" "}
          <motion.div
            className="flex w-full h-full bg-black m-2 lg:m-10 2xl:m-28 rounded-lg"
            initial={{ opacity: 0.6 }}
            whileHover={{ scale: [null, 1.5, 1.4], opacity: 1 }}
            whileTap={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex h-2/3 w-1/3 justify-center items-center">
          {" "}
          <motion.div
            className="w-full h-full bg-black m-2 lg:m-10 2xl:m-28 rounded-lg"
            initial={{ opacity: 0.6 }}
            whileHover={{ scale: [null, 1.5, 1.4], opacity: 1 }}
            whileTap={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex h-2/3 w-1/3 justify-center items-center">
          {" "}
          <motion.div
            className="w-full h-full bg-black m-2 lg:m-10 2xl:m-28 rounded-lg"
            initial={{ opacity: 0.6 }}
            whileHover={{ scale: [null, 1.5, 1.4], opacity: 1 }}
            whileTap={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
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
