import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Achievement, Game, GameMode } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SocketGateway } from "../socket/socket.gateway";
import { PlayerMachine } from "./player.machine";
import { waitFor } from "xstate/lib/waitFor";
import { OnEvent } from "@nestjs/event-emitter";
import e from "express";

const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 2000;

const PAD_HEIGHT = Math.ceil(CANVAS_HEIGHT / 12);
const PAD_WIDTH = Math.ceil(PAD_HEIGHT / 5);
const BALL_RADIUS = CANVAS_WIDTH / 100;
const LEFT_PAD_X = CANVAS_WIDTH / 8;
const RIGHT_PAD_X = CANVAS_WIDTH - CANVAS_WIDTH / 8 - PAD_WIDTH;
const BALL_VELOCITY = 50;
const PAD_SPEED = 1; //px / ms
export const GIFT_SPEED = 1;
const BORDER_WIDTH = CANVAS_WIDTH / 100;
const BORDER_HEIGHT = CANVAS_HEIGHT / 100;
const GIFT_WIDTH = Math.floor(338 * 0.2);
const GIFT_HEIGHT = Math.floor(338 * 0.2);
export enum playerMove {
  UP,
  DOWN,
  STILL,
}

type GiftType =
  | {
      name: "SPEED_UP" | "SPEED_SLOW";
      speed: number;
    }
  | {
      name: "SIZE_UP" | "SIZE_DOWN";
      size: number;
    };
const gifts: GiftType[] = [
  {
    name: "SPEED_UP",
    speed: 1.2,
  },
  {
    name: "SPEED_SLOW",
    speed: 0.9,
  },
  {
    name: "SIZE_UP",
    size: 1.2,
  },
  {
    name: "SIZE_DOWN",
    size: 0.5,
  },
];

type ClassicGame = {
  type: "CLASSIC";
};

