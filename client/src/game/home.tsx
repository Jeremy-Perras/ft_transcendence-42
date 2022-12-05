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
import { useUpdateStatusMutation } from "../graphql/generated";

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
const GameMode = ({
  imgs,
  name,
  alt,
  textEffects,
  animate,
  selectMode,
}: GameModeType & { selectMode: () => void }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [animationIndex, setanimationIndex] = useState(0);
  const i = name === "classic" ? 0 : name === "fireball" ? 1 : 2; //TODO : find another trick to prevent rerendering ?
  useEffect(() => {
    if (gameModeIntervalId[i] == -1) {
      gameModeIntervalId[i] = setInterval(
        () => {
          setanimationIndex((animationIndex) => {
            return animationIndex == imgs.length - 1 ? 0 : animationIndex + 1;
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

  return (
    <motion.li
      onClick={selectMode}
      className={`flex cursor-pointer flex-col items-center ${
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
      <div className="relative flex justify-center">
        {isSelected && !isSmall && !isNarrow && (
          <motion.img
            className="absolute -top-16 left-1/2"
            src={ArrowImage}
            initial={{ x: "-50%" }}
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
        {!isSmall && (
          <motion.img
            src={new URL(imgs[animationIndex] ?? "", import.meta.url).href}
            className="w-1/4 sm:w-1/2"
            alt={alt}
            animate={animate(isSelected)}
          />
        )}
      </div>
      {/* TODO */}
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
      modules = import.meta.glob("../assets/game_modes/bouncing_ball/*.svg", {
        eager: true,
      });
      break;
    }
    case "fireball": {
      modules = import.meta.glob("../assets/game_modes/fireball/*.svg", {
        eager: true,
      });
      break;
    }
    case "bonus": {
      modules = import.meta.glob("../assets/game_modes/bonus/*.svg", {
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

const ModeSelection = ({ selectMode }: { selectMode: () => void }) => {
  const gameModes: GameModeType[] = [
    {
      imgs: importAnimation("classic"),
      name: "classic",
      alt: "Click to play classic mode",
      textEffects: "text-white",
      animate: () => false,
    },
    {
      imgs: importAnimation("fireball"),
      name: "fireball",
      alt: "Click to play inspeed mode",
      textEffects: "text-red-500",
      animate: () => false,
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
    <ul className="flex h-full w-full flex-col justify-center  sm:flex-row sm:items-center">
      {gameModes.map((gameMode) => {
        return (
          <GameMode key={gameMode.name} {...gameMode} selectMode={selectMode} />
        );
      })}
    </ul>
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
  setState: React.Dispatch<React.SetStateAction<State>>
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
      return <ModeSelection selectMode={selectMode} />;
    case "waiting":
      return <WaitingScreen />;
  }
};

export const Home = () => {
  const [state, setState] = useState<State>("idle");
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isSmall = useMediaQuery("(max-height : 1000px)");
  const updateStatus = useUpdateStatusMutation();
  useEffect(() => {
    if (isLoggedIn) updateStatus.mutate({ status: "ONLINE" });
  }, [isLoggedIn]);
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
      <div className="flex h-full w-4/5 items-center justify-center">
        {isLoggedIn ? (
          renderState(state, setState)
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
