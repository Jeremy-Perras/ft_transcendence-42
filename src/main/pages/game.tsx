import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import React from "react";
import { ModuleNamespace } from "vite/types/hot";
import LogoImage from "../../assets/pictures/title.svg";

let intervalId = -1;
const GameMode = ({ imgs, name, textEffects }: GameModeType) => {
  const [animationIndex, setanimationIndex] = React.useState(0);

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

  return (
    <motion.div
      className="mb-0 flex h-1/3 w-full flex-row"
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 3 }}
    >
      <motion.div
        transition={{ duration: 0.2 }}
        initial={{ opacity: 0.9 }}
        whileHover={{ scale: [null, 1.2], opacity: 1 }}
        whileTap={{ scale: 1.1 }}
      >
        <div className="relative m-2 w-full justify-center">
          <img
            src={new URL(imgs[animationIndex], import.meta.url).href}
            className="align-self-end m-auto mb-0 w-1/2"
            alt="bonus"
          />
        </div>
        <div
          className={`${textEffects} m-2 h-auto w-full text-center font-Games text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl`}
        >
          {name}
        </div>
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
    <div className="flex h-full w-full flex-col items-center justify-center bg-black">
      <img
        // src={new URL("/pictures/title.svg", import.meta.url).href}
        src={LogoImage}
        className="absolute top-5  w-full max-w-lg"
      ></img>
      <div className="flex h-1/3 flex-row ">
        {gameModes.map((gameMode) => {
          return <GameMode key={gameMode.name} {...gameMode} />;
        })}
      </div>
      <Link className="absolute top-0 left-0 text-blue-600" to="/">
        Home
      </Link>
    </div>
  );
}
