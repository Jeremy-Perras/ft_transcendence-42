import { Injectable } from "@nestjs/common";
import { GameMode } from "@prisma/client";
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
    inviterId: number,
    inviteeId: number,
    gameMode: GameMode
  ) {
    this.saveGameData.set(id, {
      player1: {
        id: 1,
        coord: { x: 20, y: 30 },
        score: 0,
        playerState: PlayerState.STILL,
      },
      player2: {
        id: 2,
        coord: { x: 280, y: 80 },
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
            gameData.player1.playerState = PlayerState.UP;
          } else gameData.player2.playerState = PlayerState.UP;
          this.saveGameData.set(gameId, gameData);
          break;
        case PlayerState.DOWN:
          if (playerId === this.saveGameData.get(gameId)?.player1.id)
            gameData.player1.playerState = PlayerState.DOWN;
          else gameData.player2.playerState = PlayerState.DOWN;
          this.saveGameData.set(gameId, gameData);
          break;
        default:
          if (playerId === this.saveGameData.get(gameId)?.player1.id)
            gameData.player1.playerState = PlayerState.STILL;
          else gameData.player2.playerState = PlayerState.STILL;
          this.saveGameData.set(gameId, gameData);
          break;
      }
    }
  }

  MovePadUp(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);
    if (gameData != undefined) {
      if (playerId === gameData.player1.id) {
        gameData.player1.coord.y -= 5;
      } else {
        gameData.player2.coord.y -= 5;
      }
      this.saveGameData.set(gameId, gameData);
    }
  }

  MovePadDown(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);
    if (gameData != undefined) {
      if (playerId === gameData.player1.id) {
        gameData.player1.coord.y += 5;
      } else {
        gameData.player2.coord.y += 5;
      }
      {
        this.saveGameData.set(gameId, gameData);
      }
    }
  }
}
