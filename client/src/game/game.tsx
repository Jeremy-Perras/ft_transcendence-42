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
import queryClient from "../query";
import { useAuthStore, useSocketStore } from "../stores";
import {
  LEFT_PAD_X,
  CANVAS_HEIGHT,
  PAD_HEIGHT,
  RIGHT_PAD_X,
  CANVAS_WIDTH,
  BALL_VELOCITY,
  draw,
  handleKeyDown,
  handleKeyUp,
  setY,
  redraw,
  ball,
} from "./functions/game";
import { GameData, padMove } from "./types/gameData";

//TODO : bonus mode
//TODO : add names on canvas

enum gameScreenState {
  INTRO,
  PLAYING,
  SCORE,
  PAUSE,
}

const INTRO_DURATION = 1; //INITIAL COUNTDOWN

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

const updateGameData = (
  frontGameData: React.MutableRefObject<GameData>,
  backGameData: GameData,
  initData: GameQuery
) => {
  frontGameData.current.ball = backGameData.ball;
  frontGameData.current.player1.score = backGameData.player1.score;
  frontGameData.current.player2.score = backGameData.player2.score;
  frontGameData.current.game = backGameData.game;
  frontGameData.current.player1.id = initData.game.players.player1.id;
  frontGameData.current.player2.id = initData.game.players.player2.id;
  frontGameData.current.player1.name = initData.game.players.player1.name;
  frontGameData.current.player2.name = initData.game.players.player2.name;
  frontGameData.current.player1.lastMoveTimestamp =
    backGameData.player1.lastMoveTimestamp;
  frontGameData.current.player2.lastMoveTimestamp =
    backGameData.player2.lastMoveTimestamp;
};

let eventSetup = false;

