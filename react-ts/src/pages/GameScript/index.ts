import { CanvasView } from "./view/CanvasView";
import { Ball } from "./sprites/Ball";
import { Brick } from "./sprites/Brick";
import { Paddle } from "./sprites/Paddle";

import PADDLE_IMAGE from "./img/paddle.png";
import BALL_IMAGE from "./img/ball.png";

import {
	PADDLE_SPEED,
	PADDLE_WIDTH,
	PADDLE_HEIGHT,
	PADDLE_STARTX,
	BALL_SPEED,
	BALL_SIZE,
	BALL_STARTX,
	BALL_STARTY
} from "./setup";

import { createBricks } from "./helpers"

let gameOver = false;
let score = 0;

function setGameOver(view: CanvasView) {
	view.drawInfo("Game Over!");
	gameOver = false;
}

function setGameWin(view: CanvasView) {
	view.drawInfo("Game Won!");
	gameOver = false;
}

function gameLoop(
	view: CanvasView,
	bricks: Brick[]
	// paddle: Paddle,
	// ball: Ball
) {
	view.clear();
	view.drawBricks(bricks);
	requestAnimationFrame(() => gameLoop(view, bricks));
}

function startGame(view: CanvasView) {
	console.log("STARTED GAME");
	score = 0;
	view.drawInfo('');
	view.drawScore(0);
	const bricks = createBricks();
	gameLoop(view, bricks);
}

const view = new CanvasView('#playField');
view.initStartButton(startGame);
