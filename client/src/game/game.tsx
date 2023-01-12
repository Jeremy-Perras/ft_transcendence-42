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

enum gameScreenState {
  INTRO,
  PLAYING,
  SCORE,
}

const GAME_DURATION = 15;
const CANVAS_WIDTH = 3000;
const CANVAS_HEIGHT = 1500;
const PAD_HEIGHT = 25;
const PAD_WIDTH = Math.ceil(PAD_HEIGHT / 5);
const BALL_RADIUS = 4;

type GameData = {
  player1: { id: number; coord: Coord; score: number };
  player2: { id: number; coord: Coord; score: number };
  ball: Coord;
  gameMode: GameMode;
};
// dans back : keep state up / down / nothing for each player => every X ms check and send back to front

type Coord = {
  x: number;
  y: number;
};

enum PadMove {
  STILL,
  UP,
  DOWN,
}

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

const background = {
  x: 0,
  y: 0,
  width: 300,
  height: 150,
  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = "black";
    context.beginPath();
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = "white";
    for (let y = 0; y <= 140; y += 20) {
      context.fillRect(149, y, 2, 10);
    }
    context.closePath();
  },
};

const leftPad = {
  width: PAD_WIDTH,
  height: PAD_HEIGHT,
  color: "white",
  draw(context: CanvasRenderingContext2D, x: number, y: number) {
    context.fillStyle = this.color;
    context.beginPath();
    context.fillRect(x, y, this.width, this.height);
    context.closePath();
    context.fill();
  },
};

const rightPad = {
  width: PAD_WIDTH,
  height: PAD_HEIGHT,
  color: "white",
  draw(context: CanvasRenderingContext2D, x: number, y: number) {
    context.fillStyle = this.color;
    context.beginPath();
    context.fillRect(x, y, this.width, this.height);
    context.closePath();
    context.fill();
  },
};

const ball = {
  radius: BALL_RADIUS,
  color: "white",
  draw(context: CanvasRenderingContext2D, x: number, y: number) {
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(x, y, this.radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
  },
};

const score = {
  color: "white",
  draw(
    context: CanvasRenderingContext2D,
    player1Score: number,
    player2Score: number
  ) {
    context.fillStyle = this.color;
    context.font = "24px serif";
    console.log(`${player1Score}`);
    context.fillText(`${player1Score}`, 110, 20);
    context.fillText(`${player2Score}`, 180, 20);
  },
};

const draw = (context: CanvasRenderingContext2D, gameData: GameData) => {
  context?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  background.draw(context);
  score.draw(context, gameData.player1.score, gameData.player2.score);
  leftPad.draw(context, gameData.player1.coord.x, gameData.player1.coord.y);
  rightPad.draw(context, gameData.player2.coord.x, gameData.player2.coord.y);
  ball.draw(context, gameData.ball.x, gameData.ball.y);
};

const handleKeyDown = (
  keycode: string,
  socket: Socket,
  gameId: number,
  keyboardStatus: {
    arrowUp: boolean;
    arrowDown: boolean;
  },
  setKeyBoardStatus: React.Dispatch<
    React.SetStateAction<{
      arrowUp: boolean;
      arrowDown: boolean;
    }>
  >,
  setPlayerMove: React.Dispatch<React.SetStateAction<PadMove>>
) => {
  if (keycode === "ArrowUp") {
    !keyboardStatus.arrowUp
      ? setKeyBoardStatus((prev) => ({
          arrowDown: prev.arrowDown,
          arrowUp: true,
        }))
      : null;
    if (!keyboardStatus.arrowDown) {
      setPlayerMove(PadMove.UP);
      socket.emit("movePadUp", gameId);
    } else {
      setPlayerMove(PadMove.STILL);
      socket.emit("stopPad", gameId);
    }
  }
  if (keycode === "ArrowDown") {
    !keyboardStatus.arrowDown
      ? setKeyBoardStatus((prev) => ({
          arrowUp: prev.arrowUp,
          arrowDown: true,
        }))
      : null;
    if (!keyboardStatus.arrowUp) {
      setPlayerMove(PadMove.DOWN);
      socket.emit("movePadDown", gameId);
    } else {
      setPlayerMove(PadMove.STILL);
      socket.emit("stopPad", gameId);
    }
  }
};

const handleKeyUp = (
  keycode: string,
  socket: Socket,
  gameId: number,
  keyboardStatus: {
    arrowUp: boolean;
    arrowDown: boolean;
  },
  setKeyBoardStatus: React.Dispatch<
    React.SetStateAction<{
      arrowUp: boolean;
      arrowDown: boolean;
    }>
  >,
  setPlayerMove: React.Dispatch<React.SetStateAction<PadMove>>
) => {
  if (keycode === "ArrowUp") {
    keyboardStatus.arrowUp
      ? setKeyBoardStatus((prev) => ({
          arrowUp: false,
          arrowDown: prev.arrowDown,
        }))
      : null;
    if (!keyboardStatus.arrowDown) {
      setPlayerMove(PadMove.STILL);
      socket.emit("stopPad", gameId);
    } else {
      setPlayerMove(PadMove.DOWN);
      socket.emit("movePadDown", gameId);
    }
  }
  if (keycode === "ArrowDown") {
    keyboardStatus.arrowDown
      ? setKeyBoardStatus((prev) => ({
          arrowDown: false,
          arrowUp: prev.arrowUp,
        }))
      : null;
    if (!keyboardStatus.arrowUp) {
      setPlayerMove(PadMove.STILL);
      socket.emit("stopPad", gameId);
    } else {
      setPlayerMove(PadMove.UP);
      socket.emit("movePadUp", gameId);
    }
  }
};

const GameCanvas = ({
  draw,
  startTime,
  setGameState,
  initData,
}: {
  draw: (context: CanvasRenderingContext2D, gameData: GameData) => void;
  startTime: number;

  setGameState: React.Dispatch<React.SetStateAction<gameScreenState>>;
  initData: GameQuery;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  if (!canvas) return <>Error</>;

  const currentUserId = useAuthStore((state) => state.userId);
  const socket = useSocketStore().socket;
  const [gameData, setGameData] = useState<GameData>();

  //TODO: remove this and emit at first render to get an update on current game state

  const [playerMove, setPlayerMove] = useState(PadMove.STILL);
  const [keyboardStatus, setKeyBoardStatus] = useState({
    arrowUp: false,
    arrowDown: false,
  });

  socket.on("initialState", (data: GameData) => {
    setGameData(data);
  });

  socket.on("updateCanvas", (data: GameData) => {
    setGameData(data);
  });

  const isPlayer =
    currentUserId === initData.game.players.player1.id ||
    currentUserId === initData.game.players.player2.id
      ? true
      : false;

  useEffect(() => {
    if (!isPlayer) socket.emit("joinRoomAsViewer", initData.game.id);
    socket.emit("gameReady", initData.game.id);
  }, []);

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    if (!gameData) return;
    draw(context, gameData);
  }, [gameData]);

  //TODO : pause game ? check subject
  return (
    <>
      <canvas
        tabIndex={0}
        onKeyDown={(e) => {
          if (isPlayer) {
            handleKeyDown(
              e.key,
              socket,
              initData.game.id,
              keyboardStatus,
              setKeyBoardStatus,
              setPlayerMove
            );
          }
        }}
        onKeyUp={(e) => {
          if (isPlayer) {
            handleKeyUp(
              e.key,
              socket,
              initData.game.id,
              keyboardStatus,
              setKeyBoardStatus,
              setPlayerMove
            );
          }
        }}
        className="w-full border-4  border-white"
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
      {isPlayer ? (
        <GameTimer
          gameId={initData.game.id}
          socket={socket}
          startTime={startTime}
          duration={GAME_DURATION}
          setGameState={setGameState}
        />
      ) : (
        //TODO : add here game is ended or change timer to real timer with start from
        <span className="my-2 text-lg">Live Stream</span>
      )}
    </>
  );
};