const GameCanvas = ({
  setGameState,
  initData,
}: {
  setGameState: React.Dispatch<React.SetStateAction<gameScreenState>>;
  initData: GameQuery;
}) => {
  const currentUserId = useAuthStore((state) => state.userId);
  const socket = useSocketStore().socket;

  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  if (!canvas) return <>Error</>;

  const requestRef = useRef<number>();
  const drawBall = useRef<number>();
  const playerMove = useRef(padMove.STILL);
  const keyboardStatus = useRef({
    arrowUp: false,
    arrowDown: false,
  });
  const yBall = useRef<number>((CANVAS_WIDTH + 2 * BALL_RADIUS) / 2);
  const xBall = useRef<number>((CANVAS_HEIGHT + 2 * BALL_RADIUS) / 2);
  const yPlayer = useRef<number>((CANVAS_HEIGHT - PAD_HEIGHT) / 2);
  const moves = useRef<
    {
      event: number;
      timestamp: number;
      move: padMove;
      y: number;
      done: boolean;
    }[]
  >([]);

  const frontGameData = useRef<GameData>({
    id: initData.game.id,
    player1: {
      id: initData.game.players.player1.id,
      name: initData.game.players.player1.name,
      coord: { x: LEFT_PAD_X, y: (CANVAS_HEIGHT - PAD_HEIGHT) / 2 },
      playerMove: padMove.STILL,
      score: initData.game.score.player1Score,
      lastMoveTimestamp: 0,
    },
    player2: {
      id: initData.game.players.player2.id,
      name: initData.game.players.player2.name,
      coord: { x: RIGHT_PAD_X, y: (CANVAS_HEIGHT - PAD_HEIGHT) / 2 },
      playerMove: padMove.STILL,
      score: initData.game.score.player2Score,
      lastMoveTimestamp: 0,
    },
    ball: {
      coord: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      },
      velocity: { vx: BALL_VELOCITY, vy: 0 },
    },
    game:
      initData.game.gameMode === GameMode.Classic
        ? {
            type: "CLASSIC",
          }
        : initData.game.gameMode === GameMode.Boost
        ? {
            type: "BOOST",
            player1Boost: { activated: false, remaining: 100 }, // percent
            player2Boost: { activated: false, remaining: 100 },
          }
        : {
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
        playerY: React.MutableRefObject<number>,
        moves: React.MutableRefObject<
          {
            event: number;
            timestamp: number;
            move: padMove;
            y: number;
            done: boolean;
          }[]
        >,
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
        yPlayer,
        moves,
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
      window.removeEventListener("keyup", keyUpCb);
    };
  }, [initData, currentUserId]);

  useEffect(() => {
    const obs = new ResizeObserver(() =>
      redraw(wrap, canvas, frontGameData.current)
    );
    redraw(wrap, canvas, frontGameData.current);
    if (wrap && wrap.current) {
      obs.observe(wrap.current);
    }
    return () => {
      if (wrap && wrap.current) obs.unobserve(wrap.current);
    };
  }, [wrap, canvas, frontGameData]);

  useEffect(() => {
    const cb = (backData: GameData) => {
      if (backData.player1.score >= 11 || backData.player2.score >= 11) {
        setGameState(gameScreenState.SCORE);
      }
      let ctx;
      xBall.current = frontGameData.current.ball.coord.x;
      yBall.current = frontGameData.current.ball.coord.y;
      if (canvas.current) ctx = canvas.current.getContext("2d");
      if (ctx) draw(ctx, frontGameData.current);
      updateGameData(frontGameData, backData, initData);
      let t;
      if (currentUserId === frontGameData.current.player1.id) {
        frontGameData.current.player2.coord.y = backData.player2.coord.y;
        t = moves.current.find(
          (m) => m.timestamp === frontGameData.current.player1.lastMoveTimestamp
        );
        if (t) {
          // const diff = backData.player1.coord.y - t.y;
          // console.log(diff);
          yPlayer.current = backData.player1.coord.y;
        }
        frontGameData.current.player1.coord.y = yPlayer.current;
      } else if (currentUserId === frontGameData.current.player2.id) {
        frontGameData.current.player1.coord.y = backData.player1.coord.y;
        t = moves.current.find(
          (m) => m.timestamp === frontGameData.current.player2.lastMoveTimestamp
        );
        if (t) {
          // const diff = backData.player2.coord.y - t.y;
          // console.log(diff);
          yPlayer.current = backData.player2.coord.y;
        }
        frontGameData.current.player2.coord.y = yPlayer.current;
      if (currentUserId === frontGameData.current.player1.id) {
        console.log(yPlayer.current);
        console.log(backData.player1.coord.y);
      }
    };

    const animate = () => {
      let ctx;
      if (canvas.current) ctx = canvas.current.getContext("2d");
      if (ctx) {
        if (frontGameData.current) {
          setY(yPlayer, moves);
          if (currentUserId === frontGameData.current.player1.id)
            frontGameData.current.player1.coord.y = yPlayer.current;
          else if (currentUserId === frontGameData.current.player2.id)
            frontGameData.current.player2.coord.y = yPlayer.current;
          draw(ctx, frontGameData.current);
        }
      }
    };

    // const animateBall = () => {
    //   let ctx;

    //   if (canvas.current) ctx = canvas.current.getContext("2d");
    //   if (ctx && frontGameData.current) {
    //     ball.draw(ctx, { x: xBall.current, y: yBall.current });
    //     xBall.current = frontGameData.current.ball.velocity.vx;
    //     yBall.current = frontGameData.current.ball.velocity.vy;
    //   }
    //   //TODO COPY the back calcul for the ball
    // };
    socket.on(`Game_${frontGameData.current.game.id}`, cb);
    socket.on(`forfeitGame${frontGameData.current.game.id}`, () =>
      setGameState(gameScreenState.SCORE)
    );
    socket.on(`pauseGame${frontGameData.current.id}`, () =>
      setGameState(gameScreenState.PAUSE)
    );
    socket.on(`unpauseGame${frontGameData.current.id}`, () =>
      setGameState(gameScreenState.PLAYING)
    );
    requestRef.current = setInterval(animate, 10);
    // drawBall.current = setInterval(animateBall, 1); // TODO BALL

    return () => {
      socket.off(`Game_${frontGameData.current.id}`, cb);
      socket.off(`forfeitGame${frontGameData.current.id}`, () =>
        setGameState(gameScreenState.SCORE)
      );
      socket.off(`pauseGame${frontGameData.current.id}`, () =>
        setGameState(gameScreenState.PAUSE)
      );
      socket.off(`unpauseGame${frontGameData.current.id}`, () =>
        setGameState(gameScreenState.PLAYING)
      );
      clearInterval(requestRef.current);
      clearInterval(drawBall.current);
    };
  }, [playerMove, frontGameData]);

  return (
    <>
      <div className="flex h-full w-full" ref={wrap} id="wrap">
        <canvas tabIndex={0} className="m-auto  border-white" ref={canvas} />
      </div>
    </>
  );
};

