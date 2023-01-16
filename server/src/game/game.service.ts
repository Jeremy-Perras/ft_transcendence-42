import { Injectable } from "@nestjs/common";
import { GameMode } from "@prisma/client";
import { randomBytes } from "crypto";

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 150;
const PAD_HEIGHT = 30; //CANVAS / 5
const PAD_WIDTH = Math.ceil(PAD_HEIGHT / 5);
const BALL_RADIUS = 4;
let BALL_VELOCITY = 2;
//PADDLE SPEED : 1/4 V BALL

//TODO :  manage canvas size if necessary. back : front / 10
type Coord = {
  x: number;
  y: number;
};

type Player = {
  coord: Coord;
  id: number;
  score: number;
  playerState: PlayerState;
};

export enum PlayerState {
  UP,
  DOWN,
  STILL,
}

type GameData = {
  player1: Player;
  player2: Player;
  ball: { coord: Coord; velocity: { vx: number; vy: number } };
  gamemode: GameMode;
};

@Injectable()
export class GameService {
  public saveGameData = new Map<number, GameData>();
  InitialState(
    id: number,
    player1Id: number,
    player2Id: number,
    gameMode: GameMode
  ) {
    this.saveGameData.set(id, {
      player1: {
        id: player1Id,
        coord: { x: 20, y: 50 },
        score: 0,
        playerState: PlayerState.STILL,
      },
      player2: {
        id: player2Id,
        coord: { x: 280, y: 50 },
        score: 0,
        playerState: PlayerState.STILL,
      },
      ball: {
        coord: { x: 150, y: 75 },
        velocity: {
          vx: Math.random() - 0.5 < 0 ? BALL_VELOCITY : -BALL_VELOCITY,
          vy: 0,
        }, //TODO : check inital angle
      },
      gamemode: gameMode,
    });
    return this.saveGameData.get(id);
  }

  PlayerState(state: PlayerState, playerId: number, gameId: number) {
    const gameData = this.saveGameData.get(gameId);
    if (gameData) {
      switch (state) {
        case PlayerState.UP:
          if (playerId === this.saveGameData.get(gameId)?.player1.id) {
            if (gameData.player1.coord.y >= 1)
              gameData.player1.playerState = PlayerState.UP;
            else gameData.player1.playerState = PlayerState.STILL;
          } else if (playerId === this.saveGameData.get(gameId)?.player2.id) {
            if (gameData.player2.coord.y >= 1)
              gameData.player2.playerState = PlayerState.UP;
            else gameData.player2.playerState = PlayerState.STILL;
          }
          this.saveGameData.set(gameId, gameData);
          break;
        case PlayerState.DOWN:
          if (playerId === this.saveGameData.get(gameId)?.player1.id) {
            if (gameData.player1.coord.y <= CANVAS_HEIGHT - PAD_HEIGHT - 1)
              gameData.player1.playerState = PlayerState.DOWN;
            else gameData.player1.playerState = PlayerState.STILL;
          } else if (playerId === this.saveGameData.get(gameId)?.player2.id) {
            if (gameData.player2.coord.y <= CANVAS_HEIGHT - PAD_HEIGHT - 1)
              gameData.player2.playerState = PlayerState.DOWN;
            else gameData.player2.playerState = PlayerState.STILL;
          }
          this.saveGameData.set(gameId, gameData);
          break;
        default:
          if (playerId === this.saveGameData.get(gameId)?.player1.id)
            gameData.player1.playerState = PlayerState.STILL;
          else if (playerId === this.saveGameData.get(gameId)?.player2.id) {
            gameData.player2.playerState = PlayerState.STILL;
          }
          this.saveGameData.set(gameId, gameData);
          break;
      }
    }
  }

