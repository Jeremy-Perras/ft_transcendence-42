import { GameMode } from "../../gql/graphql";
import { Socket } from "socket.io-client";
import { GameData, padMove } from "../types/gameData";

export const CANVAS_WIDTH = 2000;
export const CANVAS_HEIGHT = 2000;

export const PAD_HEIGHT = Math.ceil(CANVAS_HEIGHT / 12);
export const PAD_WIDTH = Math.ceil(PAD_HEIGHT / 5);

const BALL_RADIUS = CANVAS_WIDTH / 100;
export const LEFT_PAD_X = CANVAS_WIDTH / 8;
export const RIGHT_PAD_X = CANVAS_WIDTH - CANVAS_WIDTH / 8 - PAD_WIDTH;

export const BALL_VELOCITY = 50;
export const PAD_SPEED = 1; //px / ms

export function redraw(
  wrap: React.RefObject<HTMLElement>,
  canvas: React.RefObject<HTMLCanvasElement>,
  data: GameData
) {
  let cssWidth;
  let cssHeight;
  if (wrap && wrap.current) {
    cssWidth = wrap.current.clientWidth;
    cssHeight = wrap.current.clientHeight;
  }
  let min = 0;
  if (cssHeight && cssWidth) {
    if (cssHeight > cssWidth) min = cssWidth;
    else min = cssHeight;
  }

  if (canvas && canvas.current) {
    canvas.current.width = min;
    canvas.current.height = min;
    const ctx = canvas.current.getContext("2d");
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const scale = min / CANVAS_HEIGHT;
      ctx.scale(scale, scale);
    }
    if (ctx) draw(ctx, data);
  }
}

const background = {
  x: 0,
  y: 0,
  draw(context: CanvasRenderingContext2D) {
    context.beginPath();

    context.fillStyle = "white";
    context.fillRect(0, 0, CANVAS_WIDTH / 100, CANVAS_HEIGHT);
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT / 100);
    context.fillRect(
      CANVAS_WIDTH - CANVAS_WIDTH / 100,
      0,
      CANVAS_WIDTH / 100,
      CANVAS_HEIGHT
    );
    context.fillRect(
      0,
      CANVAS_HEIGHT - CANVAS_HEIGHT / 100,
      CANVAS_WIDTH,
      CANVAS_HEIGHT / 100
    );

    for (let y = 0; y <= CANVAS_HEIGHT; y += CANVAS_HEIGHT / 40) {
      context.fillRect(
        CANVAS_WIDTH / 2 - CANVAS_WIDTH / 200,
        y,
        CANVAS_WIDTH / 100,
        CANVAS_HEIGHT / 80
      );
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
      CANVAS_WIDTH / 50 + CANVAS_WIDTH / 100,
      CANVAS_HEIGHT / 50 +
        CANVAS_HEIGHT / 100 +
        ((CANVAS_HEIGHT / 5) * (100 - fillPlayer1)) / 100,
      CANVAS_WIDTH / 50,
      ((CANVAS_HEIGHT / 5) * fillPlayer1) / 100
    );

    context.fillRect(
      (48 * CANVAS_WIDTH) / 50 - CANVAS_WIDTH / 100,
      CANVAS_HEIGHT / 50 +
        CANVAS_HEIGHT / 100 +
        ((CANVAS_HEIGHT / 5) * (100 - fillPlayer2)) / 100,
      CANVAS_WIDTH / 50,
      ((CANVAS_HEIGHT / 5) * fillPlayer2) / 100
    );
  },
};