const Score = ({ data }: { data: GameQuery }) => {
  const navigate = useNavigate();

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

const GameTimer = ({
  gameId,
  socket,
  startTime,
  duration,
  setGameState,
}: {
  gameId: number;
  socket: Socket;
  startTime: number;
  duration: number;
  setGameState: React.Dispatch<React.SetStateAction<gameScreenState>>;
}) => {
  const [timer, setTimer] = useState(duration);

  useEffect(() => {
    if (timer < 0) {
      socket.emit("endGame", gameId);
      setGameState(gameScreenState.SCORE);
    }
    const interval = setInterval(() => {
      setTimer(
        Math.floor((startTime + duration * 1000 - new Date().getTime()) / 1000)
      );
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

const Intro = ({
  data,
  startTime,
  setGameState,
}: {
  data: GameQuery;
  startTime: number;
  setGameState: React.Dispatch<React.SetStateAction<gameScreenState>>;
}) => {
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    if (timer < 0) {
      setGameState(gameScreenState.PLAYING);
    }
    const interval = setInterval(() => {
      setTimer(
        Math.floor((startTime + 5 * 1000 - new Date().getTime()) / 1000)
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
      <div className="my-2 flex w-20 justify-center">
        <span>{Math.floor(timer / 60)} </span>
        <span className="mx-1 pb-1 font-mono text-lg">:</span>
        <span>{timer % 60 < 10 ? `0${timer % 60}` : `${timer % 60}`}</span>
      </div>
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
  // TODO : change with this when mutation OK

  const startTime = new Date(data.game.startAt).getTime(); //TODO : change with start time from back
  const currentTime = new Date().getTime();

  const [gameState, setGameState] = useState<gameScreenState>(
    currentTime > startTime + 5000
      ? gameScreenState.PLAYING
      : gameScreenState.INTRO
  );

  switch (gameState) {
    case gameScreenState.INTRO:
      return (
        <Intro startTime={startTime} setGameState={setGameState} data={data} />
      );
    case gameScreenState.SCORE:
      return <Score data={data} />;
    case gameScreenState.PLAYING:
      return (
        <GameCanvas
          initData={data}
          draw={draw}
          startTime={startTime + 5000}
          setGameState={setGameState}
        />
      );

    default:
      return <div>Error</div>;
  }
};
