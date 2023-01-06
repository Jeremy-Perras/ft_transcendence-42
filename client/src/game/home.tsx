import { useAuthStore } from "../stores";
import { useMediaQuery } from "@react-hookz/web";
import { useEffect, useState } from "react";
import { ReactComponent as CloseBox } from "pixelarticons/svg/close-box.svg";
import {
  AnimationControls,
  motion,
  TargetAndTransition,
  VariantLabels,
} from "framer-motion";
import LogoImage from "../assets/images/logo.svg";
import ArrowImage from "../assets/game_modes/arrow.svg";
import bouncing_ball1 from "../assets/game_modes/bouncing_ball/bouncing_ball01.svg";
import bouncing_ball2 from "../assets/game_modes/bouncing_ball/bouncing_ball02.svg";
import bouncing_ball3 from "../assets/game_modes/bouncing_ball/bouncing_ball03.svg";
import bouncing_ball4 from "../assets/game_modes/bouncing_ball/bouncing_ball04.svg";
import bouncing_ball5 from "../assets/game_modes/bouncing_ball/bouncing_ball05.svg";
import bouncing_ball6 from "../assets/game_modes/bouncing_ball/bouncing_ball06.svg";
import bouncing_ball7 from "../assets/game_modes/bouncing_ball/bouncing_ball07.svg";
import bouncing_ball8 from "../assets/game_modes/bouncing_ball/bouncing_ball08.svg";
import bouncing_ball9 from "../assets/game_modes/bouncing_ball/bouncing_ball09.svg";
import bouncing_ball10 from "../assets/game_modes/bouncing_ball/bouncing_ball10.svg";
import bouncing_ball11 from "../assets/game_modes/bouncing_ball/bouncing_ball11.svg";
import bouncing_ball12 from "../assets/game_modes/bouncing_ball/bouncing_ball12.svg";
import bouncing_ball13 from "../assets/game_modes/bouncing_ball/bouncing_ball13.svg";
import bouncing_ball14 from "../assets/game_modes/bouncing_ball/bouncing_ball14.svg";
import bouncing_ball15 from "../assets/game_modes/bouncing_ball/bouncing_ball15.svg";
import bouncing_ball16 from "../assets/game_modes/bouncing_ball/bouncing_ball16.svg";
import bouncing_ball17 from "../assets/game_modes/bouncing_ball/bouncing_ball17.svg";
import bouncing_ball18 from "../assets/game_modes/bouncing_ball/bouncing_ball18.svg";
import bouncing_ball19 from "../assets/game_modes/bouncing_ball/bouncing_ball19.svg";
import bouncing_ball20 from "../assets/game_modes/bouncing_ball/bouncing_ball20.svg";
import bouncing_ball21 from "../assets/game_modes/bouncing_ball/bouncing_ball21.svg";
import fireball1 from "../assets/game_modes/fireball/fireball01.svg";
import fireball2 from "../assets/game_modes/fireball/fireball02.svg";
import fireball3 from "../assets/game_modes/fireball/fireball03.svg";
import fireball4 from "../assets/game_modes/fireball/fireball04.svg";
import fireball5 from "../assets/game_modes/fireball/fireball05.svg";
import fireball6 from "../assets/game_modes/fireball/fireball06.svg";
import fireball7 from "../assets/game_modes/fireball/fireball07.svg";
import fireball8 from "../assets/game_modes/fireball/fireball08.svg";
import fireball9 from "../assets/game_modes/fireball/fireball09.svg";
import fireball10 from "../assets/game_modes/fireball/fireball10.svg";
import fireball11 from "../assets/game_modes/fireball/fireball11.svg";
import fireball12 from "../assets/game_modes/fireball/fireball12.svg";
import fireball13 from "../assets/game_modes/fireball/fireball13.svg";
import fireball14 from "../assets/game_modes/fireball/fireball14.svg";
import fireball15 from "../assets/game_modes/fireball/fireball15.svg";
import fireball16 from "../assets/game_modes/fireball/fireball16.svg";
import fireball17 from "../assets/game_modes/fireball/fireball17.svg";
import fireball18 from "../assets/game_modes/fireball/fireball18.svg";
import fireball19 from "../assets/game_modes/fireball/fireball19.svg";
import fireball20 from "../assets/game_modes/fireball/fireball20.svg";
import fireball21 from "../assets/game_modes/fireball/fireball21.svg";
import bonus1 from "../assets/game_modes/bonus/bonus1.svg";

type State = "idle" | "selecting" | "waiting";

const Idle = ({ play }: { play: () => void }) => {
  return (
    <span
      onClick={play}
      className="animate-pulse cursor-pointer select-none text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
    >
      Click To Play
    </span>
  );
};

const gameModeIntervalId = [-1, -1, -1];

const bouncing_ball = [
  bouncing_ball1,
  bouncing_ball2,
  bouncing_ball3,
  bouncing_ball4,
  bouncing_ball5,
  bouncing_ball6,
  bouncing_ball7,
  bouncing_ball8,
  bouncing_ball9,
  bouncing_ball10,
  bouncing_ball11,
  bouncing_ball12,
  bouncing_ball13,
  bouncing_ball14,
  bouncing_ball15,
  bouncing_ball16,
  bouncing_ball17,
  bouncing_ball18,
  bouncing_ball19,
  bouncing_ball20,
  bouncing_ball21,
];

const fireball = [
  fireball1,
  fireball2,
  fireball3,
  fireball4,
  fireball5,
  fireball6,
  fireball7,
  fireball8,
  fireball9,
  fireball10,
  fireball11,
  fireball12,
  fireball13,
  fireball14,
  fireball15,
  fireball16,
  fireball17,
  fireball18,
  fireball19,
  fireball20,
  fireball21,
];

