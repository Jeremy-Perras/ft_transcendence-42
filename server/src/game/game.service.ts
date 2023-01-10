import { Injectable } from "@nestjs/common";
import { Game, GameMode } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SocketGateway } from "../socket/socket.gateway";
import { PlayerMachine } from "./player.machine";
import { waitFor } from "xstate/lib/waitFor";
import { OnEvent } from "@nestjs/event-emitter";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const PAD_HEIGHT = Math.ceil(CANVAS_HEIGHT / 10);
const PAD_WIDTH = Math.ceil(PAD_HEIGHT / 10);
const BALL_RADIUS = 4;
export const LEFT_PAD_X = CANVAS_WIDTH / 8;
export const RIGHT_PAD_X = CANVAS_WIDTH - CANVAS_WIDTH / 8 - PAD_WIDTH;
const BALL_VELOCITY = 10;
const PAD_VELOCITY = 5;

//TODO : send canvas h and w + ratios to front
//TODO : send to front only necessary info - remove x player, send pad size and speed, etc
export enum playerMove {
  UP,
  DOWN,
  STILL,
}

type Game = {
  id: number;
  score: {
    player1: number;
    player2: number;
  };
  players: {
    player1: number;
    player2: number;
  };
};

type ClassicGame = Game & {
  type: "CLASSIC";
};

type BoostGame = Game & {
  type: "BOOST";
  player1Boost: {
    remaining: number;
    activated: boolean;
  };
  player2Boost: {
    remaining: number;
    activated: boolean;
  };
};

type GiftGame = Game & {
  type: "GIFT";
  player1Gifts: {
    speed: number;
    size: number;
  };
  player2Gifts: {
    speed: number;
    size: number;
  };
};

type GameType = ClassicGame | BoostGame | GiftGame;

type Coord = {
  x: number;
  y: number;
};

type Player = {
  coord: Coord;
  playerMove: playerMove;
};

type GameData = {
  player1: Player;
  player2: Player;
  ball: { coord: Coord; velocity: { vx: number; vy: number } };
  game: GameType;
};

