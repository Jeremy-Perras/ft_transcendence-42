import { useRef, useEffect, useState } from "react";
const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 150;
const PAD_HEIGHT = 30;
const PAD_WIDTH = 5;
const BALL_RADIUS = 4;

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
  x: 20,
  // y: 30,
  width: PAD_WIDTH,
  height: PAD_HEIGHT,
  color: "white",
  draw(context: CanvasRenderingContext2D, yLeftPad: number) {
    context.fillStyle = this.color;
    context.beginPath();
    context.fillRect(this.x, yLeftPad, this.width, this.height);
    context.closePath();
    context.fill();
  },
};

const rightPad = {
  x: 275,
  y: 30,
  width: PAD_WIDTH,
  height: PAD_HEIGHT,
  color: "white",
  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = this.color;
    context.beginPath();
    context.fillRect(this.x, this.y, this.width, this.height);
    context.closePath();
    context.fill();
  },
};

const ball = {
  x: 150,
  y: 75,
  radius: BALL_RADIUS,
  color: "white",
  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
  },
};

const draw = (context: CanvasRenderingContext2D, yLeftPad: number) => {
  context?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  background.draw(context);
  leftPad.draw(context, yLeftPad);
  rightPad.draw(context);
  ball.draw(context);
};

const GameCanvas = ({
  draw,
}: {
  draw: (context: CanvasRenderingContext2D, yLeftPad: number) => void;
}) => {
  const canvas = useRef(null);
  if (!canvas) return <>Error</>;
  const [yLeftPad, setYLeftPad] = useState(30);
  useEffect(() => {
    const context = canvas.current.getContext("2d");
    draw(context, yLeftPad);
  }, [yLeftPad]);

  //TODO : add event listener only if player / block if watching

  addEventListener(
    "keydown",
    (e) => {
      console.log(yLeftPad);
      if (e.key === "ArrowUp") {
        setYLeftPad(yLeftPad - 5);
      }
      if (e.key === "ArrowDown") {
        setYLeftPad(yLeftPad + 5);
      }
    },
    { once: true }
  );

  return (
    <canvas
      className="w-full border-4  border-white"
      ref={canvas}
      id={"game"}
    />
  );
};

export const Game = () => {
  return <GameCanvas draw={draw} />;
};