const bonus = [bonus1];

const GameMode = ({
  name,
  textEffects,
  selectMode,
  animate,
  array,
}: {
  name: string;
  textEffects: string;
  selectMode: () => void;
  array: string[];
  animate:
    | boolean
    | VariantLabels
    | AnimationControls
    | TargetAndTransition
    | undefined;
}) => {
  const [isEnter, setIsEnter] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [animationIndex, setanimationIndex] = useState(0);
  const i = name === "classic" ? 0 : name === "fireball" ? 1 : 1; //TODO : find another trick to prevent rerendering ?
  useEffect(() => {
    if (gameModeIntervalId[i] == -1) {
      gameModeIntervalId[i] = setInterval(
        () => {
          setanimationIndex((animationIndex) => {
            return animationIndex == bouncing_ball.length - 1
              ? 0
              : animationIndex + 1;
          });
        },
        isSelected ? 40 : 60
      );
      return () => {
        clearInterval(gameModeIntervalId[i]);
        gameModeIntervalId[i] = -1;
      };
    }
  }, [isSelected]);

  const isNarrow = useMediaQuery("(max-width : 640px)");
  const isSmall = useMediaQuery("(max-height : 720px)");
  console.log(gameModeIntervalId);
  return (
    <motion.li
      onClick={selectMode}
      className={`flex  cursor-pointer flex-col items-center ${
        isSmall ? "mb-4 last:mb-0" : null
      }`}
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
      <div className="relative flex w-2/3 justify-center">
        {isSelected && !isSmall && !isNarrow && (
          <motion.img
            className="absolute -top-16 left-1/2"
            src={ArrowImage}
            initial={{ x: "-50%" }}
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
        {!isSmall
          ? array.map((e, i) => (
              <motion.img
                className={`${animationIndex === i ? "" : "hidden"}`}
                src={`${e}`}
                animate={
                  isEnter
                    ? animate
                    : {
                        scale: [0.8, 1, 0.8],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                        },
                      }
                }
                onMouseOver={() => setIsEnter(true)}
                onMouseOut={() => setIsEnter(false)}
              />
            ))
          : null}
      </div>
      <motion.div
        className={`${
          isSmall && !isNarrow ? "px-10" : !isNarrow ? "mt-5" : "mb-5"
        } ${textEffects} text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-4xl`}
      >
        {name}
      </motion.div>
    </motion.li>
  );
};

let waitingScreenIntervalId = -1;
const WaitingScreen = () => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (waitingScreenIntervalId == -1) {
      waitingScreenIntervalId = setInterval(() => {
        setWidth((width) => {
          if (width == 3) return 0;
          else return width + 1;
        });
      }, 1000);
      return () => {
        clearInterval(waitingScreenIntervalId);
        waitingScreenIntervalId = -1;
      };
    }
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div
        className="relative mb-4 inline-block animate-pulse  select-none text-4xl"
        style={{ textShadow: "none" }}
      >
        Waiting For An Opponent
        <span className="absolute">{[...Array(width)].map(() => ".")}</span>
      </div>
    </div>
  );
};

const renderState = (
  state: State,
  setState: React.Dispatch<React.SetStateAction<State>>,
  isNarrow: boolean | undefined
) => {
  const play = () => {
    setState("selecting");
  };
  const selectMode = () => {
    setState("waiting");
  };

  switch (state) {
    case "idle":
      return <Idle play={play} />;
    case "selecting":
      return (
        <ul
          className={`${
            isNarrow ? "w-1/3" : "w-full"
          } flex h-1/3 flex-col justify-center  sm:flex-row sm:items-center`}
        >
          <GameMode
            selectMode={selectMode}
            name={"classic"}
            textEffects={"text-white"}
            animate={false}
            array={bouncing_ball}
          />
          <GameMode
            selectMode={selectMode}
            name={"fireball"}
            textEffects={"text-red-500"}
            animate={false}
            array={fireball}
          />
          <GameMode
            selectMode={selectMode}
            name={"bonus"}
            textEffects={"text-amber-500"}
            animate={{
              rotate: [0, -5, 5, 0],
              transition: {
                duration: 1,
                delay: 0.1,
                repeat: Infinity,
              },
            }}
            array={bonus}
          />
        </ul>
      );
    case "waiting":
      return <WaitingScreen />;
  }
};

export const Home = () => {
  const [state, setState] = useState<State>("idle");
  const isLoggedIn = !!useAuthStore((state) => state.userId);
  const isSmall = useMediaQuery("(max-height : 1000px)");
  const isNarrow = useMediaQuery("(max-width : 640px)");
  return (
    <>
      <img
        src={LogoImage}
        className={`mt-5 w-4/5 sm:max-w-lg lg:max-w-xl 2xl:max-w-2xl ${
          isSmall ? "mx-auto" : "absolute left-1/2 -translate-x-1/2"
        }`}
        alt="Pong game logo"
      />
      {state !== "idle" ? (
        <CloseBox
          onClick={() => {
            setState("idle");
          }}
          className="absolute left-2 top-1 w-8 cursor-pointer text-red-600 sm:w-9"
        />
      ) : null}
      <div className="flex h-full items-center justify-center">
        {isLoggedIn ? (
          renderState(state, setState, isNarrow)
        ) : (
          <a
            href="http://localhost:3000/auth/login"
            className="animate-pulse cursor-pointer select-none text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Click To Login
          </a>
        )}
      </div>
    </>
  );
};
