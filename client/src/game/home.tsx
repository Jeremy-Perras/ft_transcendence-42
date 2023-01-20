import { useAuthStore, useInvitationStore, useSocketStore } from "../stores";
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
import { GameInvitations } from "./components/gameInvitation";
import { GameMode } from "../gql/graphql";
import { ReactComponent as RefuseIcon } from "pixelarticons/svg/close.svg";
import { graphql } from "../gql";
import { useMutation } from "@tanstack/react-query";
import request from "graphql-request";
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

const JoinMatchMackingMutationDocument = graphql(`
  mutation joinMatchmaking($gameMode: GameMode!) {
    joinMatchmaking(gameMode: $gameMode)
  }
`);

const GameInvitationMutationDocument = graphql(`
  mutation gameInvitation($userId: Int!, $gameMode: GameMode!) {
    sendGameInvite(userId: $userId, gameMode: $gameMode)
  }
`);

const CancelInvitationMutationDocument = graphql(`
  mutation cancelGameInvitation {
    cancelGameInvite
  }
`);

const LeaveMatchMackingMutationDocument = graphql(`
  mutation leaveMatchmacking {
    leaveMatchmaking
  }
`);

const Mode = ({
  name,
  textEffects,
  selectMode,
  animate,
  nbOfFrames,
  urlBase,
}: {
  name: string;
  textEffects: string;
  selectMode: () => void;
  nbOfFrames: number;
  urlBase: string;
  animate: (
    isEnter: boolean
  ) => boolean | VariantLabels | AnimationControls | TargetAndTransition;
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [animationIndex, setanimationIndex] = useState(0);
  const i = name === "classic" ? 0 : name === "fireball" ? 1 : 2;
  useEffect(() => {
    if (gameModeIntervalId[i] == -1) {
      gameModeIntervalId[i] = setInterval(
        () => {
          setanimationIndex((animationIndex) => {
            return animationIndex === nbOfFrames - 1 ? 0 : animationIndex + 1;
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
      <div className="relative flex w-2/3 justify-center">
        {isSelected && !isSmall && !isNarrow && (
          <motion.img
            className="absolute -top-16 left-1/2"
            src={"game_modes/arrow.svg"}
            initial={{ x: "-50%" }}
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
        {!isSmall
          ? [...Array(nbOfFrames).keys()].map((e) => (
              <motion.img
                className={`${animationIndex === e ? "" : "hidden"}`}
                src={`game_modes/${urlBase}/frame${e + 1}.svg`}
                animate={animate(isSelected)}
                key={e}
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

  const { invitationName } = useInvitationStore();

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
        {`Waiting For ${invitationName ?? "An Opponent"}`}
        <span className="absolute">{[...Array(width)].map(() => ".")}</span>
      </div>
    </div>
  );
};

const RenderState = ({
  state,
  setState,
  isNarrow,
}: {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  isNarrow: boolean | undefined;
}) => {
  const { invitationState, invitationId, sendInvite } = useInvitationStore();

  const gameInvitation = useMutation(
    async ({
      gameMode,
      inviteeId,
    }: {
      gameMode: GameMode;
      inviteeId: number;
    }) =>
      request("/graphql", GameInvitationMutationDocument, {
        gameMode: gameMode,
        userId: inviteeId,
      })
  );
  const joinMatchMacking = useMutation(
    async ({ gameMode }: { gameMode: GameMode }) =>
      request("/graphql", JoinMatchMackingMutationDocument, {
        gameMode: gameMode,
      })
  );

  const play = () => {
    setState("selecting");
  };
  const selectMode = (gameMode: GameMode) => {
    if (invitationState) {
      if (invitationId) {
        gameInvitation.mutate({ gameMode: gameMode, inviteeId: invitationId });
        sendInvite();
      }
    } else {
      joinMatchMacking.mutate({
        gameMode: gameMode,
      });
    }
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
          <Mode
            selectMode={() => selectMode(GameMode.Classic)}
            name={"classic"}
            textEffects={"text-white"}
            animate={() => false}
            urlBase={"bouncing_ball"}
            nbOfFrames={21}
          />
          <Mode
            selectMode={() => selectMode(GameMode.Speed)}
            name={"fireball"}
            textEffects={"text-red-500"}
            animate={() => false}
            urlBase={"fireball"}
            nbOfFrames={21}
          />
          <Mode
            selectMode={() => selectMode(GameMode.Random)}
            name={"bonus"}
            textEffects={"text-amber-500"}
            animate={(isEnter: boolean) => {
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
            }}
            urlBase={"bonus"}
            nbOfFrames={1}
          />
        </ul>
      );
    case "waiting":
      return <WaitingScreen />;
  }
};

const Error = ({
  message,
  setDisplayInvitationError,
  setState,
}: {
  message: string | undefined;
  setDisplayInvitationError: React.Dispatch<React.SetStateAction<boolean>>;
  setState: React.Dispatch<React.SetStateAction<State>>;
}) => {
  setState("idle");
  return (
    <div className="absolute top-0 z-10  w-1/3 justify-center ">
      <div className=" flex w-full flex-auto flex-row  bg-slate-100 ">
        <span className="flex grow truncate pl-2 pt-1 text-center align-middle font-sans text-black">{`${message}`}</span>
        <div className="flex w-1/3 basis-1/5 justify-end ">
          <RefuseIcon
            className="mx-2 w-5 bg-red-300 hover:cursor-pointer "
            onClick={() => {
              setDisplayInvitationError(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const Home = () => {
  const [state, setState] = useState<State>("idle");
  const isLoggedIn = !!useAuthStore((state) => state.userId);
  const { invitationState, clearInvite } = useInvitationStore();

  const isSmall = useMediaQuery("(max-height : 1000px)");
  const isNarrow = useMediaQuery("(max-width : 640px)");
  const [displayInvitationError, setDisplayInvitationError] = useState(false);
  const socket = useSocketStore().socket;
  const [message, setMessage] = useState<string>();

  const cancelInvitation = useMutation(async () =>
    request("/graphql", CancelInvitationMutationDocument)
  );

  const leaveMatchMacking = useMutation(async () =>
    request("/graphql", LeaveMatchMackingMutationDocument)
  );

  socket.on("error", (message) => {
    const info = message;
    setMessage(info);
    setDisplayInvitationError(true);
  });
  useEffect(() => {
    const cb = () => {
      clearInvite();
      setState("idle");
    };
    switch (invitationState) {
      case "selecting":
        setState("selecting");
        break;
      case "waiting":
        setState("waiting");
        break;
    }

    if (invitationState) {
      socket.on("cancelInvitation", cb);
    }
    return () => {
      socket.off("cancelInvitation", cb);
    };
  }, [invitationState]);

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
            if (invitationState) {
              if (invitationState === "waiting") {
                cancelInvitation.mutate();
              }
              clearInvite();
            } else if (state === "waiting") {
              leaveMatchMacking.mutate();
            }
            setState("idle");
          }}
          className="crt turn absolute left-2 top-1 w-8 cursor-pointer text-red-600 sm:w-9"
        />
      ) : null}
      <div className="crt turn flex h-full items-center justify-center">
        {isLoggedIn ? (
          <RenderState state={state} setState={setState} isNarrow={isNarrow} />
        ) : (
          <a
            href={`${window.location.protocol}//${window.location.host}/auth/login`}
            className="animate-pulse cursor-pointer select-none text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Click To Login
          </a>
        )}
      </div>
      {/* {displayInvitationError ? (
        <Error
          message={message}
          setDisplayInvitationError={setDisplayInvitationError}
          setState={setState}
        />
      ) : null} */}
      <GameInvitations />
    </>
  );
};
