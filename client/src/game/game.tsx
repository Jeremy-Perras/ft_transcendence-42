import { QueryClient, UseQueryOptions, useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { useRef, useEffect, useState } from "react";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Socket } from "socket.io-client";

import { graphql } from "../gql/gql";
import { GameMode, GameQuery } from "../gql/graphql";
import { useAuthStore, useSocketStore } from "../stores";
import {
  LEFT_PAD_X,
  CANVAS_HEIGHT,
  PAD_HEIGHT,
  RIGHT_PAD_X,
  CANVAS_WIDTH,
  BALL_RADIUS,
  BALL_VELOCITY,
  draw,
  handleKeyDown,
  handleKeyUp,
} from "./functions/game";
import { GameData, padMove } from "./types/gameData";

//TODO : animate ball - check coordinates etc
//TODO : bonus mode

const wrap = document.getElementById("wrap");
const canvas = document.getElementById("canvas");

// function plotImage(ctx, width, height) {
//   ctx.fillStyle = "red";
//   ctx.fillRect(0, 0, width, height);

//   ctx.fillStyle = "white";
//   let min = 0;
//   if (wrap.clientHeight > wrap.clientWidth) {
//     min = wrap.clientWidth / 2;
//   } else {
//     min = wrap.clientHeight / 2;
//   }
//   const offsetx = wrap.clientWidth / 2 - min / 2;
//   const offsety = wrap.clientHeight / 2 - min / 2;
//   ctx.fillRect(offsetx, offsety, min, min);
// }

// function redraw() {
//   const dpr = window.devicePixelRatio;
//   const cssWidth = canvas.clientWidth;
//   const cssHeight = canvas.clientHeight;
//   const pxWidth = Math.round(dpr * cssWidth);
//   const pxHeight = Math.round(dpr * cssHeight);

//   canvas.width = pxWidth;
//   canvas.height = pxHeight;

//   const ctx = canvas.getContext("2d");
//   ctx.scale(dpr, dpr);
//   plotImage(ctx, cssWidth, cssHeight);
// }

// new ResizeObserver(() => redraw()).observe(canvas);

enum gameScreenState {
  INTRO,
  PLAYING,
  SCORE,
}

const INTRO_DURATION = 1; //INITIAL COUNTDOWN
// modify canvas size with clientValue

const GameQueryDocument = graphql(`
  query Game($gameId: Int!) {
    game(id: $gameId) {
      gameMode
      startAt
      finishedAt
      score {
        player1Score
        player2Score
      }
      id
      players {
        player1 {
          id
          name
          rank
        }
        player2 {
          id
          name
          rank
        }
      }
    }
  }
`);

const query = (
  gameId: number
): UseQueryOptions<GameQuery, unknown, GameQuery> => {
  return {
    queryKey: ["Game", gameId],
    queryFn: async () =>
      request("/graphql", GameQueryDocument, {
        gameId: gameId,
      }),
  };
};

export const gameLoader = async (
  queryClient: QueryClient,
  { params }: LoaderFunctionArgs
) => {
  if (params.gameId) {
    const gameId = +params.gameId;
    return queryClient.fetchQuery(query(gameId));
  }
};

let eventSetup = false;

