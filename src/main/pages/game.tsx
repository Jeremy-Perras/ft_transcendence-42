import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";

import React from "react";

import LogoImage from "../../assets/pictures/title.svg";
import Arrow from "../../assets/pictures/Arrow.svg";
import Waiting from "./waiting";

let init2 = 0;
let intervalId = -1;

const GameMode = ({
  imgs,
  name,
  textEffects,
}: {
  imgs: string[];
  name: string;
  textEffects: string;
}) => {
  const [onEnter, setOnEnter] = React.useState(false);
  const [animationIndex, setanimationIndex] = React.useState(0);
  const [angle, setAngle] = React.useState(0);
  React.useEffect(() => {
    if (intervalId == -1) {
      intervalId = setInterval(() => {
        setanimationIndex((animationIndex) => {
          return animationIndex == imgs.length - 1 ? 0 : animationIndex + 1;
        });
      }, 50);
      return () => {
        clearInterval(intervalId);
        intervalId = -1;
      };
    }
  }, []);
  React.useEffect(() => {
    if (init2 != 3) {
      init2 = init2 + 1;

      setInterval(() => {
        setAngle((angle) => {
          angle = angle + Math.PI / 180;
          if (angle >= Math.PI * 2) return 0;
          else return angle;
        });
      }, 10);
    }
  }, []);

  return (
    <motion.div
      className="  relative  mb-0 flex h-full w-full flex-row justify-center p-10  "
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 2 }}
      onMouseOver={() => setOnEnter(true)}
      onMouseOut={() => setOnEnter(false)}
    >
      <motion.div
        transition={{
          duration: 0.5,
          type: "ease",
        }}
        initial={{ opacity: 0.8 }}
        whileHover={{
          scale: [null, 1.2, 1.15],
          opacity: 1,
        }}
        whileTap={{ scale: 1.1 }}
      >
        <div className="relative w-full justify-center p-2">
          <Link to="/waiting">
            <div
              className={`${
                onEnter ? "visible" : "invisible"
              } mb-10 hidden h-full w-full justify-center sm:flex`}
            >
              <motion.img
                src={Arrow}
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            </div>
            <motion.img
              src={new URL(imgs[animationIndex], import.meta.url).href}
              className="align-self-end m-auto mb-0 hidden w-1/2 sm:block"
              alt={name}
              animate={
                onEnter && name == "bonus"
                  ? {
                      rotate: [0, -5, 5, 0],
                      transition: {
                        duration: 1,
                        delay: 0.1,
                        repeat: Infinity,
                      },
                    }
                  : name == "bonus"
                  ? {
                      scale: 1 + 0.1 * Math.cos(angle + (2 * Math.PI) / 3),
                      rotate: 0,
                    }
                  : ""
              }
            />
          </Link>
        </div>
        <motion.div
          className={`${textEffects} h-auto w-full text-center font-cursive text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl`}
        >
          {name}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

type GameModeType = {
  imgs: string[];
  name: string;
  textEffects: string;
};

export default function Game() {
  const gameModes: GameModeType[] = [
    {
      imgs: (() => {
        const modules = import.meta.glob(
          "../../assets/pictures/bouncing_ball/*.svg",
          {
            eager: true,
          }
        );
        return Object.keys(modules)
          .sort()
          .map((m) => m);
      })(),
      name: "classic",
      textEffects: "text-white",
    },
    {
      imgs: (() => {
        const modules = import.meta.glob(
          "../../assets/pictures/fireball/*.svg",
          {
            eager: true,
          }
        );
        return Object.keys(modules)
          .sort()
          .map((m) => m);
      })(),

      name: "fireball",
      textEffects: "text-red-500",
    },
    {
      imgs: (() => {
        const modules = import.meta.glob("../../assets/pictures/bonus/*.svg", {
          eager: true,
        });
        return Object.keys(modules)
          .sort()
          .map((m) => m);
      })(),

      name: "bonus",
      textEffects: "text-amber-500",
    },
  ];

  return (
    // eslint-disable-next-line prettier/prettier
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-black">
      <img
        src={LogoImage}
        className="absolute top-5  w-full max-w-sm sm:max-w-lg lg:max-w-xl 2xl:max-w-2xl"
      ></img>
      <div className="flex h-1/3 w-full  flex-col items-center space-x-4 sm:h-1/2 sm:flex-row ">
        {gameModes.map((gameMode) => {
          return (
            <GameMode
              key={gameMode.name}
              name={gameMode.name}
              imgs={gameMode.imgs}
              textEffects={gameMode.textEffects}
            />
          );
        })}
      </div>
      <Link className="absolute top-0 left-0 text-blue-600" to="/">
        Home
      </Link>
    </div>
  );
}
