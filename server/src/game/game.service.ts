import { Injectable } from "@nestjs/common";

type Player = { x: number; y: number; id: number };
type Ball = { x: number; y: number };
type GameData = { player1: Player; player2: Player; ball: Ball };

@Injectable()
export class GameService {
  private saveGameData = new Map<number, GameData>();
  InitialState(id: number, inviterId: number, inviteeId: number) {
    const ball = { x: 0, y: 0 };
    const player1 = { x: 0, y: 0, id: inviterId };
    const player2 = { x: 0, y: 0, id: inviteeId };
    this.saveGameData.set(id, { ball, player1, player2 });
    return this.saveGameData.get(id);
  }

  MovePadUp(id: number) {
    const test = this.saveGameData.get(id);
    if (test != undefined) {
      test.player1.x += 5;

      this.saveGameData.set(id, test);
    }
    return;
  }

  MovePadDown(id: number) {
    return;
  }
}