type BoostGame = {
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

type GiftGame = {
  type: "GIFT";
  Gift: Array<{ coord: Coord; gift: GiftType; side: 1 | -1 }>;
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
  id: number;
  coord: Coord;
  playerMove: playerMove;
  moves: Array<{
    event: number;
    timestamp: number;
    move: playerMove;
    done: boolean;
  }>;
  lastMoveTimestamp: number;
  score: number;
};

export type GameData = {
  id: number;
  startedAt: Date;
  player1: Player;
  player2: Player;
  ball: { coord: Coord; velocity: { vx: number; vy: number } };
  game: GameType;
};

@Injectable()
export class GameService {
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
    private readonly prismaService: PrismaService
  ) {}

  private players: Map<number, ReturnType<typeof PlayerMachine>> = new Map();
  public games: Map<number, GameData> = new Map();
  private matchmakingRooms: Record<GameMode, Set<number>> = {
    CLASSIC: new Set(),
    GIFT: new Set(),
    BOOST: new Set(),
  };

  initialState(
    id: number,
    startedAt: Date,
    player1Id: number,
    player2Id: number,
    gameMode: GameMode
  ): GameData {
    return {
      id: id,
      startedAt,
      player1: {
        id: player1Id,
        coord: { x: LEFT_PAD_X, y: (CANVAS_HEIGHT - PAD_HEIGHT) / 2 },
        playerMove: playerMove.STILL,
        moves: [],
        lastMoveTimestamp: 0,
        score: 0,
      },
      player2: {
        id: player2Id,
        coord: { x: RIGHT_PAD_X, y: (CANVAS_HEIGHT - PAD_HEIGHT) / 2 },
        playerMove: playerMove.STILL,
        moves: [],
        lastMoveTimestamp: 0,
        score: 0,
      },
      ball: {
        coord: {
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT / 2,
        },
        velocity: {
          vx: BALL_VELOCITY,
          vy: 0,
        },
      },

      game:
        gameMode === GameMode.CLASSIC
          ? {
              type: "CLASSIC",
            }
          : gameMode === GameMode.BOOST
          ? {
              type: "BOOST",
              player1Boost: { activated: false, remaining: 100 }, // percent
              player2Boost: { activated: false, remaining: 100 },
            }
          : {
              type: "GIFT",
              Gift: [],
              player1Gifts: { size: 1, speed: 1 }, // ratio
              player2Gifts: { size: 1, speed: 1 },
            },
    };
  }

  isInside(
    coordx: number,
    coordy: number,
    smallx: number,
    greatx: number,
    smally: number,
    greaty: number
  ) {
    if (
      coordx >= smallx &&
      coordx <= greatx &&
      coordy >= smally &&
      coordy <= greaty
    ) {
      return true;
    }
    return false;
  }

  giftInsidePlayer(
    gameData: GameData,
    e: {
      coord: Coord;
      gift: GiftType;
      side: 1 | -1;
    }
  ) {
    if (gameData.game.type === "GIFT") {
      if (
        e.side === -1 &&
        !this.isInside(
          e.coord.x,
          e.coord.y,
          gameData.player1.coord.x,
          gameData.player1.coord.x + PAD_WIDTH,
          gameData.player1.coord.y,
          gameData.player1.coord.y +
            PAD_HEIGHT * gameData.game.player1Gifts.size
        ) &&
        !this.isInside(
          e.coord.x - GIFT_WIDTH / 2,
          e.coord.y,
          gameData.player1.coord.x,
          gameData.player1.coord.x + PAD_WIDTH,
          gameData.player1.coord.y,
          gameData.player1.coord.y +
            PAD_HEIGHT * gameData.game.player1Gifts.size
        ) &&
        !this.isInside(
          e.coord.x + GIFT_WIDTH / 2,
          e.coord.y,
          gameData.player1.coord.x,
          gameData.player1.coord.x + PAD_WIDTH,
          gameData.player1.coord.y,
          gameData.player1.coord.y +
            PAD_HEIGHT * gameData.game.player1Gifts.size
        )
      ) {
        return true;
      } else if (
        e.side === 1 &&
        !this.isInside(
          e.coord.x,
          e.coord.y,
          gameData.player2.coord.x,
          gameData.player2.coord.x + PAD_WIDTH,
          gameData.player2.coord.y,
          gameData.player2.coord.y +
            PAD_HEIGHT * gameData.game.player1Gifts.size
        ) &&
        !this.isInside(
          e.coord.x - GIFT_WIDTH / 2,
          e.coord.y,
          gameData.player2.coord.x,
          gameData.player2.coord.x + PAD_WIDTH,
          gameData.player2.coord.y,
          gameData.player2.coord.y +
            PAD_HEIGHT * gameData.game.player1Gifts.size
        ) &&
        !this.isInside(
          e.coord.x + GIFT_WIDTH / 2,
          e.coord.y,
          gameData.player2.coord.x,
          gameData.player2.coord.x + PAD_WIDTH,
          gameData.player2.coord.y,
          gameData.player2.coord.y +
            PAD_HEIGHT * gameData.game.player1Gifts.size
        )
      ) {
        return true;
      }
      if (e.side === -1 && gameData.game.type === "GIFT") {
        if (e.gift.name === "SIZE_DOWN") {
          gameData.game.player1Gifts.size *= e.gift.size;
        } else if (e.gift.name === "SIZE_UP") {
          gameData.game.player1Gifts.size *= e.gift.size;
        } else if (e.gift.name === "SPEED_SLOW") {
          gameData.game.player1Gifts.speed *= e.gift.speed;
        } else if (e.gift.name === "SPEED_UP") {
          gameData.game.player1Gifts.speed *= e.gift.speed;
        }
      } else if (gameData.game.type === "GIFT") {
        if (e.gift.name === "SIZE_DOWN") {
          gameData.game.player2Gifts.size *= e.gift.size;
        } else if (e.gift.name === "SIZE_UP") {
          gameData.game.player2Gifts.size *= e.gift.size;
        } else if (e.gift.name === "SPEED_SLOW") {
          gameData.game.player2Gifts.speed *= e.gift.speed;
        } else if (e.gift.name === "SPEED_UP") {
          gameData.game.player2Gifts.speed *= e.gift.speed;
        }
      }
      return false;
    }
  }

  moveGift(gameId: number) {
    const gameData = this.games.get(gameId);
    const c = Math.random();

    if (c > 0.992 && gameData?.game.type === "GIFT") {
      gameData?.game.Gift.push({
        coord: {
          x: CANVAS_WIDTH / 2 + GIFT_WIDTH / 2,
          y:
            Math.floor(
              (CANVAS_HEIGHT - BORDER_HEIGHT - GIFT_HEIGHT) * Math.random()
            ) >=
            BORDER_HEIGHT + GIFT_HEIGHT
              ? Math.floor(
                  (CANVAS_HEIGHT - BORDER_HEIGHT - GIFT_HEIGHT) * Math.random()
                )
              : BORDER_HEIGHT + GIFT_HEIGHT,
        },
        gift: gifts[Math.floor(Math.random() * (gifts.length - 1))] as GiftType,
        side: Math.random() > 0.5 ? 1 : -1,
      });
    }

    if (gameData?.game.type === "GIFT") {
      gameData.game.Gift.forEach((e) => {
        e.coord.x += 20 * e.side;
      });

      const resultp1 = gameData.game.Gift.filter(
        (e) =>
          e.coord.x >= GIFT_WIDTH + BORDER_WIDTH &&
          e.coord.x <= CANVAS_WIDTH - GIFT_WIDTH - BORDER_WIDTH &&
          e.side === -1 &&
          this.giftInsidePlayer(gameData, e)
      );
      const resultp2 = gameData.game.Gift.filter(
        (e) =>
          e.coord.x >= GIFT_WIDTH + BORDER_WIDTH &&
          e.coord.x <= CANVAS_WIDTH - GIFT_WIDTH - BORDER_WIDTH &&
          e.side === 1 &&
          this.giftInsidePlayer(gameData, e)
      );
      console.log("1", gameData.game.player1Gifts.size);
      console.log("2", gameData.game.player2Gifts.size);
      gameData.game.Gift = resultp2.concat(resultp1);
    }
  }

  playerMove(
    state: playerMove,
    playerId: number,
    gameId: number,
    timestamp: number
  ) {
    const gameData = this.games.get(gameId);

    if (gameData) {
      if (playerId === this.games.get(gameId)?.player1.id) {
        gameData.player1.playerMove = state;
        gameData.player1.moves.push({
          event: gameData.player1.moves.length,
          move: state,
          timestamp: timestamp,
          done: false,
        });
      } else if (playerId === this.games.get(gameId)?.player2.id) {
        gameData.player2.playerMove = state;
        gameData.player2.moves.push({
          event: gameData.player2.moves.length,
          move: state,
          timestamp: timestamp,
          done: false,
        });
      }
      this.games.set(gameId, gameData);
    }
  }

  movePad(player: Player) {
    const len = player.moves.length;
    const newMoves: typeof player.moves = [];

    player.moves.forEach((val, i) => {
      if (!val.done) {
        if (val.move === playerMove.UP) {
          if (i < len - 1) {
            const nextMove = player.moves[i + 1];
            if (nextMove)
              player.coord.y -= Math.floor(
                PAD_SPEED * (nextMove.timestamp - val.timestamp)
              );
          } else {
            player.coord.y -= Math.floor(
              PAD_SPEED * (new Date().getTime() - val.timestamp)
            );
          }
        } else if (val.move === playerMove.DOWN) {
          if (i < len - 1) {
            const nextMove = player.moves[i + 1];
            if (nextMove)
              player.coord.y += Math.floor(
                PAD_SPEED * (nextMove.timestamp - val.timestamp)
              );
          } else {
            player.coord.y += Math.floor(
              PAD_SPEED * (new Date().getTime() - val.timestamp)
            );
          }
        }
        if (player.coord.y > CANVAS_HEIGHT - PAD_HEIGHT - BORDER_HEIGHT) {
          player.coord.y = CANVAS_HEIGHT - PAD_HEIGHT - BORDER_HEIGHT;
        } else if (player.coord.y < BORDER_HEIGHT) {
          player.coord.y = BORDER_HEIGHT;
        }
        if (i === len - 1) player.lastMoveTimestamp = val.timestamp;
        if (val.move !== playerMove.STILL && i === len - 1) {
          newMoves.push({
            event: i + 1,
            timestamp: new Date().getTime(),
            move: val.move,
            done: false,
          });
        }
        val.done = true;
      }
    });
    player.moves = newMoves;
  }

  movePadGift(
    player: Player,
    playerGifts: {
      speed: number;
      size: number;
    }
  ) {
    const len = player.moves.length;
    const newMoves: typeof player.moves = [];

    player.moves.forEach((val, i) => {
      if (!val.done) {
        if (val.move === playerMove.UP) {
          if (i < len - 1) {
            const nextMove = player.moves[i + 1];
            if (nextMove)
              player.coord.y -= Math.floor(
                PAD_SPEED *
                  playerGifts.speed *
                  (nextMove.timestamp - val.timestamp)
              );
          } else {
            player.coord.y -= Math.floor(
              PAD_SPEED *
                playerGifts.speed *
                (new Date().getTime() - val.timestamp)
            );
          }
        } else if (val.move === playerMove.DOWN) {
          if (i < len - 1) {
            const nextMove = player.moves[i + 1];
            if (nextMove)
              player.coord.y += Math.floor(
                PAD_SPEED *
                  playerGifts.speed *
                  (nextMove.timestamp - val.timestamp)
              );
          } else {
            player.coord.y += Math.floor(
              PAD_SPEED *
                playerGifts.speed *
                (new Date().getTime() - val.timestamp)
            );
          }
        }
        if (
          player.coord.y >
          CANVAS_HEIGHT - PAD_HEIGHT * playerGifts.size - BORDER_HEIGHT
        ) {
          player.coord.y =
            CANVAS_HEIGHT - PAD_HEIGHT * playerGifts.size - BORDER_HEIGHT;
        } else if (player.coord.y < BORDER_HEIGHT) {
          player.coord.y = BORDER_HEIGHT;
        }
        if (i === len - 1) player.lastMoveTimestamp = val.timestamp;
        if (val.move !== playerMove.STILL && i === len - 1) {
          newMoves.push({
            event: i + 1,
            timestamp: new Date().getTime(),
            move: val.move,
            done: false,
          });
        }
        val.done = true;
      }
    });
    player.moves = newMoves;
  }

  movePads(gameId: number) {
    const gameData = this.games.get(gameId);

    if (gameData && gameData.game.type != "GIFT") {
      this.movePad(gameData.player1);

      this.movePad(gameData.player2);
    } else if (gameData && gameData.game.type === "GIFT") {
      this.movePadGift(gameData.player1, gameData.game.player1Gifts);
      this.movePadGift(gameData.player2, gameData.game.player2Gifts);
    }
  }

  handleBoostOn(gameId: number, playerId: number) {
    const gameData = this.games.get(gameId);
    if (gameData?.game.type !== "BOOST") return;
    if (gameData !== undefined) {
      if (playerId === gameData.player1.id) {
        if (
          gameData.game.player1Boost.remaining > 0 &&
          !gameData.game.player2Boost.activated
        ) {
          gameData.game.player1Boost.activated = true;
          gameData.game.player1Boost.remaining--;
          if (Math.abs(gameData.ball.velocity.vx) < 2 * BALL_VELOCITY) {
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
      } else if (playerId === gameData.player2.id) {
        if (
          gameData.game.player2Boost.remaining > 0 &&
          !gameData.game.player1Boost.activated
        ) {
          gameData.game.player2Boost.activated = true;
          gameData.game.player2Boost.remaining--;
          if (Math.abs(gameData.ball.velocity.vx) < 2 * BALL_VELOCITY) {
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
      this.games.set(gameId, gameData);
    }
  }

  handleBoostOff(gameId: number, playerId: number) {
    const gameData = this.games.get(gameId);
    if (gameData?.game.type !== "BOOST") return;
    if (gameData !== undefined) {
      if (playerId === gameData.player1.id) {
        gameData.game.player1Boost.activated = false;
      } else if (playerId === gameData.player2.id) {
        gameData.game.player2Boost.activated = false;
      }
      gameData.ball.velocity.vy =
        gameData.ball.velocity.vy /
        Math.abs(gameData.ball.velocity.vx / BALL_VELOCITY);
      gameData.ball.velocity.vx =
        gameData.ball.velocity.vx > 0 ? BALL_VELOCITY : -BALL_VELOCITY;
      this.games.set(gameId, gameData);
    }
  }

  moveBall(gameId: number) {
    const gameData = this.games.get(gameId);

    const checkWallCollision = (gameData: GameData): boolean => {
      let wallCollision = false;
      if (
        gameData.ball.coord.y + gameData.ball.velocity.vy >
        CANVAS_HEIGHT - BALL_RADIUS - BORDER_HEIGHT
      ) {
        wallCollision = true;

        gameData.ball.coord.y =
          CANVAS_HEIGHT -
          BALL_RADIUS -
          BORDER_HEIGHT -
          (gameData.ball.velocity.vy -
            (CANVAS_HEIGHT -
              BALL_RADIUS -
              BORDER_HEIGHT -
              gameData.ball.coord.y));
      } else if (
        gameData.ball.coord.y + gameData.ball.velocity.vy <
        BALL_RADIUS + BORDER_HEIGHT
      ) {
        wallCollision = true;

        gameData.ball.coord.y =
          BALL_RADIUS +
          BORDER_HEIGHT +
          Math.abs(gameData.ball.velocity.vy) -
          (gameData.ball.coord.y - BALL_RADIUS);
      }
      if (wallCollision) {
        gameData.ball.coord.x += gameData.ball.velocity.vx;
        gameData.ball.velocity.vy = -gameData.ball.velocity.vy;
        this.games.set(gameId, gameData);
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

          let angle;
          if (padCollisionRatio < -0.75) angle = -Math.PI / 4;
          else if (padCollisionRatio < -0.5) angle = -Math.PI / 6;
          else if (padCollisionRatio < -0.25) angle = -Math.PI / 12;
          else if (padCollisionRatio < 0.25) angle = 0;
          else if (padCollisionRatio < 0.5) angle = Math.PI / 12;
          else if (padCollisionRatio < 0.75) angle = Math.PI / 6;
          else angle = Math.PI / 4;

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

          this.games.set(gameId, gameData);
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

          this.games.set(gameId, gameData);
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

          this.games.set(gameId, gameData);
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

          this.games.set(gameId, gameData);
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

          this.games.set(gameId, gameData);
          return true;
        }
      }
      return false;
    };

    const rightPadCollision = (gameData: GameData): boolean => {
      //vertical collision
      if (
        gameData.player2.coord.x - (gameData.ball.coord.x + BALL_RADIUS) >= 0 &&
        gameData.ball.coord.x +
          BALL_RADIUS +
          Math.abs(gameData.ball.velocity.vx) >=
          gameData.player2.coord.x
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

          let angle;
          if (padCollisionRatio < -0.75) angle = (5 * Math.PI) / 4;
          else if (padCollisionRatio < -0.5) angle = (7 * Math.PI) / 6;
          else if (padCollisionRatio < -0.25) angle = (13 * Math.PI) / 12;
          else if (padCollisionRatio < 0.25) angle = Math.PI;
          else if (padCollisionRatio < 0.5) angle = (11 * Math.PI) / 12;
          else if (padCollisionRatio < 0.75) angle = (5 * Math.PI) / 6;
          else angle = (3 * Math.PI) / 4;

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

          this.games.set(gameId, gameData);
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

          this.games.set(gameId, gameData);
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

          this.games.set(gameId, gameData);
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

          this.games.set(gameId, gameData);
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

          this.games.set(gameId, gameData);
          return true;
        }
      }

      return false;
    };

    const goal = (gameData: GameData): boolean => {
      // OK
      let isScoring = false;
      if (
        gameData.ball.coord.x + gameData.ball.velocity.vx >=
        CANVAS_WIDTH - BALL_RADIUS - BORDER_WIDTH
      ) {
        gameData.player1.score += 1;
        if (gameData.player1.score === 11) {
          this.endGame(gameId);
        }
        if (gameData.game.type === "BOOST") {
          if (gameData.game.player1Boost.remaining < 90)
            gameData.game.player1Boost.remaining += 10;
          else gameData.game.player1Boost.remaining = 100;
        }
        isScoring = true;
      } else if (
        gameData.ball.coord.x + gameData.ball.velocity.vx <=
        BALL_RADIUS + BORDER_WIDTH
      ) {
        gameData.player2.score += 1;
        if (gameData.player2.score === 11) {
          this.endGame(gameId);
        }
        if (gameData.game.type === "BOOST") {
          if (gameData.game.player2Boost.remaining < 95)
            gameData.game.player2Boost.remaining += 5;
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
          gameData.ball.velocity.vx > 0 ? BALL_VELOCITY : -BALL_VELOCITY;
        gameData.ball.velocity.vy =
          rand <= 0.5 ? -BALL_VELOCITY * rand : BALL_VELOCITY * rand;
        this.games.set(gameId, gameData);
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
      this.games.set(gameId, gameData);
    }
  }

  moveBallGift(gameId: number) {
    const gameData = this.games.get(gameId);
    if (gameData?.game.type === "GIFT") {
      const checkWallCollision = (gameData: GameData): boolean => {
        let wallCollision = false;
        if (gameData?.game.type === "GIFT") {
          if (
            gameData.ball.coord.y + gameData.ball.velocity.vy >
            CANVAS_HEIGHT - BALL_RADIUS - BORDER_HEIGHT
          ) {
            wallCollision = true;

            gameData.ball.coord.y =
              CANVAS_HEIGHT -
              BALL_RADIUS -
              BORDER_HEIGHT -
              (gameData.ball.velocity.vy -
                (CANVAS_HEIGHT -
                  BALL_RADIUS -
                  BORDER_HEIGHT -
                  gameData.ball.coord.y));
          } else if (
            gameData.ball.coord.y + gameData.ball.velocity.vy <
            BALL_RADIUS + BORDER_HEIGHT
          ) {
            wallCollision = true;

            gameData.ball.coord.y =
              BALL_RADIUS +
              BORDER_HEIGHT +
              Math.abs(gameData.ball.velocity.vy) -
              (gameData.ball.coord.y - BALL_RADIUS);
          }
          if (wallCollision) {
            gameData.ball.coord.x += gameData.ball.velocity.vx;
            gameData.ball.velocity.vy = -gameData.ball.velocity.vy;
            this.games.set(gameId, gameData);
          }
        }
        return wallCollision;
      };

      const leftPadCollision = (gameData: GameData): boolean => {
        //VERTICAL COLLISION
        if (gameData.game.type === "GIFT") {
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
            const yColl =
              gameData.ball.coord.y + gameData.ball.velocity.vy * coeff;
            if (
              gameData.game.type === "GIFT" &&
              yColl >= gameData.player1.coord.y &&
              yColl <=
                gameData.player1.coord.y +
                  PAD_HEIGHT * gameData.game.player1Gifts.size
            ) {
              //collision
              const padCollisionRatio =
                (yColl -
                  gameData.player1.coord.y -
                  (gameData.game.player1Gifts.size * PAD_HEIGHT) / 2) /
                ((PAD_HEIGHT * gameData.game.player1Gifts.size) / 2);

              let angle;
              if (padCollisionRatio < -0.75) angle = -Math.PI / 4;
              else if (padCollisionRatio < -0.5) angle = -Math.PI / 6;
              else if (padCollisionRatio < -0.25) angle = -Math.PI / 12;
              else if (padCollisionRatio < 0.25) angle = 0;
              else if (padCollisionRatio < 0.5) angle = Math.PI / 12;
              else if (padCollisionRatio < 0.75) angle = Math.PI / 6;
              else angle = Math.PI / 4;

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

              this.games.set(gameId, gameData);
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

              this.games.set(gameId, gameData);
              return true;
            }

            //lower corner
            if (
              yColl >
                gameData.player1.coord.y +
                  PAD_HEIGHT * gameData.game.player1Gifts.size &&
              yColl <
                gameData.player1.coord.y +
                  PAD_HEIGHT * gameData.game.player1Gifts.size +
                  BALL_RADIUS
            ) {
              gameData.ball.velocity.vy =
                BALL_VELOCITY * 2 * Math.sin(Math.PI / 4);
              gameData.ball.velocity.vx = -gameData.ball.velocity.vx;

              gameData.ball.coord.x =
                gameData.player1.coord.x +
                PAD_WIDTH +
                BALL_RADIUS +
                (1 - coeff) * gameData.ball.velocity.vx;
              gameData.ball.coord.y =
                yColl + (1 - coeff) * gameData.ball.velocity.vy;

              this.games.set(gameId, gameData);
              return true;
            }
          }

          //horizontal collision - inferior border
          if (
            gameData.ball.velocity.vy < 0 &&
            gameData.ball.coord.y - BALL_RADIUS >=
              gameData.player1.coord.y +
                PAD_HEIGHT * gameData.game.player1Gifts.size &&
            gameData.ball.coord.y -
              BALL_RADIUS -
              (gameData.player1.coord.y +
                PAD_HEIGHT * gameData.game.player1Gifts.size) <=
              Math.abs(gameData.ball.velocity.vy)
          ) {
            const coeff =
              (gameData.ball.coord.y -
                BALL_RADIUS -
                (gameData.player1.coord.y +
                  PAD_HEIGHT * gameData.game.player1Gifts.size)) /
              Math.abs(gameData.ball.velocity.vy);
            const xColl =
              gameData.ball.coord.x + gameData.ball.velocity.vx * coeff;
            if (
              xColl > gameData.player1.coord.x &&
              xColl <= gameData.player1.coord.x + PAD_WIDTH
            ) {
              gameData.ball.velocity.vy = -gameData.ball.velocity.vy;

              gameData.ball.coord.x += gameData.ball.velocity.vx;
              gameData.ball.coord.y =
                gameData.player1.coord.y +
                PAD_HEIGHT * gameData.game.player1Gifts.size +
                BALL_RADIUS +
                (1 - coeff) * gameData.ball.velocity.vy;

              this.games.set(gameId, gameData);
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
              (gameData.player1.coord.y -
                (gameData.ball.coord.y + BALL_RADIUS)) /
              Math.abs(gameData.ball.velocity.vy);
            const xColl =
              gameData.ball.coord.x + gameData.ball.velocity.vx * coeff;

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

              this.games.set(gameId, gameData);
              return true;
            }
          }
        }
        return false;
      };

      const rightPadCollision = (gameData: GameData): boolean => {
        //vertical collision
        if (gameData.game.type === "GIFT") {
          if (
            gameData.player2.coord.x - (gameData.ball.coord.x + BALL_RADIUS) >=
              0 &&
            gameData.ball.coord.x +
              BALL_RADIUS +
              Math.abs(gameData.ball.velocity.vx) >=
              gameData.player2.coord.x
          ) {
            const coeff =
              (gameData.player2.coord.x -
                (gameData.ball.coord.x + BALL_RADIUS)) /
              Math.abs(gameData.ball.velocity.vx);
            const yColl =
              gameData.ball.coord.y + gameData.ball.velocity.vy * coeff;

            //pad core collision
            if (
              yColl >= gameData.player2.coord.y &&
              yColl <=
                gameData.player2.coord.y +
                  PAD_HEIGHT * gameData.game.player2Gifts.size
            ) {
              const padCollisionRatio =
                (yColl -
                  gameData.player2.coord.y -
                  (PAD_HEIGHT * gameData.game.player2Gifts.size) / 2) /
                ((PAD_HEIGHT * gameData.game.player2Gifts.size) / 2);

              let angle;
              if (padCollisionRatio < -0.75) angle = (5 * Math.PI) / 4;
              else if (padCollisionRatio < -0.5) angle = (7 * Math.PI) / 6;
              else if (padCollisionRatio < -0.25) angle = (13 * Math.PI) / 12;
              else if (padCollisionRatio < 0.25) angle = Math.PI;
              else if (padCollisionRatio < 0.5) angle = (11 * Math.PI) / 12;
              else if (padCollisionRatio < 0.75) angle = (5 * Math.PI) / 6;
              else angle = (3 * Math.PI) / 4;

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

              this.games.set(gameId, gameData);
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

              this.games.set(gameId, gameData);
              return true;
            }
            if (
              yColl >
                gameData.player2.coord.y +
                  PAD_HEIGHT * gameData.game.player2Gifts.size &&
              yColl <
                gameData.player2.coord.y +
                  PAD_HEIGHT * gameData.game.player2Gifts.size -
                  BALL_RADIUS
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

              this.games.set(gameId, gameData);
              return true;
            }
          }

          // horizontal collision - inferior border
          if (
            gameData.ball.velocity.vy < 0 &&
            gameData.ball.coord.y - BALL_RADIUS >=
              gameData.player2.coord.y +
                PAD_HEIGHT * gameData.game.player2Gifts.size &&
            gameData.ball.coord.y -
              BALL_RADIUS -
              (gameData.player2.coord.y +
                PAD_HEIGHT * gameData.game.player2Gifts.size) <=
              Math.abs(gameData.ball.velocity.vy)
          ) {
            const coeff =
              (gameData.ball.coord.y -
                BALL_RADIUS -
                (gameData.player2.coord.y +
                  PAD_HEIGHT * gameData.game.player2Gifts.size)) /
              Math.abs(gameData.ball.velocity.vy);
            const xColl =
              gameData.ball.coord.x + gameData.ball.velocity.vx * coeff;

            if (
              xColl > gameData.player2.coord.x &&
              xColl <= gameData.player2.coord.x + PAD_WIDTH
            ) {
              gameData.ball.velocity.vy = -gameData.ball.velocity.vy;

              gameData.ball.coord.x += gameData.ball.velocity.vx;
              gameData.ball.coord.y =
                gameData.player2.coord.y +
                PAD_HEIGHT * gameData.game.player2Gifts.size +
                BALL_RADIUS +
                (1 - coeff) * gameData.ball.velocity.vy;

              this.games.set(gameId, gameData);
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
              (gameData.player2.coord.y -
                (gameData.ball.coord.y + BALL_RADIUS)) /
              Math.abs(gameData.ball.velocity.vy);
            const xColl =
              gameData.ball.coord.x + gameData.ball.velocity.vx * coeff;

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

              this.games.set(gameId, gameData);
              return true;
            }
          }
        }
        return false;
      };

      const goal = (gameData: GameData): boolean => {
        // OK
        let isScoring = false;
        if (gameData.game.type === "GIFT") {
          if (
            gameData.ball.coord.x + gameData.ball.velocity.vx >=
            CANVAS_WIDTH - BALL_RADIUS - BORDER_WIDTH
          ) {
            gameData.player1.score += 1;
            if (gameData.player1.score === 11) {
              this.endGame(gameId);
            }

            isScoring = true;
          } else if (
            gameData.ball.coord.x + gameData.ball.velocity.vx <=
            BALL_RADIUS + BORDER_WIDTH
          ) {
            gameData.player2.score += 1;
            if (gameData.player2.score === 11) {
              this.endGame(gameId);
            }

            isScoring = true;
          }
          if (isScoring) {
            const rand = Math.random();

            gameData.ball.coord.x = CANVAS_WIDTH / 2 + BALL_RADIUS;
            gameData.ball.coord.y =
              CANVAS_HEIGHT * rand * 0.8 + 0.1 * CANVAS_HEIGHT;

            gameData.ball.velocity.vx =
              gameData.ball.velocity.vx > 0 ? BALL_VELOCITY : -BALL_VELOCITY;
            gameData.ball.velocity.vy =
              rand <= 0.5 ? -BALL_VELOCITY * rand : BALL_VELOCITY * rand;
            this.games.set(gameId, gameData);
          }
        }
        return isScoring;
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
        this.games.set(gameId, gameData);
      }
    }
  }

  @OnEvent("user.disconnect")
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
      if (game.player1.id === userId || game.player2.id === userId) {
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
          this.games.set(
            game.id,
            this.initialState(
              game.id,
              game.startedAt,
              game.player1Id,
              game.player2Id,
              game.mode
            )
          );
          this.socketGateway.launchGame(game.id);
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
          player1Score: game.player1.score,
          player2Score: game.player2.score,
        },
      });

      const p1 = this.getPlayer(game.player1.id);
      const p2 = this.getPlayer(game.player2.id);
      this.socketGateway.server.emit(`endGame${game.id}`);
      if (p1) p1.send({ type: "GAME_ENDED" });
      if (p2) p2.send({ type: "GAME_ENDED" });
      this.socketGateway.eraseGameInProgress(game.id);
      this.socketGateway.server.emit(`endGame${game.id}`);
      this.achievementPlayer1(game);
      this.games.delete(gameId);
    }
  };

  achievementPlayer1 = async (game: GameData) => {
    const gamePlayer1 = await this.prismaService.game.findMany({
      where: {
        OR: [{ player1Id: game.player1.id, player2Id: game.player1.id }],
      },
    });

    const winRate = gamePlayer1.filter((e) => {
      (e.player1Id === game.player1.id && e.player1Score > e.player2Score) ||
        (e.player2Id === game.player1.id && e.player2Score > e.player1Score);
    });

    if (winRate.length === 1) {
      await this.prismaService.userAchievement.update({
        where: {
          userId_achievement: {
            achievement: "FIRST_WIN",
            userId: game.player1.id,
          },
        },
        data: { achievement: { set: "FIRST_WIN" } },
      });
    } else if (winRate.length === 10) {
      await this.prismaService.userAchievement.update({
        where: {
          userId_achievement: {
            achievement: "TEN_WIN",
            userId: game.player1.id,
          },
        },
        data: { achievement: { set: "TEN_WIN" } },
      });
    } else if (winRate.length === 25) {
      await this.prismaService.userAchievement.update({
        where: {
          userId_achievement: {
            achievement: "TWENTYFIVE_WIN",
            userId: game.player1.id,
          },
        },
        data: { achievement: { set: "TWENTYFIVE_WIN" } },
      });
    } else if (winRate.length === 100) {
      await this.prismaService.userAchievement.update({
        where: {
          userId_achievement: {
            achievement: "ONE_HUNDRED_WIN",
            userId: game.player1.id,
          },
        },
        data: { achievement: { set: "ONE_HUNDRED_WIN" } },
      });
    }

    const gameRow = gamePlayer1.slice(0, 6);
    const gameRowLoose = gameRow.filter(
      (e) =>
        (e.player1Id === game.player1.id && e.player1Score < e.player2Score) ||
        (e.player2Id === game.player1.id && e.player2Score < e.player1Score)
    );
    if (gameRowLoose.length === 5) {
      await this.prismaService.userAchievement.update({
        where: {
          userId_achievement: {
            achievement: "FIVE_LOSE_IN_A_ROW",
            userId: game.player1.id,
          },
        },
        data: { achievement: { set: "FIVE_LOSE_IN_A_ROW" } },
      });
    }

    const gameRowWin = gameRow.filter(
      (e) =>
        (e.player1Id === game.player1.id && e.player1Score > e.player2Score) ||
        (e.player2Id === game.player1.id && e.player2Score > e.player1Score)
    );
    if (gameRowWin.length === 5) {
      await this.prismaService.userAchievement.update({
        where: {
          userId_achievement: {
            achievement: "FIVE_WIN_IN_A_ROW",
            userId: game.player1.id,
          },
        },
        data: { achievement: { set: "FIVE_WIN_IN_A_ROW" } },
      });
    }

    const successFivePlayers: Game[] = [];
    gamePlayer1.forEach((e) =>
      successFivePlayers.forEach((c) => {
        if (
          (e.player1Id === c.player1Id &&
            successFivePlayers.every((d) => d.player2Id !== c.player2Id)) ||
          (e.player2Id === c.player2Id &&
            successFivePlayers.every((d) => d.player1Id !== c.player1Id))
        ) {
          successFivePlayers.push(e);
        }
      })
    );
    if (successFivePlayers.length === 5) {
      await this.prismaService.userAchievement.update({
        where: {
          userId_achievement: {
            achievement: "FIVE_PLAYERS",
            userId: game.player1.id,
          },
        },
        data: { achievement: { set: "FIVE_PLAYERS" } },
      });
    }

    const successMultiMode: Game[] = [];
    gamePlayer1.forEach((e) => {
      if (
        successMultiMode.every((c) => {
          c.mode !== e.mode;
        })
      ) {
        successFivePlayers.push(e);
      }
    });

    if (successMultiMode.length === 3) {
      await this.prismaService.userAchievement.update({
        where: {
          userId_achievement: {
            achievement: "MULTI_MODE",
            userId: game.player1.id,
          },
        },
        data: { achievement: { set: "MULTI_MODE" } },
      });
    }
    await this.prismaService.user.update({
      where: { id: game.player1.id },
      data: { rank: { increment: 1 } },
    });
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
        case game.player1.id:
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

      const p1 = this.getPlayer(game.player1.id);
      const p2 = this.getPlayer(game.player2.id);

      if (p1) p1.send({ type: "GAME_ENDED" });
      if (p2) p2.send({ type: "GAME_ENDED" });
      this.socketGateway.server.emit(`forfeitGame${game.id}`);
      this.socketGateway.eraseGameInProgress(game.id);
      this.games.delete(game.id);
    }
  };

  pauseGame = async (userId: number) => {
    const game = this.getGame(userId);

    if (game) {
      this.socketGateway.clearGameIntervall(game.id);
      this.socketGateway.server.emit(`pauseGame${game.id}`);
    }
  };
}