const GameCanvas = ({
  startTime,
  setGameState,
  initData,
}: {
  startTime: number;
  setGameState: React.Dispatch<React.SetStateAction<gameScreenState>>;
  initData: GameQuery;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  if (!canvas) return <>Error</>;
  const requestRef = useRef<number>();
  const playerMove = useRef(padMove.STILL);
  const keyboardStatus = useRef({
    arrowUp: false,
    arrowDown: false,
  });

  const currentUserId = useAuthStore((state) => state.userId);
  const socket = useSocketStore().socket;

  const frontGameData = useRef<GameData>({
    player1: {
      coord: { x: LEFT_PAD_X, y: (CANVAS_HEIGHT - PAD_HEIGHT) / 2 },
      playerMove: padMove.STILL,
    },
    player2: {
      coord: { x: RIGHT_PAD_X, y: (CANVAS_HEIGHT - PAD_HEIGHT) / 2 },
      playerMove: padMove.STILL,
    },
    ball: {
      coord: {
        x: (CANVAS_WIDTH + 2 * BALL_RADIUS) / 2,
        y: (CANVAS_HEIGHT + 2 * BALL_RADIUS) / 2,
      },
      velocity: { vx: BALL_VELOCITY, vy: 0 },
    },
    game:
      initData.game.gameMode === GameMode.Classic
        ? {
            id: initData.game.id,
            score: { player1: 0, player2: 0 },
            players: {
              player1: initData.game.players.player1.id,
              player2: initData.game.players.player2.id,
            },
            type: "CLASSIC",
          }
        : initData.game.gameMode === GameMode.Speed
        ? {
            id: initData.game.id,
            score: { player1: 0, player2: 0 },
            players: {
              player1: initData.game.players.player1.id,
              player2: initData.game.players.player2.id,
            },
            type: "BOOST",
            player1Boost: { activated: false, remaining: 100 }, // percent
            player2Boost: { activated: false, remaining: 100 },
          }
        : {
            id: initData.game.id,
            score: { player1: 0, player2: 0 },
            players: {
              player1: initData.game.players.player1.id,
              player2: initData.game.players.player2.id,
            },
            type: "GIFT",
            player1Gifts: { size: 1, speed: 1 }, // ratio
            player2Gifts: { size: 1, speed: 1 },
          },
  });

  useEffect(() => {
    const handleKey = (
      e: KeyboardEvent,
      cb: (
        keycode: string,
        playerY: number,
        socket: Socket,
        gameId: number,
        gameMode: GameMode,
        keyboardStatus: React.MutableRefObject<{
          arrowUp: boolean;
          arrowDown: boolean;
        }>,
        playerMove: React.MutableRefObject<padMove>
      ) => void
    ) => {
      cb(
        e.code,
        //TODO : restart from here
        currentUserId === initData.game.players.player1.id
          ? frontGameData.current.player1.coord.y
          : currentUserId === initData.game.players.player2.id
          ? frontGameData.current.player2.coord.y
          : 0,
        socket,
        initData.game.id,
        initData.game.gameMode,
        keyboardStatus,
        playerMove
      );
    };
    const keyDownCb = (e: KeyboardEvent) => handleKey(e, handleKeyDown);
    const keyUpCb = (e: KeyboardEvent) => handleKey(e, handleKeyUp);

    if (currentUserId && !eventSetup) {
      eventSetup = true;
      const isPlayer =
        currentUserId === initData.game.players.player1.id ||
        currentUserId === initData.game.players.player2.id
          ? true
          : false;
      if (isPlayer) {
        window.addEventListener("keydown", keyDownCb);
        window.addEventListener("keyup", keyUpCb);
      } else {
        socket.emit("joinRoomAsViewer", initData.game.id);
      }
      socket.emit("gameReady", initData.game.id);
    }

    return () => {
      eventSetup = false;
      window.removeEventListener("keydown", keyDownCb);
      window.removeEventListener("keydown", keyUpCb);
    };
  }, [initData, currentUserId]);

  /////////// EVENT MANAGER
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerMove.current === padMove.DOWN)
        console.log(new Date().getTime(), "down");
      // else if (playerMove.current === padMove.STILL)
      //   console.log(new Date().getTime(), "none");
      else if (playerMove.current === padMove.UP)
        console.log(new Date().getTime(), "up");
    }, 10);

    return () => clearInterval(interval);
  }, [playerMove]);

  useEffect(() => {
    let gameData: GameData;
    if (canvas.current) {
      // canvas.current.width = canvas.current.clientWidth;
      // canvas.current.height = canvas.current.clientHeight;
      canvas.current.width = 500;
      canvas.current.height = 500;
    }
    const cb = (data: GameData) => {
      if (data.game.score.player1 >= 11 || data.game.score.player2 >= 11) {
        socket.emit("endGame", initData.game.id);
        setGameState(gameScreenState.SCORE);
      }

      let ctx;

      if (canvas.current) ctx = canvas.current.getContext("2d");
      if (
        frontGameData.current.player1.coord.y !== data.player1.coord.y &&
        ctx
      ) {
        if (frontGameData.current.player1.coord.y <= data.player1.coord.y)
          frontGameData.current.player1.coord.y++;
        else frontGameData.current.player1.coord.y--;
        draw(ctx, frontGameData.current);
      }
      if (
        frontGameData.current.player2.coord.y !== data.player2.coord.y &&
        ctx
      ) {
        if (frontGameData.current.player2.coord.y <= data.player2.coord.y)
          frontGameData.current.player2.coord.y++;
        else frontGameData.current.player2.coord.y--;
        draw(ctx, frontGameData.current);
      }
      if (frontGameData.current.ball.coord.x < data.ball.coord.x)
        frontGameData.current.ball.coord.x +=
          frontGameData.current.ball.velocity.vx / BALL_VELOCITY;
      if (frontGameData.current.ball.coord.x > data.ball.coord.x)
        frontGameData.current.ball.coord.x -=
          frontGameData.current.ball.velocity.vx / BALL_VELOCITY;
      if (frontGameData.current.ball.coord.y < data.ball.coord.y)
        frontGameData.current.ball.coord.y +=
          frontGameData.current.ball.velocity.vy / BALL_VELOCITY;
      if (frontGameData.current.ball.coord.y < data.ball.coord.y)
        frontGameData.current.ball.coord.y -=
          frontGameData.current.ball.velocity.vy / BALL_VELOCITY;
      frontGameData.current = data;

      gameData = data;
    };
    const animate = () => {
      let ctx;
      if (canvas.current) ctx = canvas.current.getContext("2d");
      if (ctx && gameData) {
        if (frontGameData.current) {
          if (
            gameData.player1.playerMove === padMove.DOWN &&
            frontGameData.current.player1.coord.y < CANVAS_HEIGHT - PAD_HEIGHT
          ) {
            frontGameData.current.player1.coord.y++;
          } else if (
            gameData.player1.playerMove === padMove.UP &&
            frontGameData.current.player1.coord.y > 0
          ) {
            frontGameData.current.player1.coord.y--;
          }
          if (
            gameData.player2.playerMove === padMove.DOWN &&
            frontGameData.current.player2.coord.y < CANVAS_HEIGHT - PAD_HEIGHT
          ) {
            frontGameData.current.player2.coord.y++;
          } else if (
            gameData.player2.playerMove === padMove.UP &&
            frontGameData.current.player2.coord.y > 0
          ) {
            frontGameData.current.player2.coord.y--;
          }
          frontGameData.current.ball.coord.x +=
            frontGameData.current.ball.velocity.vx / BALL_VELOCITY;
          frontGameData.current.ball.coord.y +=
            frontGameData.current.ball.velocity.vy / BALL_VELOCITY;
          draw(ctx, frontGameData.current);
        }
      }
    };
    socket.off("updateCanvas");
    socket.on("updateCanvas", cb);
    requestRef.current = setInterval(animate, 25);
    return () => {
      socket.off("updateCanvas", cb);
      clearInterval(requestRef.current);
    };
  }, []);

  //TODO : pause game ? check subject
  return (
    <div>
      <canvas
        tabIndex={0}
        className="border-4 border-white"
        ref={canvas}
        id={"game"}
      />
      <div className="my-2 flex w-full items-center justify-center">
        <div className="shrink-0 basis-2/5 truncate">
          {initData.game.players.player1.name}
        </div>
        <div className="mx-4 shrink-0 basis-1/5 text-center">VS</div>
        <div className="shrink-0 basis-2/5">
          {initData.game.players.player2.name}
        </div>

        {/* TODO : add here banner with player avatar, rank, name */}
      </div>
      <GameTimer startTime={startTime} />
      {/* {!isPlayer && <span className="my-2 text-lg">Live Stream</span>} */}
    </div>
  );
};

