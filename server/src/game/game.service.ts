import { Injectable } from "@nestjs/common";
import { GameMode } from "@prisma/client";
type Coordinate = { x: number; y: number };
type Player = { coordinate: Coordinate; id: number };
type Ball = { coordinate: Coordinate };
type GameData = {
  player1: Player;
  player2: Player;
  ball: Ball;
  gamemode: GameMode;
  score: number;
};

@Injectable()
export class GameService {
  private saveGameData = new Map<number, GameData>();
  InitialState(
    id: number,
    inviterId: number,
    inviteeId: number,
    gameMode: GameMode
  ) {
    const ball = { coordinate: { x: 0, y: 0 } };
    const player1 = { coordinate: { x: 0, y: 0 }, id: inviterId };
    const player2 = { coordinate: { x: 0, y: 0 }, id: inviteeId };
    this.saveGameData.set(id, {
      ball,
      player1,
      player2,
      gamemode: gameMode,
      score: 0,
    });
    return this.saveGameData.get(id);
  }

  MovePadUp(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);
    if (gameData != undefined) {
      if (playerId === gameData.player1.id) gameData.player1.coordinate.y += 5;
      else gameData.player2.coordinate.y += 5;
      this.saveGameData.set(gameId, gameData);
    }
    return this.saveGameData.get(gameId);
  }

  MovePadDown(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);
    if (gameData != undefined) {
      if (playerId === gameData.player1.id) gameData.player1.coordinate.y -= 5;
      else gameData.player2.coordinate.y -= 5;
      this.saveGameData.set(gameId, gameData);
    }
    return this.saveGameData.get(gameId);
  }
}