const names = {
  color: "white",
  draw(
    context: CanvasRenderingContext2D,
    player1Name: string,
    player2Name: string
  ) {
    context.fillStyle = this.color;
    context.font = "48px w95fa";
    context.textAlign = "center";
    context.fillText(
      `${player1Name.substring(0, 25)}${player1Name.length >= 25 ? "..." : ""}`,
      (CANVAS_WIDTH * 3) / 10,
      CANVAS_HEIGHT / 30,
      CANVAS_WIDTH / 5
    );
    context.fillText(
      `${player2Name.substring(0, 25)}${player2Name.length >= 25 ? "..." : ""}`,
      (CANVAS_WIDTH * 7) / 10,
      CANVAS_HEIGHT / 30,
      CANVAS_WIDTH / 5
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
    context.font = "150px w95fa";
    context.textAlign = "center";
    context.fillText(
      `${player1Score}`,
      (CANVAS_WIDTH * 3) / 10,
      CANVAS_HEIGHT / 10,
      CANVAS_WIDTH / 5
    );
    context.fillText(
      `${player2Score}`,
      (CANVAS_WIDTH * 7) / 10,
      CANVAS_HEIGHT / 10,
      CANVAS_WIDTH / 5
    );
  },
};

export const draw = (context: CanvasRenderingContext2D, data: GameData) => {
  context?.clearRect(background.x, background.y, CANVAS_WIDTH, CANVAS_HEIGHT);
  background.draw(context);
  names.draw(context, data.player1.name, data.player2.name);
  score.draw(context, data.player1.score, data.player2.score);
  leftPad.draw(context, data.player1.coord.y);
  rightPad.draw(context, data.player2.coord.y);
  if (data.game.type === "CLASSIC" || data.game.type === "GIFT")
    ball.draw(context, data.ball.coord.x, data.ball.coord.y);
  if (data.game.type === "BOOST") {
    const boostActivated =
      data.game.player1Boost.activated || data.game.player2Boost.activated;
    fireball.draw(context, data.ball.coord, data.ball.velocity, boostActivated);
    boostBar.draw(
      context,
      data.game.player1Boost.remaining,
      data.game.player2Boost.remaining
    );
  }
};

export const setY = (
  playerY: React.MutableRefObject<number>,
  moves: React.MutableRefObject<
    {
      event: number;
      timestamp: number;
      move: padMove;
      y: number;
      done: boolean;
    }[]
  >
) => {
  const len = moves.current.length;

  moves.current.forEach((val, i) => {
    if (!val.done) {
      if (val.move === padMove.UP) {
        if (i < len - 1) {
          const nextMove = moves.current[i + 1];
          if (nextMove)
            playerY.current -= Math.floor(
              PAD_SPEED * (nextMove.timestamp - val.timestamp)
            );
        } else {
          playerY.current -= Math.floor(
            PAD_SPEED * (new Date().getTime() - val.timestamp)
          );
        }
      } else if (val.move === padMove.DOWN) {
        if (i < len - 1) {
          const nextMove = moves.current[i + 1];
          if (nextMove)
            playerY.current += Math.floor(
              PAD_SPEED * (nextMove.timestamp - val.timestamp)
            );
        } else {
          playerY.current += Math.floor(
            PAD_SPEED * (new Date().getTime() - val.timestamp)
          );
        }
      }

      if (playerY.current > CANVAS_HEIGHT - PAD_HEIGHT) {
        playerY.current = CANVAS_HEIGHT - PAD_HEIGHT;
      } else if (playerY.current < 0) {
        playerY.current = 0;
      }

      if (val.move !== padMove.STILL && i === len - 1) {
        moves.current.splice(i + 1, 0, {
          event: len,
          timestamp: new Date().getTime(),
          move: val.move,
          y: playerY.current,
          done: false,
        });
      }
      val.y = playerY.current;
      val.done = true;
    }
  });
};

export const handleKeyDown = (
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
) => {
  if (keycode === "Space" && gameMode === GameMode.Boost) {
    socket.emit("boostActivated", gameId);
  }
  if (keycode === "ArrowUp") {
    keyboardStatus.current.arrowUp = true;
    if (!keyboardStatus.current.arrowDown) {
      if (playerMove.current !== padMove.UP) {
        const n = new Date().getTime();
        moves.current.push({
          event: moves.current.length,
          timestamp: n,
          move: padMove.UP,
          y: playerY.current,
          done: false,
        });
        setY(playerY, moves);

        playerMove.current = padMove.UP;
        socket.emit("movePadUp", { gameId: gameId, timestamp: n });
      }
    } else {
      if (playerMove.current !== padMove.STILL) {
        const n = new Date().getTime();
        moves.current.push({
          event: moves.current.length,
          timestamp: n,
          move: padMove.STILL,
          y: playerY.current,
          done: false,
        });
        setY(playerY, moves);
        playerMove.current = padMove.STILL;
        socket.emit("stopPad", { gameId: gameId, timestamp: n });
      }
    }
  }
  if (keycode === "ArrowDown") {
    keyboardStatus.current.arrowDown = true;
    if (!keyboardStatus.current.arrowUp) {
      if (playerMove.current !== padMove.DOWN) {
        const n = new Date().getTime();
        moves.current.push({
          event: moves.current.length,
          timestamp: n,
          move: padMove.DOWN,
          y: playerY.current,
          done: false,
        });
        setY(playerY, moves);
        playerMove.current = padMove.DOWN;
        socket.emit("movePadDown", { gameId: gameId, timestamp: n });
      }
    } else {
      if (playerMove.current !== padMove.STILL) {
        const n = new Date().getTime();
        moves.current.push({
          event: moves.current.length,
          timestamp: n,
          move: padMove.STILL,
          y: playerY.current,
          done: false,
        });
        setY(playerY, moves);
        playerMove.current = padMove.STILL;
        socket.emit("stopPad", { gameId: gameId, timestamp: n });
      }
    }
  }
};

export const handleKeyUp = (
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
) => {
  if (keycode === "ArrowUp") {
    keyboardStatus.current.arrowUp = false;
    if (!keyboardStatus.current.arrowDown) {
      if (playerMove.current !== padMove.STILL) {
        const n = new Date().getTime();
        moves.current.push({
          event: moves.current.length,
          timestamp: n,
          move: padMove.STILL,
          y: playerY.current,
          done: false,
        });
        setY(playerY, moves);
        playerMove.current = padMove.STILL;
        socket.emit("stopPad", { gameId: gameId, timestamp: n });
      }
    } else {
      if (playerMove.current !== padMove.DOWN) {
        const n = new Date().getTime();
        moves.current.push({
          event: moves.current.length,
          timestamp: n,
          move: padMove.DOWN,
          y: playerY.current,
          done: false,
        });
        setY(playerY, moves);
        playerMove.current = padMove.DOWN;
        socket.emit("movePadDown", { gameId: gameId, timestamp: n });
      }
    }
  }
  if (keycode === "ArrowDown") {
    keyboardStatus.current.arrowDown = false;
    if (!keyboardStatus.current.arrowUp) {
      if (playerMove.current !== padMove.STILL) {
        const n = new Date().getTime();
        moves.current.push({
          event: moves.current.length,
          timestamp: n,
          move: padMove.STILL,
          y: playerY.current,
          done: false,
        });
        setY(playerY, moves);
        playerMove.current = padMove.STILL;
        socket.emit("stopPad", { gameId: gameId, timestamp: n });
      }
    } else {
      if (playerMove.current !== padMove.UP) {
        const n = new Date().getTime();
        moves.current.push({
          event: moves.current.length,
          timestamp: n,
          move: padMove.UP,
          y: playerY.current,
          done: false,
        });
        setY(playerY, moves);
        playerMove.current = padMove.UP;
        socket.emit("movePadUp", { gameId: gameId, timestamp: n });
      }
    }
  }

  if (keycode === "Space" && gameMode === GameMode.Boost) {
    socket.emit("boostDeactivated", gameId);
  }
};
