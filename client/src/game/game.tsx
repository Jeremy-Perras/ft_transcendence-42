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
import { RankIcon } from "../sidebar/utils/rankIcon";
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
  setCurrentPlayerY,
  redraw,
  FRAME_RATE,
  animateBall,
  animateOpponentPad,
  animateBallGift,
} from "./functions/game";
import { GameData, padMove } from "./types/gameData";

enum gameScreenState {
  INTRO,
  PLAYING,
  SCORE,
  PAUSE,
}

const INTRO_DURATION = 5; //INITIAL COUNTDOWN

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
  const playerSpeed = useRef<number>(1);
  const playerSize = useRef<number>(1);
  const playerBonus = useRef<string>("Bonus");
  const playerMove = useRef(padMove.STILL);
  const keyboardStatus = useRef({
    arrowUp: false,
    arrowDown: false,
  });
  const yPlayer = useRef<number>((CANVAS_HEIGHT - PAD_HEIGHT) / 2);
  const nextYOpponent = useRef<number>((CANVAS_HEIGHT - PAD_HEIGHT) / 2);

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
            player1Boost: { activated: false, remaining: 100 },
            player2Boost: { activated: false, remaining: 100 },
          }
        : {
            type: "GIFT",

            Gift: [],
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
        playerMove: React.MutableRefObject<padMove>,
        playerSpeed: number,
        playerSize: number
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
        playerMove,
        playerSpeed.current,
        playerSize.current
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
      redraw(
        wrap,
        canvas,
        frontGameData.current,
        playerBonus.current,
        currentUserId
      )
    );
    redraw(
      wrap,
      canvas,
      frontGameData.current,
      playerBonus.current,
      currentUserId
    );
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
      if (canvas.current) ctx = canvas.current.getContext("2d");
      if (ctx)
        draw(ctx, frontGameData.current, playerBonus.current, currentUserId);
      updateGameData(frontGameData, backData, initData);

      if (currentUserId === frontGameData.current.player1.id) {
        if (frontGameData.current.game.type === "GIFT") {
          if (
            playerSize.current > frontGameData.current.game.player1Gifts.size
          ) {
            playerBonus.current = "Size down";
          } else if (
            playerSize.current < frontGameData.current.game.player1Gifts.size
          ) {
            playerBonus.current = "Size up";
          }
          if (
            playerSpeed.current > frontGameData.current.game.player1Gifts.speed
          ) {
            playerBonus.current = "Speed down";
          } else if (
            playerSpeed.current < frontGameData.current.game.player1Gifts.speed
          ) {
            playerBonus.current = "Speed up";
          }
          playerSize.current = frontGameData.current.game.player1Gifts.size;
          playerSpeed.current = frontGameData.current.game.player1Gifts.speed;
        }
        nextYOpponent.current = backData.player2.coord.y;
        yPlayer.current = backData.player1.coord.y;

        frontGameData.current.player1.coord.y = yPlayer.current;
      } else if (currentUserId === frontGameData.current.player2.id) {
        if (frontGameData.current.game.type === "GIFT") {
          if (
            playerSize.current > frontGameData.current.game.player2Gifts.size
          ) {
            playerBonus.current = "Size down";
          } else if (
            playerSize.current < frontGameData.current.game.player2Gifts.size
          ) {
            playerBonus.current = "Size up";
          }
          if (
            playerSpeed.current > frontGameData.current.game.player2Gifts.speed
          ) {
            playerBonus.current = "Speed down";
          } else if (
            playerSpeed.current < frontGameData.current.game.player2Gifts.speed
          ) {
            playerBonus.current = "Speed up";
          }
          playerSize.current = frontGameData.current.game.player2Gifts.size;
          playerSpeed.current = frontGameData.current.game.player2Gifts.speed;
        }
        nextYOpponent.current = backData.player1.coord.y;
        yPlayer.current = backData.player2.coord.y;
        frontGameData.current.player2.coord.y = yPlayer.current;
      }
    };
    const animate = () => {
      let ctx;
      if (canvas.current) ctx = canvas.current.getContext("2d");

      if (ctx) {
        if (frontGameData.current) {
          setCurrentPlayerY(
            yPlayer,
            moves,
            playerSpeed.current,
            playerSize.current
          );
          if (currentUserId === frontGameData.current.player1.id) {
            frontGameData.current.player1.coord.y = yPlayer.current;
            if (frontGameData.current.game.type === "GIFT") {
              frontGameData.current.player2 = animateOpponentPad(
                frontGameData.current.player2,
                nextYOpponent.current,
                frontGameData.current.game.player2Gifts.speed,
                frontGameData.current.game.player2Gifts.size
              );
            } else {
              frontGameData.current.player2 = animateOpponentPad(
                frontGameData.current.player2,
                nextYOpponent.current,
                1,
                1
              );
            }
          } else if (currentUserId === frontGameData.current.player2.id) {
            frontGameData.current.player2.coord.y = yPlayer.current;
            if (frontGameData.current.game.type === "GIFT") {
              frontGameData.current.player1 = animateOpponentPad(
                frontGameData.current.player1,
                nextYOpponent.current,
                frontGameData.current.game.player1Gifts.speed,
                frontGameData.current.game.player1Gifts.size
              );
            } else {
              frontGameData.current.player1 = animateOpponentPad(
                frontGameData.current.player1,
                nextYOpponent.current,
                1,
                1
              );
            }
          }
          if (frontGameData.current.game.type !== "GIFT")
            animateBall(frontGameData);
          else animateBallGift(frontGameData);
          draw(ctx, frontGameData.current, playerBonus.current, currentUserId);
        }
      }
    };
    socket.on(`Game_${frontGameData.current.id}`, cb);
    socket.on(`forfeitGame${frontGameData.current.id}`, () =>
      setGameState(gameScreenState.SCORE)
    );
    socket.on(`pauseGame${frontGameData.current.id}`, () =>
      setGameState(gameScreenState.PAUSE)
    );
    socket.on(`unpauseGame${frontGameData.current.id}`, () => {
      setGameState(gameScreenState.PLAYING);
    });
    requestRef.current = setInterval(animate, FRAME_RATE);
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
    };
  }, [playerMove, frontGameData, currentUserId]);

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
  player1Rank,
  player2Id,
  player2Name,
  player2Score,
  player2Rank,
}: {
  player1Id: number;
  player1Name: string;
  player1Score: number;
  player1Rank: number;
  player2Id: number;
  player2Name: string;
  player2Score: number;
  player2Rank: number;
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col items-center justify-evenly">
      <div className="flex items-center justify-center">
        <div className="relative flex w-48 grow-0 flex-col items-center justify-center">
          <img
            className="border border-black object-cover"
            src={`http://localhost:5173/upload/avatar/${player1Id}`}
            alt="Player 1 avatar"
          />
          <img
            className="absolute top-2 -right-6 h-12 w-12 sm:-right-10 sm:h-20 sm:w-20"
            src={RankIcon(player1Rank)}
          />
          <div className="my-2 grow-0 truncate text-center font-content">
            {player1Name}
          </div>
        </div>
        <div className="mx-4 select-none text-center">VS</div>
        <div className="relative flex w-48 grow-0 flex-col items-center ">
          <img
            className="border border-black object-cover "
            src={`http://localhost:5173/upload/avatar/${player2Id}`}
            alt="Player 2 avatar"
          />
          <img
            className="absolute top-2 -right-6 h-12 w-12 sm:-right-10 sm:h-20 sm:w-20"
            src={RankIcon(player2Rank)}
          />
          <div className="my-2 grow-0 truncate text-center font-content">
            {player2Name}
          </div>
        </div>
      </div>

      <div className="text-4xl">
        {player1Score && player2Score
          ? `${player1Score} - ${player2Score}`
          : `- - -`}
      </div>
      <button
        className="my-6 text-3xl text-white hover:text-slate-300"
        onClick={() => navigate(`/`)}
      >
        Home
      </button>
    </div>
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
    <div className="flex flex-col items-center justify-center">
      <div className=" mt-10 flex w-full items-center justify-center">
        <div className="relative mx-2 flex w-40 flex-col items-center justify-center sm:w-60 ">
          <img
            className=" h-40 w-40 justify-end border border-black object-cover sm:h-60 sm:w-60 "
            src={`http://localhost:5173/upload/avatar/${data.game.players.player1.id}`}
            alt="Player 2 avatar"
          />
          <img
            className="absolute top-2 -right-6 h-12 w-12 sm:-right-10 sm:h-20 sm:w-20"
            src={RankIcon(data.game.players.player1.rank)}
          />
          <div className="mt-2 truncate text-center text-xs sm:text-base ">
            {data.game.players.player1?.name}
          </div>
        </div>
        <div className="grow animate-pulse select-none self-center text-center text-3xl font-bold ">
          VS
        </div>
        <div className="relative mx-2 flex w-40 flex-col items-center justify-center sm:w-60">
          <img
            className="h-40 w-40 justify-end border border-black object-cover sm:h-60 sm:w-60"
            src={`http://localhost:5173/upload/avatar/${data.game.players.player2.id}`}
            alt="Player 2 avatar"
          />
          <img
            className="absolute top-2 -right-6 h-12 w-12 sm:-right-10 sm:h-20 sm:w-20"
            src={RankIcon(data.game.players.player2.rank)}
          />
          <div className="mt-2 truncate text-center text-xs sm:text-base ">
            {data.game.players.player2?.name}
          </div>
        </div>
      </div>

      <div className="my-10 flex w-20 justify-center text-5xl">
        <span>{Math.floor(timer / 60)} </span>
        <span className="mx-1 pb-1 font-mono">:</span>
        <span>{timer % 60 < 10 ? `0${timer % 60}` : `${timer % 60}`}</span>
      </div>
      {data.game.gameMode === GameMode.Boost && (
        <div className="my-10 text-center  text-xl">
          Press SPACE to fire the ball!
        </div>
      )}
      {data.game.gameMode === GameMode.Gift && (
        <div className="my-10 text-center  text-xl">Catch the gifts!</div>
      )}
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
  const socket = useSocketStore().socket;

  const [gameState, setGameState] = useState<gameScreenState>(
    data.game.finishedAt
      ? gameScreenState.SCORE
      : currentTime > startTime + INTRO_DURATION * 1000
      ? gameScreenState.PLAYING
      : gameScreenState.INTRO
  );

  useEffect(() => {
    socket.on(`endGame${gameId}`, () =>
      queryClient.invalidateQueries(["Game", gameId])
    );
    return () => {
      socket.off(`endGame${gameId}`, () =>
        queryClient.invalidateQueries(["Game", gameId])
      );
    };
  }, [gameState]);

  const Pause = () => {
    return (
      <div className="test-center my-10 flex w-20 justify-center text-5xl">
        <span className="text-center">Other player is disconnected</span>
      </div>
    );
  };

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
          player1Rank={data.game.players.player1.rank}
          player2Rank={data.game.players.player2.rank}
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
