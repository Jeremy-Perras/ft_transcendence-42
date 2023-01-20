import { GameMode } from "../../gql/graphql";
import { Socket } from "socket.io-client";
import { GameData, padMove } from "../types/gameData";

type valueHandleKeys = {
  handleKey: string;
  date: number;
};
//TODO : set  values depending on client + size ratio got from back
export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 500;

export const PAD_HEIGHT = Math.ceil(CANVAS_HEIGHT / 10);
export const PAD_WIDTH = Math.ceil(PAD_HEIGHT / 10);

export const BALL_RADIUS = 4;
export const LEFT_PAD_X = CANVAS_WIDTH / 8;
export const RIGHT_PAD_X = CANVAS_WIDTH - CANVAS_WIDTH / 8 - PAD_WIDTH;

//TODO : adapt code to differents pad velocity
export const PAD_VELOCITY = 5;
export const BALL_VELOCITY = 10;
export let counter = 0;
export const handleKey: Map<number, valueHandleKeys> = new Map();

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

  draw(context: CanvasRenderingContext2D, x: number, y: number) {
    context.fillStyle = this.classicColor;
    context.beginPath();
    context.arc(x, y, BALL_RADIUS, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
  },
};

const fireball = {
  draw(
    context: CanvasRenderingContext2D,
    coord: { x: number; y: number },
    velocity: { vx: number; vy: number },
    activated: boolean
  ) {
    const gradient = context.createRadialGradient(
      coord.x,
      coord.y,
      BALL_RADIUS / 2,
      coord.x,
      coord.y,
      BALL_RADIUS
    );
    gradient.addColorStop(0, "yellow");
    gradient.addColorStop(1, "red");
    context.fillStyle = gradient;
    if (activated) {
      const angle = Math.atan(Math.abs(velocity.vy) / Math.abs(velocity.vx));

      context.moveTo(
        velocity.vx > 0
          ? coord.x + Math.sin(angle) * BALL_RADIUS
          : coord.x - Math.sin(angle) * BALL_RADIUS,
        velocity.vy > 0
          ? coord.y - Math.cos(angle) * BALL_RADIUS
          : coord.y + Math.cos(angle) * BALL_RADIUS
      );

      context.lineTo(
        velocity.vx > 0
          ? coord.x - BALL_RADIUS * 3 * Math.cos(angle)
          : coord.x + BALL_RADIUS * 3 * Math.cos(angle),
        velocity.vy > 0
          ? coord.y - BALL_RADIUS * 3 * Math.sin(angle)
          : coord.y + BALL_RADIUS * 3 * Math.sin(angle)
      );

      context.lineTo(
        velocity.vx > 0
          ? coord.x - Math.sin(angle) * BALL_RADIUS
          : coord.x + Math.sin(angle) * BALL_RADIUS,
        velocity.vy > 0
          ? coord.y + Math.cos(angle) * BALL_RADIUS
          : coord.y - Math.cos(angle) * BALL_RADIUS
      );
      context.fill();
    }
    context.beginPath();
    context.arc(coord.x, coord.y, BALL_RADIUS, 0, 2 * Math.PI);
    context.fill();
  },
};

