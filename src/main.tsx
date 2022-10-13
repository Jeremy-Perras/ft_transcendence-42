import React from "react";
import ReactDOM from "react-dom/client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { useAnimationFrame } from "framer-motion";
import Verso from "./pongClassic.png";
import Recto from "./pixil-frame-2.png";
import Ball from "./New_Piskel7.gif";
import Gift from "./New_Piskel6.png";
import Fire from "./New_Piskel1.png";
import Fire2 from "./New_Piskel2.gif";
import title from "./New_Piskel2.gif";
import "./index.css";

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
    <motion.div
      initial={{ x: "-200%" }}
      transition={{ duration: 2 }}
      animate={{ x: "calc(0vw )" }}
      style={{
        backgroundImage: `url(${Fire2})`, //change bg if is open or not
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      className=" relative m-2 flex h-full w-full items-center justify-center   "
      onMouseEnter={isEnter}
      onMouseLeave={isEnter}
    >
      <motion.div
        className={` ${
          state ? " " : "   bg-blue-600"
        } absolute inset-x-0 bottom-0  h-1/2 w-full rounded-xl `}
        initial={{ opacity: 0.3 }}
        // whileHover={{ scale: [null, 1.1, 1.1], opacity: 0.6 }}
        // whileTap={{ scale: 1.1 }}
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

  return (
    <motion.div
      initial={{ x: "-200%" }}
      transition={{ duration: 2 }}
      animate={{ x: "calc(0vw )" }}
      style={{
        backgroundImage: `url(${Ball})`, //change bg if is open or not
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      className=" relative m-2 flex h-full w-full items-center justify-center   "
      onMouseEnter={isEnter}
      onMouseLeave={isEnter}
    >
      <motion.div
        className={` ${
          state ? " " : "   bg-blue-600"
        } rounded-xl absolute inset-x-0  bottom-0 h-1/2 w-full `}
        initial={{ opacity: 0.3 }}
        // whileHover={{ scale: [null, 1.1, 1.1], opacity: 0.6 }}
        // whileTap={{ scale: 1.1 }}
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
      initial={{ x: "-200%" }}
      transition={{ duration: 2 }}
      animate={{ x: "calc(0vw )" }}
      style={{
        backgroundImage: `url(${Gift})`, //change bg if is open or not
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      className=" relative m-2   flex h-full  w-full justify-center   text-blue-600   "
      onMouseEnter={isEnter}
      onMouseLeave={isEnter}
    >
      Speed
      <motion.div
        className={` ${
          state ? " " : "   bg-blue-600"
        } absolute bottom-1/3 h-1/6 w-full  rounded-xl align-baseline`}
        initial={{ opacity: 0.3 }}
        // whileHover={{ scale: [null, 1.1, 1.1], opacity: 0.6 }}
        // whileTap={{ scale: 1.1 }}
        transition={{ duration: 0.8 }}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      >
        <h1 className="absolute h-full w-full text-center">Speed</h1>
      </motion.div>
    </motion.div>
  );
};
const App = () => {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [stateFirst, setStateFirst] = React.useState(true);
  const [stateSecond, setStateSecond] = React.useState(true);
  const [stateThird, setStateThird] = React.useState(true);
  // useAnimationFrame((t) => {
  //   const rotate = Math.sin(t / 10000) * 200;
  //   const y = (1 + Math.sin(t / 1000)) * -50;
  //   ref.current.style.transform = `translateY(${y}px) rotateX(${rotate}deg) rotateY(${rotate}deg)`;
  // });
  return (
    <>
      <h1 className="font-adelia bg-slate-900 text-center text-2xl  text-blue-600">
        {" "}
        Bonjours
      </h1>
      <div
        // className=" h-full w-full items-center justify-center  rounded-t-3xl bg-slate-600"
        className=" flex h-full w-full flex-row items-center justify-center bg-slate-900 from-neutral-900 p-5  font-bold"
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
