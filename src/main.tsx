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

const Rules = ({ className }: { className: string }) => {
  return <div className={`${className}  bg-black`}></div>;
};
const First_Card = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div
      style={{
        backgroundImage: `url(${Verso})`, //change bg if is open or not
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "70%",
        backgroundSize: "40%",
      }}
      className="flex h-full w-full items-center justify-center"
    >
      <Rules className="w-full h-full bg-black" />
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

const App = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <div className="flex h-full w-full flex-row items-center justify-center bg-slate-200 p-2">
        <First_Card isOpen={isOpen} setIsOpen={setIsOpen} />
        <First_Card isOpen={isOpen} setIsOpen={setIsOpen} />
        <First_Card isOpen={isOpen} setIsOpen={setIsOpen} />
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