@Injectable()
export class GameService {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly prismaService: PrismaService
  ) {}
  public saveGameData = new Map<number, GameData>();
  InitialState(
    id: number,
    player1Id: number,
    player2Id: number,
    gameMode: GameMode
  ) {
    this.saveGameData.set(id, {
      player1: {
        coord: { x: LEFT_PAD_X, y: (CANVAS_HEIGHT - PAD_HEIGHT) / 2 },
        playerMove: playerMove.STILL,
      },
      player2: {
        coord: { x: RIGHT_PAD_X, y: (CANVAS_HEIGHT - PAD_HEIGHT) / 2 },

        playerMove: playerMove.STILL,
      },
      ball: {
        coord: {
          x: (CANVAS_WIDTH + 2 * BALL_RADIUS) / 2,
          y: (CANVAS_HEIGHT + 2 * BALL_RADIUS) / 2,
        },
        velocity: {
          vx: BALL_VELOCITY,
          vy: 0,
        },
      },
      game:
        gameMode === GameMode.CLASSIC
          ? {
              id: id,
              score: { player1: 0, player2: 0 },
              players: { player1: player1Id, player2: player2Id },
              type: "CLASSIC",
            }
          : gameMode === GameMode.SPEED
          ? {
              id: id,
              score: { player1: 0, player2: 0 },
              players: { player1: player1Id, player2: player2Id },
              type: "BOOST",
              player1Boost: { activated: false, remaining: 100 }, // percent
              player2Boost: { activated: false, remaining: 100 },
            }
          : {
              id: id,
              score: { player1: 0, player2: 0 },
              players: { player1: player1Id, player2: player2Id },
              type: "GIFT",
              player1Gifts: { size: 1, speed: 1 }, // ratio
              player2Gifts: { size: 1, speed: 1 },
            },
    });

    return this.saveGameData.get(id);
  }

  playerMove(state: playerMove, playerId: number, gameId: number) {
    const gameData = this.saveGameData.get(gameId);
    if (gameData) {
      switch (state) {
        case playerMove.UP:
          if (
            playerId === this.saveGameData.get(gameId)?.game.players.player1
          ) {
            if (gameData.player1.coord.y >= PAD_VELOCITY)
              gameData.player1.playerMove = playerMove.UP;
            else gameData.player1.playerMove = playerMove.STILL;
          } else if (
            playerId === this.saveGameData.get(gameId)?.game.players.player2
          ) {
            if (gameData.player2.coord.y >= PAD_VELOCITY)
              gameData.player2.playerMove = playerMove.UP;
            else gameData.player2.playerMove = playerMove.STILL;
          }
          this.saveGameData.set(gameId, gameData);
          break;
        case playerMove.DOWN:
          if (
            playerId === this.saveGameData.get(gameId)?.game.players.player1
          ) {
            if (
              gameData.player1.coord.y <=
              CANVAS_HEIGHT - PAD_HEIGHT - PAD_VELOCITY
            )
              gameData.player1.playerMove = playerMove.DOWN;
            else gameData.player1.playerMove = playerMove.STILL;
          } else if (
            playerId === this.saveGameData.get(gameId)?.game.players.player2
          ) {
            if (
              gameData.player2.coord.y <=
              CANVAS_HEIGHT - PAD_HEIGHT - PAD_VELOCITY
            )
              gameData.player2.playerMove = playerMove.DOWN;
            else gameData.player2.playerMove = playerMove.STILL;
          }
          this.saveGameData.set(gameId, gameData);
          break;
        default:
          if (playerId === this.saveGameData.get(gameId)?.game.players.player1)
            gameData.player1.playerMove = playerMove.STILL;
          else if (
            playerId === this.saveGameData.get(gameId)?.game.players.player2
          )
            gameData.player2.playerMove = playerMove.STILL;

          this.saveGameData.set(gameId, gameData);
          break;
      }
    }
  }

  MovePadUp(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);
    if (gameData !== undefined) {
      if (playerId === gameData.game.players.player1) {
        if (gameData.player1.coord.y >= PAD_VELOCITY)
          gameData.player1.coord.y -= PAD_VELOCITY;
      } else if (playerId === gameData.game.players.player2) {
        if (gameData.player2.coord.y >= PAD_VELOCITY)
          gameData.player2.coord.y -= PAD_VELOCITY;
      }
      this.saveGameData.set(gameId, gameData);
    }
  }

  MovePadDown(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);

    if (gameData !== undefined) {
      if (playerId === gameData.game.players.player1) {
        if (
          gameData.player1.coord.y <=
          CANVAS_HEIGHT - PAD_HEIGHT - PAD_VELOCITY
        )
          gameData.player1.coord.y += PAD_VELOCITY;
      } else if (playerId === gameData.game.players.player2) {
        if (
          gameData.player2.coord.y <=
          CANVAS_HEIGHT - PAD_HEIGHT - PAD_VELOCITY
        )
          gameData.player2.coord.y += PAD_VELOCITY;
      }
      this.saveGameData.set(gameId, gameData);
    }
  }

  handleBoostOn(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);
    if (gameData?.game.type !== "BOOST") return;
    if (gameData !== undefined) {
      if (playerId === gameData.game.players.player1) {
        if (
          gameData.game.player1Boost.remaining > 0 &&
          !gameData.game.player2Boost.activated
        ) {
          gameData.game.player1Boost.activated = true;
          gameData.game.player1Boost.remaining--;
          if (Math.abs(gameData.ball.velocity.vx) < 3 * BALL_VELOCITY) {
            gameData.ball.velocity.vx *= 1.05;
            gameData.ball.velocity.vy *= 1.05;
          }
        }
        if (gameData.game.player1Boost.remaining <= 0) {
          gameData.game.player1Boost.activated = false;
          gameData.ball.velocity.vy =
            gameData.ball.velocity.vy /
            Math.abs(gameData.ball.velocity.vx / BALL_VELOCITY);
          gameData.ball.velocity.vx =
            gameData.ball.velocity.vx > 0 ? BALL_VELOCITY : -BALL_VELOCITY;
        }
      } else if (playerId === gameData.game.players.player2) {
        if (
          gameData.game.player2Boost.remaining > 0 &&
          !gameData.game.player1Boost.activated
        ) {
          gameData.game.player2Boost.activated = true;
          gameData.game.player2Boost.remaining--;
          if (Math.abs(gameData.ball.velocity.vx) < 3 * BALL_VELOCITY) {
            gameData.ball.velocity.vx *= 1.05;
            gameData.ball.velocity.vy *= 1.05;
          }
        }
        if (gameData.game.player2Boost.remaining <= 0) {
          gameData.game.player2Boost.activated = false;
          gameData.ball.velocity.vy =
            gameData.ball.velocity.vy /
            Math.abs(gameData.ball.velocity.vx / BALL_VELOCITY);
          gameData.ball.velocity.vx =
            gameData.ball.velocity.vx > 0 ? BALL_VELOCITY : -BALL_VELOCITY;
        }
      }
      this.saveGameData.set(gameId, gameData);
    }
  }

  handleBoostOff(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);
    if (gameData?.game.type !== "BOOST") return;
    if (gameData !== undefined) {
      if (playerId === gameData.game.players.player1) {
        gameData.game.player1Boost.activated = false;
        gameData.ball.velocity.vy =
          gameData.ball.velocity.vy /
          Math.abs(gameData.ball.velocity.vx / BALL_VELOCITY);
        gameData.ball.velocity.vx =
          gameData.ball.velocity.vx > 0 ? BALL_VELOCITY : -BALL_VELOCITY;
      } else if (playerId === gameData.game.players.player2) {
        gameData.game.player2Boost.activated = false;
        gameData.ball.velocity.vy =
          gameData.ball.velocity.vy /
          Math.abs(gameData.ball.velocity.vx / BALL_VELOCITY);
        gameData.ball.velocity.vx =
          gameData.ball.velocity.vx > 0 ? BALL_VELOCITY : -BALL_VELOCITY;
      }
      this.saveGameData.set(gameId, gameData);
    }
  }

  MoveBall(gameId: number) {
    const gameData = this.saveGameData.get(gameId);

    const checkWallCollision = (gameData: GameData): boolean => {
      let wallCollision = false;
      if (
        gameData.ball.coord.y + gameData.ball.velocity.vy >
        CANVAS_HEIGHT - BALL_RADIUS
      ) {
        wallCollision = true;
        gameData.ball.coord.y =
          CANVAS_HEIGHT -
          BALL_RADIUS -
          (gameData.ball.velocity.vy -
            (CANVAS_HEIGHT - BALL_RADIUS - gameData.ball.coord.y));
      } else if (
        gameData.ball.coord.y + gameData.ball.velocity.vy <
        BALL_RADIUS
      ) {
        wallCollision = true;
        gameData.ball.coord.y =
          BALL_RADIUS +
          Math.abs(gameData.ball.velocity.vy) -
          (gameData.ball.coord.y - BALL_RADIUS);
      }
      if (wallCollision) {
        gameData.ball.coord.x += gameData.ball.velocity.vx;
        gameData.ball.velocity.vy = -gameData.ball.velocity.vy;
        this.saveGameData.set(gameId, gameData);
      }
      return wallCollision;
    };

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
          Math.abs(gameData.ball.velocity.vx)
      ) {
        const coeff =
          (gameData.ball.coord.x -
            BALL_RADIUS -
            (gameData.player1.coord.x + PAD_WIDTH)) /
          Math.abs(gameData.ball.velocity.vx);
        const yColl = gameData.ball.coord.y + gameData.ball.velocity.vy * coeff;
        if (
          yColl >= gameData.player1.coord.y &&
          yColl <= gameData.player1.coord.y + PAD_HEIGHT
        ) {
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

          let sinus = Math.sin(angle);
          if (Math.abs(sinus) < Number.EPSILON) sinus = 0;
          gameData.ball.velocity.vy = BALL_VELOCITY * 2 * sinus;
          gameData.ball.velocity.vx = -gameData.ball.velocity.vx;

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

        //upper corner
        if (
          yColl > gameData.player1.coord.y - BALL_RADIUS &&
          yColl < gameData.player1.coord.y
        ) {
          gameData.ball.velocity.vy =
            BALL_VELOCITY * 2 * Math.sin(-Math.PI / 4);
          gameData.ball.velocity.vx = -gameData.ball.velocity.vx;

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
          gameData.ball.velocity.vy = BALL_VELOCITY * 2 * Math.sin(Math.PI / 4);
          gameData.ball.velocity.vx = -gameData.ball.velocity.vx;

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

      //horizontal collision - inferior border
      if (
        gameData.ball.velocity.vy < 0 &&
        gameData.ball.coord.y - BALL_RADIUS >=
          gameData.player1.coord.y + PAD_HEIGHT &&
        gameData.ball.coord.y -
          BALL_RADIUS -
          (gameData.player1.coord.y + PAD_HEIGHT) <=
          Math.abs(gameData.ball.velocity.vy)
      ) {
        const coeff =
          (gameData.ball.coord.y -
            BALL_RADIUS -
            (gameData.player1.coord.y + PAD_HEIGHT)) /
          Math.abs(gameData.ball.velocity.vy);
        const xColl = gameData.ball.coord.x + gameData.ball.velocity.vx * coeff;
        if (
          xColl > gameData.player1.coord.x &&
          xColl <= gameData.player1.coord.x + PAD_WIDTH
        ) {
          gameData.ball.velocity.vy = -gameData.ball.velocity.vy;

          gameData.ball.coord.x += gameData.ball.velocity.vx;
          gameData.ball.coord.y =
            gameData.player1.coord.y +
            PAD_HEIGHT +
            BALL_RADIUS +
            (1 - coeff) * gameData.ball.velocity.vy;

          this.saveGameData.set(gameId, gameData);
          return true;
        }
      }

      //horizontal - superior border
      if (
        gameData.ball.velocity.vy > 0 &&
        gameData.ball.coord.y + BALL_RADIUS <= gameData.player1.coord.y &&
        gameData.player1.coord.y - (gameData.ball.coord.y + BALL_RADIUS) <=
          Math.abs(gameData.ball.velocity.vy)
      ) {
        const coeff =
          (gameData.player1.coord.y - (gameData.ball.coord.y + BALL_RADIUS)) /
          Math.abs(gameData.ball.velocity.vy);
        const xColl = gameData.ball.coord.x + gameData.ball.velocity.vx * coeff;

        if (
          xColl > gameData.player1.coord.x &&
          xColl <= gameData.player1.coord.x + PAD_WIDTH
        ) {
          gameData.ball.velocity.vy = -gameData.ball.velocity.vy;

          gameData.ball.coord.x += gameData.ball.velocity.vx;
          gameData.ball.coord.y =
            gameData.player1.coord.y -
            BALL_RADIUS +
            (1 - coeff) * gameData.ball.velocity.vy;

          this.saveGameData.set(gameId, gameData);
          return true;
        }
      }
      return false;
    };

    const rightPadCollision = (gameData: GameData): boolean => {
      //vertical collision
      if (
        gameData.player2.coord.x - (gameData.ball.coord.x + BALL_RADIUS) >= 0 &&
        gameData.player2.coord.x - (gameData.ball.coord.x + BALL_RADIUS) <=
          Math.abs(gameData.ball.velocity.vx)
      ) {
        const coeff =
          (gameData.player2.coord.x - (gameData.ball.coord.x + BALL_RADIUS)) /
          Math.abs(gameData.ball.velocity.vx);
        const yColl = gameData.ball.coord.y + gameData.ball.velocity.vy * coeff;

        //pad core collision
        if (
          yColl >= gameData.player2.coord.y &&
          yColl <= gameData.player2.coord.y + PAD_HEIGHT
        ) {
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
          let sinus = Math.sin(angle);
          if (Math.abs(sinus) < Number.EPSILON) sinus = 0;
          gameData.ball.velocity.vy = BALL_VELOCITY * 2 * sinus;
          gameData.ball.velocity.vx = -gameData.ball.velocity.vx;

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
          gameData.ball.velocity.vy =
            BALL_VELOCITY * 2 * Math.sin((5 * Math.PI) / 4);
          gameData.ball.velocity.vx = -gameData.ball.velocity.vx;

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
          gameData.ball.velocity.vy =
            BALL_VELOCITY * 2 * Math.sin((3 * Math.PI) / 4);
          gameData.ball.velocity.vx = -gameData.ball.velocity.vx;

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

      // horizontal collision - inferior border
      if (
        gameData.ball.velocity.vy < 0 &&
        gameData.ball.coord.y - BALL_RADIUS >=
          gameData.player2.coord.y + PAD_HEIGHT &&
        gameData.ball.coord.y -
          BALL_RADIUS -
          (gameData.player2.coord.y + PAD_HEIGHT) <=
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
        gameData.ball.coord.y + BALL_RADIUS <= gameData.player2.coord.y &&
        gameData.player2.coord.y - (gameData.ball.coord.y + BALL_RADIUS) <=
          Math.abs(gameData.ball.velocity.vy)
      ) {
        const coeff =
          (gameData.player2.coord.y - (gameData.ball.coord.y + BALL_RADIUS)) /
          Math.abs(gameData.ball.velocity.vy);
        const xColl = gameData.ball.coord.x + gameData.ball.velocity.vx * coeff;

        if (
          xColl > gameData.player2.coord.x &&
          xColl <= gameData.player2.coord.x + PAD_WIDTH
        ) {
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
      // OK
      let isScoring = false;
      if (
        gameData.ball.coord.x + gameData.ball.velocity.vx >
        CANVAS_WIDTH + BALL_RADIUS
      ) {
        gameData.game.score.player1 += 1;
        if (gameData.game.type === "BOOST") {
          if (gameData.game.player1Boost.remaining < 90)
            gameData.game.player1Boost.remaining += 10;
          else gameData.game.player1Boost.remaining = 100;
        }
        isScoring = true;
      } else if (
        gameData.ball.coord.x + gameData.ball.velocity.vx <
        -BALL_RADIUS
      ) {
        gameData.game.score.player2 += 1;
        if (gameData.game.type === "BOOST") {
          if (gameData.game.player2Boost.remaining < 90)
            gameData.game.player2Boost.remaining += 10;
          else gameData.game.player2Boost.remaining = 100;
        }
        isScoring = true;
      }
      if (isScoring) {
        const rand = Math.random();

        gameData.ball.coord.x = CANVAS_WIDTH / 2 + BALL_RADIUS;
        gameData.ball.coord.y =
          CANVAS_HEIGHT * rand * 0.8 + 0.1 * CANVAS_HEIGHT;

        gameData.ball.velocity.vx =
          gameData.ball.velocity.vx > 0 ? -BALL_VELOCITY : BALL_VELOCITY;
        gameData.ball.velocity.vy =
          rand <= 0.5 ? -BALL_VELOCITY * rand : BALL_VELOCITY * rand;
        this.saveGameData.set(gameId, gameData);
      }
      return isScoring;
    };

    if (gameData !== undefined) {
      //TODO : gift pop
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

  

  private players: Map<number, ReturnType<typeof PlayerMachine>> = new Map();
  private games: Map<number, Game> = new Map();
  private matchmakingRooms: Record<GameMode, Set<number>> = {
    CLASSIC: new Set(),
    RANDOM: new Set(),
    SPEED: new Set(),
  };

  @OnEvent("user.disconnection")
  disconnect(userId: number) {
    const player = this.players.get(userId);
    if (player) {
      player.send({ type: "DISCONNECT" });
    }
  }

  @OnEvent("user.connection")
  tryReconnect(userId: number) {
    const player = this.players.get(userId);
    if (player && player.getSnapshot().matches("disconnected")) {
      player.send({ type: "CONNECT" });
      waitFor(
        player,
        (state) => state.matches("disconnected") && state.matches("offline"),
        { timeout: 1000 }
      ).catch(() => {
        this.socketGateway.sendToUser(
          userId,
          "error",
          "Connection error, please refresh the page"
        );
        this.removePlayer(userId);
      });
    }
  }

  getMatchmakingRoom = (gameMode: GameMode) => this.matchmakingRooms[gameMode];

  isInMatchmaking = (userId: number) => {
    for (const mode in this.matchmakingRooms) {
      if (this.matchmakingRooms[mode as GameMode].has(userId))
        return mode as GameMode;
    }
    return null;
  };

  removeFromMatchmaking = (userId: number) => {
    for (const mode in this.matchmakingRooms) {
      this.matchmakingRooms[mode as GameMode].delete(userId);
    }
  };

  getPlayer = (userId: number) => {
    let player = this.players.get(userId);
    if (player) return player;
    else if (this.socketGateway.isOnline(userId)) {
      player = PlayerMachine(userId, this, this.socketGateway);
      this.players.set(userId, player);
      return player;
    }
    return null;
  };

  removePlayer = (userId: number) => {
    const player = this.players.get(userId);
    if (player) {
      player.stop();
      this.players.delete(userId);
    }
  };

  getGame = (userId: number) => {
    for (const game of this.games.values()) {
      if (game.player1Id === userId || game.player2Id === userId) {
        return game;
      }
    }
  };

  createGame = (gameMode: GameMode, player1Id: number, player2Id: number) =>
    new Promise<void>((resolve, reject) => {
      this.prismaService.game
        .create({
          data: {
            mode: gameMode,
            player1Id,
            player2Id,
          },
        })
        .then((game) => {
          this.games.set(game.id, game);
          resolve();
        })
        .catch(() => {
          reject();
        });
    });

  endGame = async (gameId: number) => {
    const game = this.games.get(gameId);

    if (game) {
      await this.prismaService.game.update({
        where: { id: gameId },
        data: {
          finishedAt: new Date(),
          player1Score: 0, // TODO
          player2Score: 0, // TODO
        },
      });

      const p1 = this.getPlayer(game.player1Id);
      const p2 = this.getPlayer(game.player2Id);

      if (p1) p1.send({ type: "GAME_ENDED" });
      if (p2) p2.send({ type: "GAME_ENDED" });

      this.games.delete(gameId);
    }
  };

  forfeitGame = async (userId: number) => {
    const game = this.getGame(userId);

    if (game) {
      const data = {
        finishedAt: new Date(),
        player1Score: 0,
        player2Score: 0,
      };

      switch (userId) {
        case game.player1Id:
          data.player1Score = -42;
          data.player2Score = 11;
          break;
        default:
          data.player1Score = 11;
          data.player2Score = -42;
          break;
      }

      await this.prismaService.game.update({
        where: { id: game.id },
        data,
      });

      const p1 = this.getPlayer(game.player1Id);
      const p2 = this.getPlayer(game.player2Id);

      if (p1) p1.send({ type: "GAME_ENDED" });
      if (p2) p2.send({ type: "GAME_ENDED" });

      this.games.delete(game.id);
    }
  };

  pauseGame = async (userId: number) => {
    const game = this.getGame(userId);

    if (game) {
      // TODO: send pause event to room
    }
  };
}
