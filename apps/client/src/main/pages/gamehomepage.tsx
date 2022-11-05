import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  AnimationControls,
  motion,
  TargetAndTransition,
  VariantLabels,
} from "framer-motion";
import { useMediaQuery } from "@react-hookz/web";
import { useEffect, useState } from "react";

import ArrowImage from "../../assets/game_modes/arrow.svg";
import { useWaitingRoomGameQuery } from "../../graphql/generated";
import { getInfoUserId, UpdateGameJoiningPlayer } from "../queries";
//TODO handle this function
// const GameHandler = ({ gamemode }: { gamemode: number }) => {
//   const { isLoading, data, error, isFetching } = useWaitingRoomGameQuery({
//     started: false,
//     gamesId: gamemode,
//   });
//   // console.log(data);
//   const Iduser = getInfoUserId();
//   const navigate = useNavigate();
//   const getId = data?.games.map((game) => game.id);
//   console.log(getId);
//   if (getId?.length) {
//     if (getId[0]) UpdateGameJoiningPlayer(getId[0]);
//     navigate(`/game/${getId[0]}`);
//   }
//   return <></>;
// };

let intervalId = -1;
const GameMode = ({ imgs, name, alt, textEffects, animate }: GameModeType) => {
  const [isSelected, setIsSelected] = useState(false);
  const [animationIndex, setanimationIndex] = useState(0);

  useEffect(() => {
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

  const isNarrow = useMediaQuery("(max-width : 640px)");
  const isSmall = useMediaQuery("(max-height : 720px)");

  return (
    <Link to="/waiting">
      <GameHandler gamemode={1} />
      <motion.div
        className="flex flex-col items-center"
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{
          scale: 1,
          opacity: 0.8,
          transition: { duration: 0.8 },
        }}
        whileHover={{
          scale: [null, 1.2, 1.15],
          opacity: 1,
          transition: { duration: 0.5 },
        }}
        whileTap={{ scale: 1.1 }}
        onMouseOver={() => setIsSelected(true)}
        onMouseOut={() => setIsSelected(false)}
      >
        <div className="relative flex justify-center">
          {isSelected && !isSmall && !isNarrow && (
            <motion.img
              className="absolute -top-5 left-1/2"
              src={ArrowImage}
              initial={{ x: "-50%" }}
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
          {!isSmall && (
            <motion.img
              src={new URL(imgs[animationIndex], import.meta.url).href}
              className="w-1/4 sm:w-1/2"
              alt={alt}
              animate={animate(isSelected)}
            />
          )}
        </div>
        {/* TODO */}
        <motion.div
          className={`${
            isSmall && !isNarrow ? "pl-10 pr-10" : ""
          } ${textEffects} font-cursive text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl`}
        >
          {name}
        </motion.div>
      </motion.div>
    </Link>
  );
};

type GameModeType = {
  imgs: string[];
  name: string;
  alt: string;
  textEffects: string;
  animate: (
    isEnter: boolean
  ) => boolean | VariantLabels | AnimationControls | TargetAndTransition;
};

function importAnimation(mode: string) {
  let modules: Record<string, unknown>;
  switch (mode) {
    case "classic": {
      modules = import.meta.glob(
        "../../assets/game_modes/bouncing_ball/*.svg",
        {
          eager: true,
        }
      );
      break;
    }
    case "fireball": {
      modules = import.meta.glob("../../assets/game_modes/fireball/*.svg", {
        eager: true,
      });
      break;
    }
    case "bonus": {
      modules = import.meta.glob("../../assets/game_modes/bonus/*.svg", {
        eager: true,
      });
      break;
    }
    default: {
      return ["", ""];
      break;
    }
  }
  return (() =>
    Object.keys(modules)
      .sort()
      .map((m) => m))();
}

export default function GameHomePage() {
  const gameModes: GameModeType[] = [
    {
      imgs: importAnimation("classic"),
      name: "classic",
      alt: "Click to play classic mode",
      textEffects: "text-white",
      animate: (isEnter) => false,
    },
    {
      imgs: importAnimation("fireball"),
      name: "fireball",
      alt: "Click to play inspeed mode",
      textEffects: "text-red-500",
      animate: (isEnter) => false,
    },
    {
      name: "bonus",
      imgs: importAnimation("bonus"),
      alt: "Click to play bonus mode",
      textEffects: "text-amber-500",
      animate: (isEnter: boolean) => {
        return isEnter
          ? {
              rotate: [0, -5, 5, 0],
              transition: {
                duration: 1,
                delay: 0.1,
                repeat: Infinity,
              },
            }
          : {
              scale: [0.8, 1, 0.8],
              transition: {
                duration: 2,
                repeat: Infinity,
              },
            };
      },
    },
  ];

  return (
    <div className="flex h-full w-full flex-col justify-center bg-black sm:flex-row sm:items-center">
      {gameModes.map((gameMode) => {
        return <GameMode key={gameMode.name} {...gameMode} />;
      })}
    </div>
  );
}
