import { Injectable } from "@nestjs/common";
import { GameMode } from "@prisma/client";

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 150;
const PAD_HEIGHT = 25;
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
  ball: Coord;
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
      ball: { x: 130, y: 50 },
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
            if (gameData.player1.coord.y >= 10)
              gameData.player1.playerState = PlayerState.UP;
            else gameData.player1.playerState = PlayerState.STILL;
          } else if (playerId === this.saveGameData.get(gameId)?.player2.id) {
            if (gameData.player2.coord.y >= 10)
              gameData.player2.playerState = PlayerState.UP;
            else gameData.player2.playerState = PlayerState.STILL;
          }
          this.saveGameData.set(gameId, gameData);
          break;
        case PlayerState.DOWN:
          if (playerId === this.saveGameData.get(gameId)?.player1.id) {
            if (gameData.player1.coord.y <= CANVAS_HEIGHT - PAD_HEIGHT - 10)
              gameData.player1.playerState = PlayerState.DOWN;
            else gameData.player1.playerState = PlayerState.STILL;
          } else if (playerId === this.saveGameData.get(gameId)?.player2.id) {
            if (gameData.player2.coord.y <= CANVAS_HEIGHT - PAD_HEIGHT - 10)
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
        if (gameData.player1.coord.y >= 10) gameData.player1.coord.y -= 10;
      } else if (playerId === gameData.player2.id) {
        if (gameData.player2.coord.y >= 10) gameData.player2.coord.y -= 10;
      }
      this.saveGameData.set(gameId, gameData);
    }
  }

  MovePadDown(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);

    if (gameData !== undefined) {
      if (playerId === gameData.player1.id) {
        if (gameData.player1.coord.y <= CANVAS_HEIGHT - PAD_HEIGHT - 10)
          gameData.player1.coord.y += 10;

        console.log(gameData?.player1.coord.y);
      } else if (playerId === gameData.player2.id) {
        if (gameData.player2.coord.y <= CANVAS_HEIGHT - PAD_HEIGHT - 10)
          gameData.player2.coord.y += 10;
      }
      this.saveGameData.set(gameId, gameData);
    }
  }
}