const GameTimer = ({ startTime }: { startTime: number }) => {
  const [timer, setTimer] = useState(startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(Math.floor((new Date().getTime() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="my-2 flex w-20 justify-center">
      <span>{Math.floor(timer / 60)} </span>
      <span className="mx-1 pb-1 font-mono text-lg">:</span>
      <span>{timer % 60 < 10 ? `0${timer % 60}` : `${timer % 60}`}</span>
    </div>
  );
};

const Score = ({ gameId }: { gameId: number }) => {
  const navigate = useNavigate();
  const initialData = useLoaderData() as Awaited<ReturnType<typeof gameLoader>>;
  const { data } = useQuery({ ...query(gameId), initialData });
  if (typeof data === "undefined") return <div>Error</div>;

  return (
    <>
      <div className="mt-1 flex h-12 w-128 items-center pl-1">
        <div className="relative flex w-full">
          <img
            className=" h-10 w-10 border border-black object-cover  "
            src={`http://localhost:5173/upload/avatar/${data.game.players.player1.id}`}
            alt="Player 1 avatar"
          />

          <div className="ml-2 w-32 self-center truncate text-left ">
            {data.game.players.player1.name}
          </div>
          <div className="grow select-none self-center text-center text-lg font-bold ">
            VS
          </div>
          <div className="ml-2 w-32 self-center truncate text-left ">
            {data.game.players.player2?.name}
          </div>
          <div className="relative">
            <img
              className="h-10 w-10 justify-end border border-black object-cover "
              src={`http://localhost:5173/upload/avatar/${data.game.players.player2.id}`}
              alt="Player 2 avatar"
            />
          </div>
        </div>
      </div>
      <div>{`${data.game.score.player1Score} - ${data.game.score.player2Score}`}</div>
      <button
        className="my-6 border-2 border-slate-300 bg-slate-100 p-4 text-slate-500 hover:bg-slate-300 hover:text-slate-600"
        onClick={() => navigate(`/`)}
      >
        Home
      </button>
    </>
  );
};

const Intro = ({
  data,
  startTime,
  setGameState,
}: {
  data: GameQuery;
  startTime: number;
  setGameState: React.Dispatch<React.SetStateAction<gameScreenState>>;
}) => {
  const currentUserId = useAuthStore((state) => state.userId);
  const socket = useSocketStore().socket;

  const [timer, setTimer] = useState(
    Math.floor(
      Math.floor(startTime + INTRO_DURATION * 1000 - new Date().getTime()) /
        1000
    )
  );

  const isPlayer =
    currentUserId === data.game.players.player1.id ||
    currentUserId === data.game.players.player2.id
      ? true
      : false;

  useEffect(() => {
    if (!isPlayer) socket.emit("joinRoomAsViewer", data.game.id);
  }, []);

  useEffect(() => {
    if (timer < 0) {
      setGameState(gameScreenState.PLAYING);
    }
    const interval = setInterval(() => {
      setTimer(
        Math.floor(
          (startTime + INTRO_DURATION * 1000 - new Date().getTime()) / 1000
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <>
      <div className="mt-10 flex items-center">
        <div className="relative flex w-full">
          <div className="mx-4">
            <img
              className=" h-60 w-60 border border-black object-cover  "
              src={`http://localhost:5173/upload/avatar/${data.game.players.player1.id}`}
              alt="Player 1 avatar"
            />
            <div className="w-60 self-center truncate text-center">
              {data.game.players.player1.name}
            </div>
          </div>
          <div className="grow animate-pulse select-none self-center text-center text-3xl font-bold ">
            VS
          </div>
          <div className="mx-4">
            <div className="relative">
              <img
                className="h-60 w-60 justify-end border border-black object-cover "
                src={`http://localhost:5173/upload/avatar/${data.game.players.player2.id}`}
                alt="Player 2 avatar"
              />
            </div>
            <div className="ml-2 w-60 self-center truncate text-center ">
              {data.game.players.player2?.name}
            </div>
          </div>
        </div>
      </div>
      <div className="my-10 flex w-20 justify-center text-5xl">
        <span>{Math.floor(timer / 60)} </span>
        <span className="mx-1 pb-1 font-mono">:</span>
        <span>{timer % 60 < 10 ? `0${timer % 60}` : `${timer % 60}`}</span>
      </div>
      {data.game.gameMode === GameMode.Speed && (
        <div className="my-10 flex w-full justify-center text-xl">
          Press SPACE to fire the ball!
        </div>
      )}
    </>
  );
};

export const Game = () => {
  const params = useParams();
  if (typeof params.gameId === "undefined") return <div>Error</div>;
  const gameId = +params.gameId;
  const initialData = useLoaderData() as Awaited<ReturnType<typeof gameLoader>>;
  const { data } = useQuery({ ...query(gameId), initialData });
  if (typeof data === "undefined") return <div>Error</div>;

  // const [gameState, setGameState] = useState<gameScreenState>(
  //   data.game.finishedAt ? gameScreenState.SCORE : gameScreenState.PLAYING
  // );
  // TODO : go to score if game is already finished

  const startTime = new Date(data.game.startAt).getTime();
  const currentTime = new Date().getTime();

  const [gameState, setGameState] = useState<gameScreenState>(
    currentTime > startTime + INTRO_DURATION * 1000
      ? gameScreenState.PLAYING
      : gameScreenState.INTRO
  );

  switch (gameState) {
    case gameScreenState.INTRO:
      return (
        <Intro startTime={startTime} setGameState={setGameState} data={data} />
      );
    case gameScreenState.SCORE:
      return <Score gameId={gameId} />;
    case gameScreenState.PLAYING:
      return (
        <div id="game">
          <GameCanvas
            initData={data}
            startTime={startTime + INTRO_DURATION * 1000}
            setGameState={setGameState}
          />
        </div>
      );

    default:
      return <div>Error</div>;
  }
};

// const Counter = (context: CanvasRenderingContext2D, gameData: GameData) => {
//   const [count, setCount] = useState(0);

//   const requestRef = useRef<number>();
//   const previousTimeRef = useRef<number>();

//   const animate = (time: number) => {
//     if (previousTimeRef.current != undefined) {
//       const deltaTime = time - previousTimeRef.current;

//       setCount((prevCount) => (prevCount + deltaTime * 0.01) % 100);
//     }
//     previousTimeRef.current = time;
//     requestRef.current = requestAnimationFrame(animate);
//   };

//   useEffect(() => {
//     requestRef.current = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(requestRef.current!);
//   }, []);
//   return <div>{Math.round(count)}</div>;
// };
