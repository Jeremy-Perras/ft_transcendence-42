import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Ball from "../../assets/Pictures/Ball.gif";
import Fire from "../../assets/Pictures/Fire.gif";
import Gift from "../../assets/Pictures/Gift.png";
import Title from "../../assets/Pictures/Vector5.svg";
import Test from "../../assets/Pictures/Test.png";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import * as Dialog from "@radix-ui/react-dialog";
import React from "react";

const loadingCircleTransition = {
  duration: 0.5,
  // yoyo: Infinity,
  // ease: "easeInOut",
};

const Open_back = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [number, setNumber] = React.useState(0);
  React.useEffect(() => {
    setTimeout(() => {
      setNumber((number) => number + 1);
      number >= 3 ? setNumber(0) : number;
    }, 1000);
  });
  return (
    <div className="r-0 absolute top-1/4 h-1/2 w-full ">
      {/* <AspectRatio.Root ratio={2 / 1.5}> */}
      <div
        className="flex h-full w-full flex-row  place-content-center items-center bg-black opacity-75"
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      >
        <div
          className={`${
            number >= 1 ? "m-2 h-12 w-12 rounded-full bg-red-400" : "hidden"
          }`}
        ></div>
        <div
          className={`${
            number >= 2 ? "m-2 h-12 w-12 rounded-full bg-red-400" : "hidden"
          }`}
        ></div>
        <div
          className={`${
            number >= 3 ? "m-2 h-12 w-12 rounded-full bg-red-400" : "hidden"
          }`}
        ></div>
      </div>
      {/* </AspectRatio.Root> */}
    </div>
  );
};
const First_Card = () => {
  return (
    <motion.div
      className="flex h-full w-full flex-col  justify-center"
      initial={{ x: "-100%" }}
      transition={{ duration: 2 }}
      animate={{ x: "calc(0vw )" }}
    >
      <div
        className=" relative m-2 h-full w-full justify-center "
        style={{
          backgroundImage: `url(${Ball})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom",
        }}
      ></div>

      <div className=" m-2 h-full w-full text-center font-Games text-4xl text-red-700">
        Original
      </div>
    </motion.div>
  );
};

const Second_Card = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [onEnter, setOnEnter] = React.useState(false);

  const isEnter = () => {
    setOnEnter(!onEnter);
  };
  return (
    <motion.div
      className="flex h-full w-full flex-col  justify-center"
      initial={{ x: "-200%" }}
      transition={{ duration: 2 }}
      animate={{ x: "calc(0vw )" }}
      onMouseEnter={isEnter}
      onMouseLeave={isEnter}
      onClick={() => setIsOpen((isOpen) => !isOpen)}
    >
      <div
        style={{
          backgroundImage: onEnter ? `url(${Fire})` : `url(${Test})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom",
        }}
        className=" relative m-2  h-full w-full justify-center   "
      ></div>
      <div className=" m-2 h-full w-full text-center font-Games text-4xl text-red-700">
        FireBall
      </div>
    </motion.div>
  );
};

const Third_Card = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <motion.div
      initial={{ x: "-300%" }}
      transition={{ duration: 2 }}
      animate={{ x: "calc(0vw )" }}
      className="flex h-full w-full flex-col  justify-center"
    >
      <div
        style={{
          backgroundImage: `url(${Gift})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom",
        }}
        className="m-2 h-full w-full "
      ></div>
      <div className=" m-2 h-full w-full text-center font-Games text-4xl text-red-700">
        Gift
      </div>
    </motion.div>
  );
};

export default function Game() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <div className="flex h-full w-full flex-row items-center justify-center bg-slate-900">
        <h1
          className=" absolute h-full w-full "
          style={{
            backgroundImage: `url(${Title})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top",
          }}
        ></h1>
        <First_Card />
        <Second_Card isOpen={isOpen} setIsOpen={setIsOpen} />
        <Third_Card isOpen={isOpen} setIsOpen={setIsOpen} />
        <Link className="absolute top-0 left-0 text-blue-600" to="/">
          home
        </Link>
      </div>
      {isOpen ? <Open_back isOpen={isOpen} setIsOpen={setIsOpen} /> : ""}
    </>
  );
}
