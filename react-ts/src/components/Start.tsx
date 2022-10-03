import { CanvasView } from "../pages/GameScript/view/CanvasView";
import { Ball } from "../pages/GameScript/sprites/Ball";
import { Brick } from "../pages/GameScript/sprites/Brick";
import { Paddle } from "../pages/GameScript/sprites/Paddle";

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
} from "../pages/GameScript/setup";

import { createBricks } from "../pages/GameScript/helpers"

export default function Start() {
    function handleClick() {

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
        // 
        <script type="module" src="./GameScript/index.ts" />

    }
    return (
        <button onClick={handleClick}>Start Game!</button>);
};