  MovePadUp(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);
    if (gameData !== undefined) {
      if (playerId === gameData.player1.id) {
        if (gameData.player1.coord.y >= 5) gameData.player1.coord.y -= 5;
      } else if (playerId === gameData.player2.id) {
        if (gameData.player2.coord.y >= 5) gameData.player2.coord.y -= 5;
      }
      this.saveGameData.set(gameId, gameData);
    }
  }

  MovePadDown(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);

    if (gameData !== undefined) {
      if (playerId === gameData.player1.id) {
        if (gameData.player1.coord.y <= CANVAS_HEIGHT - PAD_HEIGHT - 5)
          gameData.player1.coord.y += 5;

        console.log(gameData?.player1.coord.y);
      } else if (playerId === gameData.player2.id) {
        if (gameData.player2.coord.y <= CANVAS_HEIGHT - PAD_HEIGHT - 5)
          gameData.player2.coord.y += 5;
      }
      this.saveGameData.set(gameId, gameData);
    }
  }

  MoveBall(gameId: number) {
    const gameData = this.saveGameData.get(gameId);
    const checkWallCollision = (gameData: GameData): boolean => {
      if (
        gameData.ball.coord.y + gameData.ball.velocity.vy >
        CANVAS_HEIGHT - BALL_RADIUS
      ) {
        // gameData.ball.coord.x =
        //   gameData.ball.coord.x +
        //   gameData.ball.velocity.vx *
        //     Math.abs(
        //       (CANVAS_HEIGHT - BALL_RADIUS - gameData.ball.coord.y) /
        //         gameData.ball.velocity.vy
        //     );
        gameData.ball.coord.x += gameData.ball.velocity.vx;
        gameData.ball.coord.y =
          CANVAS_HEIGHT -
          BALL_RADIUS -
          (gameData.ball.velocity.vy -
            (CANVAS_HEIGHT - BALL_RADIUS - gameData.ball.coord.y));
        gameData.ball.velocity.vy = -gameData.ball.velocity.vy;

        this.saveGameData.set(gameId, gameData);
        return true;
      } else if (
        gameData.ball.coord.y + gameData.ball.velocity.vy <
        BALL_RADIUS
      ) {
        // gameData.ball.coord.x =
        //   gameData.ball.coord.x +
        //   gameData.ball.velocity.vx *
        //     Math.abs(
        //       (gameData.ball.coord.y - BALL_RADIUS) / gameData.ball.velocity.vy
        //     );
        gameData.ball.coord.x += gameData.ball.velocity.vx;
        // gameData.ball.coord.y = BALL_RADIUS; => move to front
        gameData.ball.coord.y =
          BALL_RADIUS +
          Math.abs(gameData.ball.velocity.vy) -
          (gameData.ball.coord.y - BALL_RADIUS);
        gameData.ball.velocity.vy = -gameData.ball.velocity.vy;
        this.saveGameData.set(gameId, gameData);
        return true;
      }
      // move all interm calc to front
      return false;
    };

    const leftPadCollision = (gameData: GameData): boolean => {
      if (
        gameData.ball.coord.x - BALL_RADIUS <=
          gameData.player1.coord.x + PAD_WIDTH &&
        gameData.ball.coord.x - BALL_RADIUS > gameData.player1.coord.x &&
        gameData.ball.coord.y > gameData.player1.coord.y &&
        gameData.ball.coord.y < gameData.player1.coord.y + PAD_HEIGHT
      ) {
        gameData.ball.coord;
        gameData.ball.coord.x =
          gameData.player1.coord.x + BALL_RADIUS + PAD_WIDTH;
        //set x and y
        const ratioPadPointCollision =
          (gameData.ball.coord.y - gameData.player1.coord.y - PAD_HEIGHT / 2) /
          (PAD_HEIGHT / 2);
        //TODO : adapt vx and vy depending on original pong game
        if (ratioPadPointCollision > -0.2 && ratioPadPointCollision < 0.2) {
          gameData.ball.velocity.vy = 0;
          gameData.ball.velocity.vx = BALL_VELOCITY;
        } else {
          //TO DO : adapt angle
          //increase speed by 2% each time ball hits paddle
          gameData.ball.velocity.vy = 4 * ratioPadPointCollision;
          gameData.ball.velocity.vx = -gameData.ball.velocity.vx;
        }
        this.saveGameData.set(gameId, gameData);
        return true;
        //ADD collision with angles
      }
      return false;
    };

    const rightPadCollision = (gameData: GameData): boolean => {
      if (
        gameData.ball.coord.x + BALL_RADIUS + gameData.ball.velocity.vx >=
          gameData.player2.coord.x &&
        gameData.ball.coord.x + BALL_RADIUS <
          gameData.player2.coord.x + PAD_WIDTH / 2 &&
        gameData.ball.coord.y > gameData.player2.coord.y &&
        gameData.ball.coord.y < gameData.player2.coord.y + PAD_HEIGHT
        //TODO :  see walls
      ) {
        gameData.ball.coord.x = gameData.player2.coord.x - BALL_RADIUS;
        //set y
        const ratioPadPointCollision =
          (gameData.ball.coord.y - gameData.player2.coord.y - PAD_HEIGHT / 2) /
          (PAD_HEIGHT / 2);
        if (ratioPadPointCollision > -0.2 && ratioPadPointCollision < 0.2) {
          gameData.ball.velocity.vy = 0;
          gameData.ball.velocity.vx = -BALL_VELOCITY;
        } else {
          //TODO : adapt vx and vy depending on original pong game
          gameData.ball.velocity.vy = 4 * ratioPadPointCollision;
          gameData.ball.velocity.vx = -gameData.ball.velocity.vx;
        }
        this.saveGameData.set(gameId, gameData);
        return true;
        //ADD collision with pad angles
      }
      return false;
    };

    if (gameData !== undefined) {
      if (checkWallCollision(gameData)) return; //OK
      if (gameData.ball.velocity.vx < 0) {
        //TODO
        if (leftPadCollision(gameData)) return;
      }
      if (gameData.ball.velocity.vx > 0) {
        //TODO
        if (rightPadCollision(gameData)) return;
      }

      //goal
      if (
        gameData.ball.coord.x + gameData.ball.velocity.vx >
        CANVAS_WIDTH + BALL_RADIUS
      ) {
        gameData.player2.score += 1;
        gameData.ball.coord.x = 150;
        gameData.ball.velocity.vx = -gameData.ball.velocity.vx; //launch ball to the other side at next try
        gameData.ball.velocity.vy = 0;
      } else if (
        gameData.ball.coord.x + gameData.ball.velocity.vx <
        -BALL_RADIUS
      ) {
        gameData.player1.score += 1;
        gameData.ball.coord.x = 150;
        gameData.ball.velocity.vx = -gameData.ball.velocity.vx; //launch ball to the other side at next try
        gameData.ball.velocity.vy = Math.random() * 5;
      } else {
        gameData.ball.coord.x += gameData.ball.velocity.vx;
        gameData.ball.coord.y += gameData.ball.velocity.vy;
      }
      this.saveGameData.set(gameId, gameData);
    }
  }
}
