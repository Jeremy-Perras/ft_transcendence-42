import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Ball from "../../assets/Pictures/Ball.gif";
import Fire from "../../assets/Pictures/Fire.gif";
import Gift from "../../assets/Pictures/Gift.png";
import Title from "../../assets/Pictures/Frame_1.svg";
import * as Dialog from "@radix-ui/react-dialog";

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

const Second_Card = () => {
  return (
    <motion.div
      className="flex h-full w-full flex-col  justify-center"
      initial={{ x: "-200%" }}
      transition={{ duration: 2 }}
      animate={{ x: "calc(0vw )" }}
    >
      <div
        style={{
          backgroundImage: `url(${Fire})`,
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

const Third_Card = () => {
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
        <Second_Card />
        <Third_Card />
        <Link className="absolute top-0 left-0 text-blue-600" to="/">
          home
        </Link>
      </div>
    </>
  );
}
