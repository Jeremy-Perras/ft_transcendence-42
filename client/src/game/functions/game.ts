import { GameMode } from "client/src/gql/graphql";
import { Socket } from "socket.io-client";
import { GameData, padMove } from "../types/gameData";

//TODO : set  values depending on client + size ratio got from back
export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 500;

export const PAD_HEIGHT = Math.ceil(CANVAS_HEIGHT / 10);
export const PAD_WIDTH = Math.ceil(PAD_HEIGHT / 10);

export const BALL_RADIUS = 4;
export const LEFT_PAD_X = 2 * PAD_WIDTH;
export const RIGHT_PAD_X = CANVAS_WIDTH - 3 * PAD_WIDTH;

//TODO : adapt code to differents pad velocity
export const PAD_VELOCITY = 5;
export const BALL_VELOCITY = 10;

const background = {
  x: 0,
  y: 0,
  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = "black";
    context.beginPath();
    context.fillRect(this.x, this.y, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = "white";
    for (let y = 0; y <= CANVAS_HEIGHT; y += CANVAS_HEIGHT / 40) {
      context.fillRect(CANVAS_WIDTH / 2 - 1, y, 2, CANVAS_HEIGHT / 80);
    }
    context.closePath();
  },
};

const leftPad = {
  color: "white",
  draw(context: CanvasRenderingContext2D, y: number) {
    context.fillStyle = this.color;
    context.beginPath();
    context.fillRect(LEFT_PAD_X, y, PAD_WIDTH, PAD_HEIGHT);
    context.closePath();
    context.fill();
  },
};

const rightPad = {
  color: "white",
  draw(context: CanvasRenderingContext2D, y: number) {
    context.fillStyle = this.color;
    context.beginPath();
    context.fillRect(RIGHT_PAD_X, y, PAD_WIDTH, PAD_HEIGHT);
    context.closePath();
    context.fill();
  },
};

const ball = {
  classicColor: "white",
  speedColor: "red",
  bonusColor: "blue",
  draw(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    mode: "CLASSIC" | "BOOST" | "GIFT"
  ) {
    context.fillStyle =
      mode === "CLASSIC"
        ? this.classicColor
        : mode === "BOOST"
        ? this.speedColor
        : this.bonusColor;
    context.beginPath();
    context.arc(x, y, BALL_RADIUS, 0, 2 * Math.PI);
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
    context.font = "32px serif";
    context.fillText(
      `${player1Score}`,
      (CANVAS_WIDTH * 2) / 5,
      CANVAS_HEIGHT / 10
    );
    context.fillText(
      `${player2Score}`,
      (CANVAS_WIDTH * 3) / 5,
      CANVAS_HEIGHT / 10
    );
  },
};

export const draw = (context: CanvasRenderingContext2D, data: GameData) => {
  context?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  background.draw(context);
  score.draw(context, data.game.score.player1, data.game.score.player2);
  leftPad.draw(context, data.player1.coord.y);
  rightPad.draw(context, data.player2.coord.y);
  ball.draw(context, data.ball.coord.x, data.ball.coord.y, data.game.type);
};

export const handleKeyDown = (
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
  playerMove: React.MutableRefObject<padMove>
) => {
  if (keycode === "ArrowUp") {
    !keyboardStatus.arrowUp
      ? setKeyBoardStatus((prev) => ({
          arrowDown: prev.arrowDown,
          arrowUp: true,
        }))
      : null;
    if (!keyboardStatus.arrowDown) {
      if (playerMove.current !== padMove.UP) {
        socket.emit("movePadUp", gameId);
        playerMove.current = padMove.UP;
      }
    } else {
      if (playerMove.current !== padMove.STILL) {
        playerMove.current = padMove.STILL;
        socket.emit("stopPad", gameId);
      }
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
      if (playerMove.current !== padMove.DOWN) {
        playerMove.current = padMove.DOWN;
        socket.emit("movePadDown", gameId);
      }
    } else {
      if (playerMove.current !== padMove.STILL) {
        playerMove.current = padMove.STILL;
        socket.emit("stopPad", gameId);
      }
    }
  }
};

export const handleKeyUp = (
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
  playerMove: React.MutableRefObject<padMove>
) => {
  if (keycode === "ArrowUp") {
    keyboardStatus.arrowUp
      ? setKeyBoardStatus((prev) => ({
          arrowUp: false,
          arrowDown: prev.arrowDown,
        }))
      : null;
    if (!keyboardStatus.arrowDown) {
      if (playerMove.current !== padMove.STILL) {
        playerMove.current = padMove.STILL;
        socket.emit("stopPad", gameId);
      }
    } else {
      if (playerMove.current !== padMove.DOWN) {
        playerMove.current = padMove.DOWN;
        socket.emit("movePadDown", gameId);
      }
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
      if (playerMove.current !== padMove.STILL) {
        playerMove.current = padMove.STILL;
        socket.emit("stopPad", gameId);
      }
    } else {
      if (playerMove.current !== padMove.UP) {
        playerMove.current = padMove.UP;
        socket.emit("movePadUp", gameId);
      }
    }
  }
};
