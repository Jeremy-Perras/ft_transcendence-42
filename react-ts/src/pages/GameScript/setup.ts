import BRICK_IMAGE from './img/brick.png';

const canvas: HTMLCanvasElement | null = document.querySelector('#playField');

// Constants
export const STAGE_PADDING = 10;
export const STAGE_ROWS = 20;
export const STAGE_COLS = 10;
export const BRICK_PADDING = 5;
export const BRICK_WIDTH = canvas
	? Math.floor((canvas.width - STAGE_PADDING * 2) / STAGE_COLS) - BRICK_PADDING
	: 100;
export const BRICK_HEIGHT = canvas
	? Math.floor((canvas.height - STAGE_PADDING * 2) / STAGE_ROWS) - BRICK_PADDING
	: 30;
export const PADDLE_WIDTH = 150;
export const PADDLE_HEIGHT = 25;
export const PADDLE_STARTX = 450;
export const PADDLE_SPEED = 10;
export const BALL_SPEED = 5;
export const BALL_SIZE = 20;
export const BALL_STARTX = 500;
export const BALL_STARTY = 400;

export const BRICK_IMAGES: { [key: number]: string } = {
	1: BRICK_IMAGE,
};

export const BRICK_ENERGY: { [key: number]: number } = {
	1: 1, // Red brick
};

// prettier-ignore
export const LEVEL = [
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 1, 1, 1, 1, 1, 1, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];