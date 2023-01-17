import { Injectable } from "@nestjs/common";
import { GameMode } from "@prisma/client";
import { randomBytes } from "crypto";

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 150;
const PAD_HEIGHT = 30; //CANVAS / 5
// const PAD_WIDTH = Math.ceil(PAD_HEIGHT / 5);
const PAD_WIDTH = 30;
const BALL_RADIUS = 4;
let BALL_VELOCITY = 4;
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
        coord: { x: 20, y: (CANVAS_HEIGHT - PAD_HEIGHT) / 2 },
        score: 0,
        playerState: PlayerState.STILL,
      },
      player2: {
        id: player2Id,
        coord: { x: 280, y: (CANVAS_HEIGHT - PAD_HEIGHT) / 2 },
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
            if (gameData.player1.coord.y >= 5)
              gameData.player1.playerState = PlayerState.UP;
            else gameData.player1.playerState = PlayerState.STILL;
          } else if (playerId === this.saveGameData.get(gameId)?.player2.id) {
            if (gameData.player2.coord.y >= 5)
              gameData.player2.playerState = PlayerState.UP;
            else gameData.player2.playerState = PlayerState.STILL;
          }
          this.saveGameData.set(gameId, gameData);
          break;
        case PlayerState.DOWN:
          if (playerId === this.saveGameData.get(gameId)?.player1.id) {
            if (gameData.player1.coord.y <= CANVAS_HEIGHT - PAD_HEIGHT - 5)
              gameData.player1.playerState = PlayerState.DOWN;
            else gameData.player1.playerState = PlayerState.STILL;
          } else if (playerId === this.saveGameData.get(gameId)?.player2.id) {
            if (gameData.player2.coord.y <= CANVAS_HEIGHT - PAD_HEIGHT - 5)
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
        gameData.ball.coord.x += gameData.ball.velocity.vx;
        gameData.ball.coord.y =
          BALL_RADIUS +
          Math.abs(gameData.ball.velocity.vy) -
          (gameData.ball.coord.y - BALL_RADIUS);
        gameData.ball.velocity.vy = -gameData.ball.velocity.vy;
        this.saveGameData.set(gameId, gameData);
        return true;
      }
      return false;
    };

    // TODO : move all interm calc to front
    // ex :gameData.ball.coord.x =
    //   gameData.ball.coord.x +
    //   gameData.ball.velocity.vx *
    //     Math.abs(
    //       (gameData.ball.coord.y - BALL_RADIUS) / gameData.ball.velocity.vy
    //     );

    const leftPadCollision = (gameData: GameData): boolean => {
      //VERTICAL COLLISION
      if (
        gameData.ball.coord.x -
          BALL_RADIUS -
          (gameData.player1.coord.x + PAD_WIDTH) >=
          0 &&
        gameData.ball.coord.x -
          BALL_RADIUS -
          (gameData.player1.coord.x + PAD_WIDTH) <=
          Math.abs(gameData.ball.velocity.vx) //pad x is between current coordinate and next
      ) {
        console.log("Ball crosses pad1 line");
        const coeff =
          (gameData.ball.coord.x -
            BALL_RADIUS -
            (gameData.player1.coord.x + PAD_WIDTH)) /
          Math.abs(gameData.ball.velocity.vx);
        const yColl = gameData.ball.coord.y + gameData.ball.velocity.vy * coeff;
        //PAD CORE COLLISIOM
        if (
          yColl >= gameData.player1.coord.y &&
          yColl <= gameData.player1.coord.y + PAD_HEIGHT
        ) {
          console.log("Pad1 - core collision");
          //collision
          const padCollisionRatio =
            (yColl - gameData.player1.coord.y - PAD_HEIGHT / 2) /
            (PAD_HEIGHT / 2);

          const angle =
            padCollisionRatio < -0.75
              ? -Math.PI / 4
              : padCollisionRatio < -0.5
              ? -Math.PI / 6
              : padCollisionRatio < -0.25
              ? -Math.PI / 12
              : padCollisionRatio <= 0.25
              ? 0
              : padCollisionRatio < 0.5
              ? Math.PI / 12
              : padCollisionRatio < 0.75
              ? Math.PI / 6
              : Math.PI / 4;

          //new velocity
          BALL_VELOCITY += 0.02 * BALL_VELOCITY; //increase velocity by 2% each pad collision
          gameData.ball.velocity.vy = BALL_VELOCITY * Math.sin(angle);
          gameData.ball.velocity.vx = BALL_VELOCITY * Math.cos(angle);

          //next coordinate
          gameData.ball.coord.x =
            gameData.player1.coord.x +
            PAD_WIDTH +
            BALL_RADIUS +
            (1 - coeff) * gameData.ball.velocity.vx;

          gameData.ball.coord.y =
            yColl + (1 - coeff) * gameData.ball.velocity.vy;

          this.saveGameData.set(gameId, gameData);

          return true;
        }

        //SIMPLE CORNER COLLISION : CHANGE TO OTHER FORMULA IF NOT SATISFYING
        //upper corner
        if (
          yColl > gameData.player1.coord.y - BALL_RADIUS &&
          yColl < gameData.player1.coord.y
        ) {
          console.log("Pad1 - upper corner collision");

          BALL_VELOCITY += 0.02 * BALL_VELOCITY; //increase velocity by 2% each pad collision
          gameData.ball.velocity.vy = BALL_VELOCITY * Math.sin(-Math.PI / 4);
          gameData.ball.velocity.vx = BALL_VELOCITY * Math.cos(-Math.PI / 4);

          //next coordinate
          gameData.ball.coord.x =
            gameData.player1.coord.x +
            PAD_WIDTH +
            BALL_RADIUS +
            (1 - coeff) * gameData.ball.velocity.vx;

          gameData.ball.coord.y =
            yColl + (1 - coeff) * gameData.ball.velocity.vy;

          this.saveGameData.set(gameId, gameData);
          return true;
        }
        //lower corner
        if (
          yColl > gameData.player1.coord.y + PAD_HEIGHT &&
          yColl < gameData.player1.coord.y + PAD_HEIGHT + BALL_RADIUS
        ) {
          console.log("Pad1 - lower corner collision");

          BALL_VELOCITY += 0.02 * BALL_VELOCITY; //increase velocity by 2% each pad collision
          gameData.ball.velocity.vy = BALL_VELOCITY * Math.sin(Math.PI / 4);
          gameData.ball.velocity.vx = BALL_VELOCITY * Math.cos(Math.PI / 4);

          //next coordinate
          gameData.ball.coord.x =
            gameData.player1.coord.x +
            PAD_WIDTH +
            BALL_RADIUS +
            (1 - coeff) * gameData.ball.velocity.vx;

          gameData.ball.coord.y =
            yColl + (1 - coeff) * gameData.ball.velocity.vy;

          this.saveGameData.set(gameId, gameData);
          return true;
        }
      }

      //horizontal collision
      return false;
    };

    const rightPadCollision = (gameData: GameData): boolean => {
      //vertical collision
      if (
        gameData.player2.coord.x - (gameData.ball.coord.x + BALL_RADIUS) >= 0 &&
        gameData.player2.coord.x - (gameData.ball.coord.x + BALL_RADIUS) <=
          Math.abs(gameData.ball.velocity.vx)
      ) {
        console.log("Ball crosses pad2 line");
        const coeff =
          (gameData.player2.coord.x - (gameData.ball.coord.x + BALL_RADIUS)) /
          Math.abs(gameData.ball.velocity.vx);

        const yColl = gameData.ball.coord.y + gameData.ball.velocity.vy * coeff;

        //pad core collision
        if (
          yColl >= gameData.player2.coord.y &&
          yColl <= gameData.player2.coord.y + PAD_HEIGHT
        ) {
          //collision
          console.log("2 - Core collision");
          const padCollisionRatio =
            (yColl - gameData.player2.coord.y - PAD_HEIGHT / 2) /
            (PAD_HEIGHT / 2);

          const angle =
            padCollisionRatio < -0.75
              ? (5 * Math.PI) / 4
              : padCollisionRatio < -0.5
              ? (7 * Math.PI) / 6
              : padCollisionRatio < -0.25
              ? (13 * Math.PI) / 12
              : padCollisionRatio <= 0.25
              ? Math.PI
              : padCollisionRatio < 0.5
              ? (11 * Math.PI) / 12
              : padCollisionRatio < 0.75
              ? (5 * Math.PI) / 6
              : (3 * Math.PI) / 4;

          //new velocity
          BALL_VELOCITY += 0.02 * BALL_VELOCITY; //increase velocity by 2% each pad collision
          gameData.ball.velocity.vy = BALL_VELOCITY * Math.sin(angle);
          gameData.ball.velocity.vx = BALL_VELOCITY * Math.cos(angle);

          //next coordinate
          gameData.ball.coord.x =
            gameData.player2.coord.x -
            BALL_RADIUS +
            (1 - coeff) * gameData.ball.velocity.vx;
          gameData.ball.coord.y =
            yColl + (1 - coeff) * gameData.ball.velocity.vy;

          this.saveGameData.set(gameId, gameData);
          return true;
        }
        if (
          yColl > gameData.player2.coord.y - BALL_RADIUS &&
          yColl < gameData.player2.coord.y
        ) {
          console.log("2 - Upper corner collision");
          //new velocity
          BALL_VELOCITY += 0.02 * BALL_VELOCITY; //increase velocity by 2% each pad collision
          gameData.ball.velocity.vy =
            BALL_VELOCITY * Math.sin((5 * Math.PI) / 4);
          gameData.ball.velocity.vx =
            BALL_VELOCITY * Math.cos((5 * Math.PI) / 4);

          //next coordinate
          gameData.ball.coord.x =
            gameData.player2.coord.x -
            BALL_RADIUS +
            (1 - coeff) * gameData.ball.velocity.vx;
          gameData.ball.coord.y =
            yColl + (1 - coeff) * gameData.ball.velocity.vy;

          this.saveGameData.set(gameId, gameData);
          return true;
        }
        if (
          yColl > gameData.player2.coord.y + PAD_HEIGHT &&
          yColl < gameData.player2.coord.y + PAD_HEIGHT - BALL_RADIUS
        ) {
          console.log("2 - Lower corner collision");
          //new velocity
          BALL_VELOCITY += 0.02 * BALL_VELOCITY; //increase velocity by 2% each pad collision
          gameData.ball.velocity.vy =
            BALL_VELOCITY * Math.sin((3 * Math.PI) / 4);
          gameData.ball.velocity.vx =
            BALL_VELOCITY * Math.cos((3 * Math.PI) / 4);

          //next coordinate
          gameData.ball.coord.x =
            gameData.player2.coord.x -
            BALL_RADIUS +
            (1 - coeff) * gameData.ball.velocity.vx;
          gameData.ball.coord.y =
            yColl + (1 - coeff) * gameData.ball.velocity.vy;

          this.saveGameData.set(gameId, gameData);
          return true;
        }
      }

      //TODO: horizontal collision - inferior border
      if (
        gameData.ball.velocity.vy < 0 &&
        gameData.ball.coord.y > gameData.player2.coord.y + PAD_HEIGHT &&
        gameData.ball.coord.y -
          BALL_RADIUS -
          (gameData.player2.coord.y + PAD_HEIGHT) <
          Math.abs(gameData.ball.velocity.vy)
      ) {
        const coeff =
          (gameData.ball.coord.y -
            BALL_RADIUS -
            (gameData.player2.coord.y + PAD_HEIGHT)) /
          Math.abs(gameData.ball.velocity.vy);
        const xColl = gameData.ball.coord.x + gameData.ball.velocity.vx * coeff;

        if (
          xColl > gameData.player2.coord.x &&
          xColl <= gameData.player2.coord.x + PAD_WIDTH
        ) {
          console.log("2 - Horizontal lower collision");

          gameData.ball.velocity.vy = -gameData.ball.velocity.vy;

          gameData.ball.coord.x += gameData.ball.velocity.vx;
          gameData.ball.coord.y =
            gameData.player2.coord.y +
            PAD_HEIGHT +
            BALL_RADIUS +
            (1 - coeff) * gameData.ball.velocity.vy;

          this.saveGameData.set(gameId, gameData);
          return true;
        }
      }
      //horizontal collision - superior border
      if (
        gameData.ball.velocity.vy > 0 &&
        gameData.ball.coord.y < gameData.player2.coord.y &&
        gameData.player2.coord.y - gameData.ball.coord.y + BALL_RADIUS <
          Math.abs(gameData.ball.velocity.vy)
      ) {
        const coeff =
          (gameData.player2.coord.y - gameData.ball.coord.y + BALL_RADIUS) /
          Math.abs(gameData.ball.velocity.vy);
        const xColl = gameData.ball.coord.x + gameData.ball.velocity.vx * coeff;

        if (
          xColl > gameData.player2.coord.x &&
          xColl <= gameData.player2.coord.x + PAD_WIDTH
        ) {
          console.log("2 - Horizontal upper collision");
          gameData.ball.velocity.vy = -gameData.ball.velocity.vy;

          gameData.ball.coord.x += gameData.ball.velocity.vx;
          gameData.ball.coord.y =
            gameData.player2.coord.y -
            BALL_RADIUS +
            (1 - coeff) * gameData.ball.velocity.vy;

          this.saveGameData.set(gameId, gameData);
          return true;
        }
      }

      return false;
    };

    const goal = (gameData: GameData): boolean => {
      if (
        gameData.ball.coord.x + gameData.ball.velocity.vx >
        CANVAS_WIDTH + BALL_RADIUS
      ) {
        gameData.player2.score += 1;
        gameData.ball.coord.x = 150;
        BALL_VELOCITY = 4; // TODO : replace with initial bv
        gameData.ball.velocity.vx = -BALL_VELOCITY;
        gameData.ball.velocity.vy = 0;
        this.saveGameData.set(gameId, gameData);

        return true;
      } else if (
        gameData.ball.coord.x + gameData.ball.velocity.vx <
        -BALL_RADIUS
      ) {
        gameData.player1.score += 1;
        gameData.ball.coord.x = 150;
        BALL_VELOCITY = 4; // TODO : replace with initial bv
        gameData.ball.velocity.vx = BALL_VELOCITY;
        gameData.ball.velocity.vy = 0;
        this.saveGameData.set(gameId, gameData);
        return true;
      }
      return false;
    };

    if (gameData !== undefined) {
      if (checkWallCollision(gameData)) return;
      if (gameData.ball.velocity.vx < 0) {
        if (leftPadCollision(gameData)) return;
      }
      if (gameData.ball.velocity.vx > 0) {
        if (rightPadCollision(gameData)) return;
      }
      if (goal(gameData)) return;

      gameData.ball.coord.x += gameData.ball.velocity.vx;
      gameData.ball.coord.y += gameData.ball.velocity.vy;
      this.saveGameData.set(gameId, gameData);
    }
  }
}
