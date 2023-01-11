// import { useEffect, useRef } from "react";
let x = 10;
let y = 20;
import { sleep } from "@tanstack/query-core/build/lib/utils";
import React, { useRef, useEffect, useState } from "react";
import { useSocketStore } from "../stores";
type Player = { x: number; y: number };
type Ball = { x: number; y: number };
type GameData = { player1: Player; player2: Player; ball: Ball };
const infoPlayers1 = { x: 600, y: 200 };
const infoPlayers2 = { x: 0, y: 0 };
const infoBall = {
  x: (infoPlayers1.x + infoPlayers2.x) / 2,
  y: (infoPlayers1.y + infoPlayers2.y) / 2,
};
const infoStyle = {
  x: (infoPlayers1.x + infoPlayers2.x) / 2,
  y: 0,
};
export const Game = () => {
  const [drawing, setDrawing] = useState<KeyboardEvent>();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [seconds, setSeconds] = useState(0);
  const socket = useSocketStore().socket;
  const test = (e: KeyboardEvent) => {
    setDrawing(e);
    if (e.key === "w") infoPlayers1.y += 10;
    else {
      infoPlayers1.y -= 10;
    }
    console.log(x);
    console.log(e.key);
  };

  const Player1 = (ctx: CanvasRenderingContext2D) => {
    ctx.rect(infoPlayers1.x, infoPlayers1.y, 10, 75);
  };

  const Player2 = (ctx: CanvasRenderingContext2D) => {
    ctx.rect(infoPlayers2.x, infoPlayers2.y, 10, 75);
  };

  const Ball = (ctx: CanvasRenderingContext2D) => {
    ctx.arc(infoBall.x, infoBall.y, 10, 0, Math.PI * 2, true);
  };

  const Style = (ctx: CanvasRenderingContext2D) => {
    ctx.rect(infoStyle.x, infoStyle.y, 10, 20);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    Player1(ctx);
    Player2(ctx);
    Ball(ctx);
    ctx.fill();
    ctx.closePath;

    for (let index = 0; infoStyle.y < window.innerHeight * 2; index++) {
      ctx.beginPath();
      Style(ctx);
      ctx.fill();
      infoStyle.y += 30;
      ctx.closePath;
    }
    infoStyle.y = 0;
  };

  function drawBall(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }
  function drawBall_1(ctx) {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall(ctx);
    x += 10;
    y += 10;
  }
  useEffect(() => {
    const canvas = canvasRef.current;
    const timer = setTimeout(() => {
      setSeconds(Date.now());
    }, 1000);

    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
    draw(ctx);
    drawBall_1(ctx);
    return () => clearTimeout(timer);
  }, [drawing, seconds]);
  socket.on("initialState", (initial) => {
    console.log("init", initial);
  });
  return (
    <canvas
      tabIndex={0}
      ref={canvasRef}
      onKeyDown={test}
      className="h-screen w-screen bg-black"
    />
  );
};
