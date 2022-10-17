import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import React, { useEffect } from "react";

import LogoImage from "../../assets/pictures/title.svg";

let init = false;
let init2 = 0;
let intervalId = -1;

const AngleSide = ({
  weightString,
  side,
  top,
}: {
  weightString: string;
  top: string;
  side: string;
}) => {
  return (
    <div
      className={`${
        weightString == "0"
          ? "hidden"
          : `${top}  ${side} absolute  h-1 w-1 bg-slate-900`
      }`}
    ></div>
  );
};

const OpenBack = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [weight, setWeight] = React.useState(0);
  const [weightString, setWeightString] = React.useState("0");
  React.useEffect(() => {
    if (!init) {
      init = true;
      setInterval(() => {
        setWeight((weight) => {
          if (weight == 1) return 0;
          else return weight + 1 / 4;
        });
      }, 1000);
    }
  }, []);
  useEffect(() => {
    switch (weight) {
      case 0:
        setWeightString("0");
        break;
      case 1 / 4:
        setWeightString("1/4");
        break;
      case 1 / 2:
        setWeightString("1/2");
        break;
      case 3 / 4:
        setWeightString("3/4");
        break;
      case 4 / 4:
        setWeightString("full");
        break;
    }
  }, [weight]);

  return (
    <div className="r-0 absolute  top-1/4 h-1/2 w-full">
      <div className="relative flex h-full w-full  place-content-center items-center bg-slate-900 ">
        <div className="flex h-1/4 w-3/4 flex-col  items-center justify-center  font-cursive text-4xl text-white">
          <div className={`relative h-1/4 w-${weightString}   bg-red-600`}>
            <AngleSide weightString={weightString} top="top-0" side="left-0" />
            <AngleSide weightString={weightString} top="top-0" side="right-0" />
            <AngleSide
              weightString={weightString}
              top="bottom-0"
              side="left-0"
            />
            <AngleSide
              weightString={weightString}
              top="bottom-0"
              side="right-0"
            />
          </div>
          Waiting ...
        </div>
        <div
          className="absolute top-0 right-0 h-10 w-10 select-none bg-red-600 text-center font-cursive text-3xl text-white"
          onClick={() => setIsOpen((isOpen) => !isOpen)}
        >
          <AngleSide weightString="full" top="top-0" side="left-0" />
          <AngleSide weightString="full" top="top-0" side="right-0" />
          <AngleSide weightString="full" top="bottom-0" side="left-0" />
          <AngleSide weightString="full" top="bottom-0" side="right-0" />X
          {(init = false)}
        </div>
      </div>
    </div>
  );
};

const GameMode = ({
  imgs,
  name,
  textEffects,
  isOpen,
  setIsOpen,
}: {
  imgs: string[];
  name: string;
  textEffects: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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
      className="mb-0 flex h-full w-full flex-row"
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 2 }}
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
        <div
          className="relative w-full justify-center p-2"
          onClick={() => setIsOpen((isOpen) => !isOpen)}
        >
          <motion.img
            src={new URL(imgs[animationIndex], import.meta.url).href}
            className="align-self-end m-auto mb-0 w-1/2"
            alt="bonus"
            animate={
              name == "bonus"
                ? {
                    // x: 50 * Math.cos(angle + (2 * Math.PI) / 3),
                    // y: 50 * Math.sin(angle + (2 * Math.PI) / 3),
                    scale: 1 + 0.5 * Math.cos(angle + (2 * Math.PI) / 3),
                  }
                : ""
              // : name == "fireball"
              // ? {
              //     // x: 50 * Math.cos(angle + (4 * Math.PI) / 3),
              //     // y: 50 * Math.sin(angle + (4 * Math.PI) / 3),
              //     scale: 0.8 + 0.5 * Math.cos(angle + (4 * Math.PI) / 3),
              //   }
              // : name == "classic"
              // ? {
              //     // x: 50 * Math.cos(angle),
              //     // y: 50 * Math.sin(angle),
              //     scale: 0.8 + 0.5 * Math.cos(angle),
              //   }
              // : ""
            }
          />
        </div>
        <motion.div
          className={`${textEffects} h-auto w-full text-center font-cursive text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl`}
          // animate={
          //   name == "bonus"
          //     ? {
          //         // x: 50 * Math.cos(angle + (2 * Math.PI) / 3),
          //         // y: 50 * Math.sin(angle + (2 * Math.PI) / 3),
          //         scale: 0.8 + 0.5 * Math.cos(angle + (2 * Math.PI) / 3),
          //       }
          //     : ""
          // : name == "fireball"
          // ? {
          //     // x: 50 * Math.cos(angle + (4 * Math.PI) / 3),
          //     // y: 50 * Math.sin(angle + (4 * Math.PI) / 3),
          //     scale: 0.8 + 0.5 * Math.cos(angle + (4 * Math.PI) / 3),
          //   }
          // : name == "classic"
          // ? {
          //     // x: 50 * Math.cos(angle),
          //     // y: 50 * Math.sin(angle),
          //     scale: 0.8 + 0.5 * Math.cos(angle),
          //   }
          // : ""
          // }
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
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className=" relative  flex h-full w-full flex-col items-center justify-center bg-black">
      <img src={LogoImage} className="absolute top-5  w-full max-w-lg"></img>
      <div className="flex h-1/3 w-10/12 flex-row">
        {gameModes.map((gameMode) => {
          return (
            <GameMode
              key={gameMode.name}
              name={gameMode.name}
              imgs={gameMode.imgs}
              textEffects={gameMode.textEffects}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />
          );
        })}
      </div>
      <Link className="absolute top-0 left-0 text-blue-600" to="/">
        Home
      </Link>
      {isOpen ? <OpenBack isOpen={isOpen} setIsOpen={setIsOpen} /> : ""}
    </div>
  );
}