const Score = ({
  player1Id,
  player1Name,
  player1Score,
  player2Id,
  player2Name,
  player2Score,
}: {
  player1Id: number;
  player1Name: string;
  player1Score: number;
  player2Id: number;
  player2Name: string;
  player2Score: number;
}) => {
  const navigate = useNavigate();
  const initialData = useLoaderData() as Awaited<ReturnType<typeof gameLoader>>;
  const { data } = useQuery({ ...query(gameId), initialData });
  if (typeof data === "undefined") return <div>Error</div>;
  //TODO check score
  console.log(data);
  return (
    <>
      <div className="mt-1 flex h-12 w-128 items-center pl-1">
        <div className="relative flex w-full">
          <img
            className=" h-10 w-10 border border-black object-cover  "
            src={`http://localhost:5173/upload/avatar/${player1Id}`}
            alt="Player 1 avatar"
          />

          <div className="ml-2 w-32 self-center truncate text-left ">
            {player1Name}
          </div>
          <div className="grow select-none self-center text-center text-lg font-bold ">
            VS
          </div>
          <div className="ml-2 w-32 self-center truncate text-left ">
            {player2Name}
          </div>
          <div className="relative">
            <img
              className="h-10 w-10 justify-end border border-black object-cover "
              src={`http://localhost:5173/upload/avatar/${player2Id}`}
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
      {data.game.gameMode === GameMode.Boost && (
        <div className="my-10 flex w-full justify-center text-xl">
          Press SPACE to fire the ball!
        </div>
      )}
    </>
  );
};

const Pause = () => {
  return (
    <div className="test-center my-10 flex w-20 justify-center text-5xl">
      <span className="text-center">Other player is disconnected</span>
    </div>
  );
};

export const Game = () => {
  const params = useParams();
  if (typeof params.gameId === "undefined") return <div>Error</div>;
  const gameId = +params.gameId;
  const initialData = useLoaderData() as Awaited<ReturnType<typeof gameLoader>>;
  const { data } = useQuery({ ...query(gameId), initialData });
  if (typeof data === "undefined") return <div>Error</div>;

  const startTime = new Date(data.game.startAt).getTime();
  const currentTime = new Date().getTime();

  const [gameState, setGameState] = useState<gameScreenState>(
    data.game.finishedAt
      ? gameScreenState.SCORE
      : currentTime > startTime + INTRO_DURATION * 1000
      ? gameScreenState.PLAYING
      : gameScreenState.INTRO
  );

  switch (gameState) {
    case gameScreenState.INTRO:
      return (
        <Intro startTime={startTime} setGameState={setGameState} data={data} />
      );
    case gameScreenState.SCORE:
      queryClient.invalidateQueries(["Game", data.game.id]);
      return (
        <Score
          player1Id={data.game.players.player1.id}
          player2Id={data.game.players.player2.id}
          player1Score={data.game.score.player1Score}
          player2Score={data.game.score.player2Score}
          player1Name={data.game.players.player1.name}
          player2Name={data.game.players.player2.name}
        />
      );
    case gameScreenState.PLAYING:
      return (
        <div className=" h-full w-full">
          <GameCanvas initData={data} setGameState={setGameState} />
        </div>
      );
    case gameScreenState.PAUSE:
      return <Pause />;
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
