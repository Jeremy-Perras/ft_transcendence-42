import React from "react";
import ReactDOM from "react-dom/client";

import { motion } from "framer-motion";

import Verso from "./pongClassic.png";
import Recto from "./Recto.png";
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
  return (
    <div
      style={{
        backgroundImage: `url(${Verso})`, //change bg if is open or not
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "70%",
        backgroundSize: "40%",
      }}
      className={` ${
        state ? " " : "bg-black"
      } flex h-full w-full items-center justify-center`}
      onMouseEnter={isEnter}
      onMouseLeave={isEnter}
    >
      {/* <Rules className="" state={state} setState={setState} /> */}
      <motion.div
        className="m-2 h-full w-full rounded "
        initial={{ opacity: 0.6 }}
        whileHover={{ scale: [null, 1.3, 1.2], opacity: 1 }}
        whileTap={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      />
    </div>
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
  return (
    <div
      style={{
        backgroundImage: `url(${Verso})`, //change bg if is open or not
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "70%",
        backgroundSize: "40%",
      }}
      className={` ${
        state ? " " : "bg-black"
      } flex h-full w-full items-center justify-center`}
      onMouseEnter={isEnter}
      onMouseLeave={isEnter}
    >
      {/* <Rules className="" state={state} setState={setState} /> */}
      <motion.div
        className="m-2 h-full w-full rounded "
        initial={{ opacity: 0.6 }}
        whileHover={{ scale: [null, 1.3, 1.2], opacity: 1 }}
        whileTap={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      />
    </div>
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
    <div
      style={{
        backgroundImage: `url(${Verso})`, //change bg if is open or not
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "70%",
        backgroundSize: "40%",
      }}
      className={` ${
        state ? " " : "bg-blue-600"
      } flex h-full w-full items-center justify-center`}
      onMouseEnter={isEnter}
      onMouseLeave={isEnter}
    >
      {/* <Rules className="" state={state} setState={setState} /> */}
      <motion.div
        className="m-2 h-full w-full rounded bg-slate-700"
        initial={{ opacity: 0.6 }}
        whileHover={{ scale: [null, 1.3, 1.2], opacity: 1 }}
        whileTap={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      />
    </div>
  );
};
const App = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [stateFirst, setStateFirst] = React.useState(true);
  const [stateSecond, setStateSecond] = React.useState(true);
  const [stateThird, setStateThird] = React.useState(true);
  return (
    <>
      <div className="flex h-full w-full flex-row items-center justify-center bg-slate-200 p-2">
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