const boostBar = {
  draw(
    context: CanvasRenderingContext2D,
    fillPlayer1: number,
    fillPlayer2: number
  ) {
    const gradient1 = context.createLinearGradient(
      0,
      CANVAS_HEIGHT / 100,
      0,
      CANVAS_HEIGHT / 5
    );
    gradient1.addColorStop(0, "yellow");
    gradient1.addColorStop(1, "red");
    context.fillStyle = gradient1;
    context.fillRect(
      CANVAS_WIDTH / 50,
      CANVAS_HEIGHT / 50 + ((CANVAS_HEIGHT / 5) * (100 - fillPlayer1)) / 100,
      CANVAS_WIDTH / 50,
      ((CANVAS_HEIGHT / 5) * fillPlayer1) / 100
    );

    context.fillRect(
      (48 * CANVAS_WIDTH) / 50,
      CANVAS_HEIGHT / 50 + ((CANVAS_HEIGHT / 5) * (100 - fillPlayer2)) / 100,
      CANVAS_WIDTH / 50,
      ((CANVAS_HEIGHT / 5) * fillPlayer2) / 100
    );
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
      (CANVAS_WIDTH * 2) / 6,
      CANVAS_HEIGHT / 10
    );
    context.fillText(
      `${player2Score}`,
      (CANVAS_WIDTH * 4) / 6,
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

  if (data.game.type === "CLASSIC" || data.game.type === "GIFT")
    ball.draw(context, data.ball.coord.x, data.ball.coord.y);

  if (data.game.type === "BOOST") {
    const boostActivated =
      data.game.player1Boost.activated || data.game.player2Boost.activated;
    fireball.draw(context, data.ball.coord, data.ball.velocity, boostActivated);
    fireball.draw(context, data.ball.coord, data.ball.velocity, boostActivated);
    boostBar.draw(
      context,
      data.game.player1Boost.remaining,
      data.game.player2Boost.remaining
    );
  }
};

//handle if against wall
//get player coordinate to check collision
// push events in array with num, timestamp, type of event
//
export const handleKeyDown = (
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
) => {
  if (keycode === "Space" && gameMode === GameMode.Speed) {
    socket.emit("boostActivated", gameId);
  }
  if (keycode === "ArrowUp") {
    keyboardStatus.current.arrowUp = true;
    if (!keyboardStatus.current.arrowDown) {
      if (playerMove.current !== padMove.UP) {
        handleKey.set(counter++, {
          date: new Date().getTime(),
          handleKey: "UP",
        });
        console.log(new Date().getTime(), "UP");
        playerMove.current = padMove.UP;
        socket.emit("movePadUp", gameId);
      }
    } else {
      if (playerMove.current !== padMove.STILL) {
        handleKey.set(counter++, {
          date: new Date().getTime(),
          handleKey: "NONE",
        });
        console.log(new Date().getTime(), "NONE");
        playerMove.current = padMove.STILL;
        socket.emit("stopPad", gameId);
      }
    }
  }
  if (keycode === "ArrowDown") {
    keyboardStatus.current.arrowDown = true;
    if (!keyboardStatus.current.arrowUp) {
      if (playerMove.current !== padMove.DOWN) {
        handleKey.set(counter++, {
          date: new Date().getTime(),
          handleKey: "DOWN",
        });
        console.log(new Date().getTime(), "DOWN");
        playerMove.current = padMove.DOWN;
        socket.emit("movePadDown", gameId);
      }
    } else {
      if (playerMove.current !== padMove.STILL) {
        handleKey.set(counter++, {
          date: new Date().getTime(),
          handleKey: "NONE",
        });
        console.log(new Date().getTime(), "NONE");
        playerMove.current = padMove.STILL;
        socket.emit("stopPad", gameId);
      }
    }
  }
};
export const incrementCounter = () => {
  counter++;
};

export const handleKeyUp = (
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
) => {
  if (keycode === "ArrowUp") {
    keyboardStatus.current.arrowUp = false;
    if (!keyboardStatus.current.arrowDown) {
      if (playerMove.current !== padMove.STILL) {
        console.log(new Date().getTime(), "NONE");
        playerMove.current = padMove.STILL;
        socket.emit("stopPad", gameId);
      }
    } else {
      if (playerMove.current !== padMove.DOWN) {
        playerMove.current = padMove.DOWN;
        console.log(new Date().getTime(), "DOWN");
        socket.emit("movePadDown", gameId);
      }
    }
  }
  if (keycode === "ArrowDown") {
    keyboardStatus.current.arrowDown = false;
    if (!keyboardStatus.current.arrowUp) {
      if (playerMove.current !== padMove.STILL) {
        playerMove.current = padMove.STILL;
        console.log(new Date().getTime(), "NONE");
        socket.emit("stopPad", gameId);
      }
    } else {
      if (playerMove.current !== padMove.UP) {
        playerMove.current = padMove.UP;
        console.log(new Date().getTime(), "UP");
        socket.emit("movePadUp", gameId);
      }
    }
  }

  if (keycode === "Space" && gameMode === GameMode.Speed) {
    socket.emit("boostDeactivated", gameId);
  }
};
