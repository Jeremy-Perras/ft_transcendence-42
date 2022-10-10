import React from "react";
import ReactDOM from "react-dom/client";

import { motion } from "framer-motion";

import Verso from "./pongClassic.png";
import Recto from "./pong_classic.png";
import "./index.css";
import { useTransform } from "framer-motion";
import { useMotionValue } from "framer-motion";

const Open_back = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div
      className=" absolute top-0 right-0 h-full w-full bg-purple-500 p-2 opacity-50"
      onClick={() => setIsOpen((isOpen) => !isOpen)}
    ></div>
  );
};

const Rules = ({
  className,
  state,
  setState,
}: {
  className: string;
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const isEnter = () => {
    setState(!state);
  };

  return (
    <div
      className={`${className} h-full w-full bg-black`}
      onMouseEnter={isEnter}
    ></div>
  );
};

const First_Card = ({
  isOpen,
  setIsOpen,
  state,
  setState,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const isEnter = () => {
    setState(!state);
  };
  const newLocal = "spring";
  return (
    <motion.div
      initial={{ x: "-100%" }}
      transition={{ duration: 2 }}
      animate={{ x: "calc(0vw )" }}
      style={{
        backgroundImage: `url(${Verso})`, //change bg if is open or not
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "70%",
        backgroundSize: "40%",
      }}
      className="m-2 flex h-full w-full items-center justify-center  bg-slate-700"
    >
      <motion.div
        className={` ${
          state ? " " : "bg-blue-600 "
        } m-2 h-full w-full rounded-3xl `}
        onMouseEnter={isEnter}
        onMouseLeave={isEnter}
        initial={{ opacity: 0.3 }}
        whileHover={{ scale: [null, 1.1, 1.1], opacity: 0.6 }}
        whileTap={{ scale: 1.1 }}
        transition={{ duration: 0.8 }}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      />
    </motion.div>
  );
};
const Second_Card = ({
  isOpen,
  setIsOpen,
  state,
  setState,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const isEnter = () => {
    setState(!state);
  };
  const newLocal = "spring";
  return (
    <motion.div
      initial={{ x: "-200%" }}
      transition={{ duration: 2 }}
      animate={{ x: "calc(0vw )" }}
      style={{
        backgroundImage: `url(${Verso})`, //change bg if is open or not
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "70%",
        backgroundSize: "40%",
      }}
      className="m-2 flex h-full w-full items-center  justify-center bg-slate-700 "
    >
      <motion.div
        className={` ${
          state ? " " : "bg-blue-600 "
        } m-2 h-full w-full rounded-3xl `}
        onMouseEnter={isEnter}
        onMouseLeave={isEnter}
        initial={{ opacity: 0.3 }}
        whileHover={{ scale: [null, 1.1, 1.1], opacity: 0.6 }}
        whileTap={{ scale: 1.1 }}
        transition={{ duration: 0.8 }}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      />
    </motion.div>
  );
};
const Third_Card = ({
  isOpen,
  setIsOpen,
  state,
  setState,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const isEnter = () => {
    setState(!state);
  };
  return (
    <motion.div
      initial={{ x: "-300%" }}
      transition={{ duration: 2 }}
      animate={{ x: "calc(0vw )" }}
      style={{
        backgroundImage: `url(${Recto})`, //change bg if is open or not
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "70%",
        backgroundSize: "100%",
      }}
      className="m-2 flex h-full w-full items-center  justify-center rounded-3xl bg-slate-700 opacity-60"
    >
      <motion.div
        className="m-2 flex h-full w-full items-center  justify-center rounded-3xl bg-slate-700"
        initial={{ opacity: 0.3 }}
        whileHover={{ scale: [null, 1.1], opacity: 1 }}
        whileTap={{ scale: 1.1 }}
        transition={{ duration: 0.8 }}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      />
    </motion.div>
  );
};
const App = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [stateFirst, setStateFirst] = React.useState(true);
  const [stateSecond, setStateSecond] = React.useState(true);
  const [stateThird, setStateThird] = React.useState(true);
  return (
    <>
      <div
        // className=" h-full w-full items-center justify-center  rounded-t-3xl bg-slate-600"
        className="flex h-full w-full flex-row items-center justify-center bg-slate-200 p-5"
        // animate={{
        //   scale: [1, 2, 2, 1, 1],
        // }}
      >
        {/* <motion.div
          className="flex h-full w-full flex-row items-center justify-center bg-slate-200 p-2"
          initial={{ x: "-100%" }}
          transition={{ duration: 1 }}
          animate={{ x: "calc(100vw - 100%)" }}
        > */}
        <First_Card
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          state={stateFirst}
          setState={setStateFirst}
        />
        <Second_Card
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          state={stateSecond}
          setState={setStateSecond}
        />
        <Third_Card
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          state={stateThird}
          setState={setStateThird}
        />
        {/* </motion.div> */}
      </div>

      {isOpen ? <Open_back isOpen={isOpen} setIsOpen={setIsOpen} /> : ""}
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
