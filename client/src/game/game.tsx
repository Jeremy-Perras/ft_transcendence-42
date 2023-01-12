import { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { GameMode } from "../gql/graphql";
import { useAuthStore, useSocketStore } from "../stores";

const GAME_DURATION = 1200;
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
}: {
  draw: (context: CanvasRenderingContext2D, gameData: GameData) => void;
  startTime: number;
  setGameState: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  if (!canvas) return <>Error</>;
  const { gameId } = useParams();
  if (!gameId) return <div>Error</div>;

  const currentUserId = useAuthStore((state) => state.userId);
  const socket = useSocketStore().socket;
  const [gameData, setGameData] = useState<GameData>();
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

  const isPlayer = gameData
    ? currentUserId === gameData.player1.id ||
      currentUserId === gameData.player2.id
      ? true
      : false
    : false;

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    if (!gameData) return;
    draw(context, gameData);
  }, [gameData]);
  console.log(playerMove);

  return (
    <>
      <canvas
        tabIndex={0}
        onKeyDown={(e) => {
          if (isPlayer) {
            handleKeyDown(
              e.key,
              socket,
              +gameId,
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
              +gameId,
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
      <div className="my-2 flex">
        <div>{`Player 1 : id ${gameData?.player1.id}`}</div>
        <div className="mx-4">VS</div>
        <div>{`Player 2 : id ${gameData?.player2.id}`}</div>

        {/* TODO : add here banner with player avatar, rank, name */}
      </div>
      {isPlayer ? (
        <GameTimer startTime={startTime} setGameState={setGameState} />
      ) : (
        //TODO : add here game is ended or change timer to real timer with start from
        <span className="my-2 text-lg">Live Stream</span>
      )}
    </>
  );
};

const Score = () => {
  const navigate = useNavigate();
  return (
    <>
      <div>SCORE</div>
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
  startTime,
  setGameState,
}: {
  startTime: number;
  setGameState: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [timer, setTimer] = useState(GAME_DURATION);

  useEffect(() => {
    if (timer < 0) setGameState("score");
    const interval = setInterval(() => {
      setTimer(
        Math.floor(
          (startTime + GAME_DURATION * 1000 - new Date().getTime()) / 1000
        )
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

export const Game = () => {
  const [gameState, setGameState] = useState("playing");

  const startTime = new Date().getTime(); //TODO : change with start time from back

  return gameState === "playing" ? (
    <>
      <GameCanvas
        draw={draw}
        startTime={startTime}
        setGameState={setGameState}
      />
    </>
  ) : (
    <Score />
  );
};
