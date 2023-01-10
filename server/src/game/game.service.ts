import { Injectable } from "@nestjs/common";
import { Game, GameMode } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SocketGateway } from "../socket/socket.gateway";
import { PlayerMachine } from "./player.machine";
import { waitFor } from "xstate/lib/waitFor";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class GameService {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly prismaService: PrismaService
  ) {}

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
