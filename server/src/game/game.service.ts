import { Injectable } from "@nestjs/common";
import { GameMode } from "@prisma/client";
type Coord = {
  x: number;
  y: number;
};
type Player = { coord: Coord; id: number; score: number };
type Ball = { coord: Coord };
type GameData = {
  player1: Player;
  player2: Player;
  ball: Ball;
  gamemode: GameMode;
};

@Injectable()
export class GameService {
  private saveGameData = new Map<number, GameData>();
  // InitialState(
  //   id: number,
  //   inviterId: number,
  //   inviteeId: number,
  //   gameMode: GameMode
  // ) {
  //   const ball = { coord: { x: 150, y: 75 } };
  //   const player1 = { coord: { x: 20, y: 0 }, id: inviterId };
  //   const player2 = { coord: { x: 270, y: 0 }, id: inviteeId };
  //   this.saveGameData.set(id, {
  //     ball,
  //     player1,
  //     player2,
  //     gamemode: gameMode,
  //     score: 0,
  //   });
  //   return this.saveGameData.get(id);
  // }

  MovePadUp(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);
    console.log(gameData);
    if (gameData != undefined) {
      if (playerId === gameData.player1.id) gameData.player1.coord.y += 5;
      else gameData.player2.coord.y += 5;
      this.saveGameData.set(gameId, gameData);
    }
    return this.saveGameData.get(gameId);
  }

  MovePadDown(gameId: number, playerId: number) {
    const gameData = this.saveGameData.get(gameId);
    if (gameData != undefined) {
      if (playerId === gameData.player1.id) gameData.player1.coord.y -= 5;
      else gameData.player2.coord.y -= 5;
      this.saveGameData.set(gameId, gameData);
    }
    return this.saveGameData.get(gameId);
  }
}
