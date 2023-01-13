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
    private readonly prismaService: PrismaService,
    private readonly socketGateway: SocketGateway
  ) {}

  // TODO: private
  players: Map<number, ReturnType<typeof PlayerMachine>> = new Map();
  games: Map<number, Game> = new Map();
  matchmakingRooms: Record<GameMode, Set<number>> = {
    CLASSIC: new Set(),
    RANDOM: new Set(),
    SPEED: new Set(),
  };

  @OnEvent("user.offline")
  handleOffline({ userId }: { userId: number }) {
    const player = this.players.get(userId);
    if (player) {
      player.send({ type: "DISCONNECT" });
    }
    for (const mode in this.matchmakingRooms) {
      this.matchmakingRooms[mode as GameMode].delete(userId);
    }
  }

  async inviteUserToGame(
    currentUserId: number,
    inviteeId: number,
    gameMode: GameMode
  ) {
    const currentPlayer = this.getPlayer(currentUserId);
    if (!currentPlayer) return; // TODO
    try {
      const wait = waitFor(
        currentPlayer,
        (state) => state.matches("_.waitingForInvitee"),
        { timeout: 1000 }
      );
      currentPlayer.send({ type: "INVITE", inviteeId, gameMode });
      await wait;
    } catch (error) {
      // TODO: handle error
    }
  }

  async cancelInvitation(currentUserId: number) {
    const currentPlayer = this.getPlayer(currentUserId);
    if (!currentPlayer) return; // TODO
    try {
      const wait = waitFor(currentPlayer, (state) => state.matches("_.idle"), {
        timeout: 10000,
      });
      currentPlayer.send({ type: "CANCEL_INVITATION" });
      await wait;
    } catch (error) {
      // TODO: handle error
    }
  }

  async acceptInvitation(currentUserId: number, inviterId: number) {
    const currentPlayer = this.getPlayer(currentUserId);
    if (!currentPlayer) return; // TODO
    try {
      const wait = waitFor(
        currentPlayer,
        (state) => state.matches("_.playing"),
        {
          timeout: 10000,
        }
      );
      currentPlayer.send({ type: "ACCEPT_INVITATION", inviterId });
      await wait;
    } catch (error) {
      // TODO: handle error
    }
  }

  async refuseInvitation(currentUserId: number, inviterId: number) {
    const currentPlayer = this.getPlayer(currentUserId);
    if (!currentPlayer) return; // TODO
    try {
      const wait = waitFor(
        currentPlayer,
        (state) => !state.context.invitations.has(inviterId),
        {
          timeout: 10000,
        }
      );
      currentPlayer.send({ type: "REFUSE_INVITATION", inviterId });
      await wait;
    } catch (error) {
      // TODO: handle error
    }
  }

  async joinMatchMaking(currentUserId: number, gameMode: GameMode) {
    const currentPlayer = this.getPlayer(currentUserId);
    if (!currentPlayer) return; // TODO
    try {
      const wait = waitFor(
        currentPlayer,
        (state) => state.matches("_.waitingForMatchmaking"),
        {
          timeout: 10000,
        }
      );
      currentPlayer.send({ type: "JOIN_MATCHMAKING", gameMode });
      await wait;
    } catch (error) {
      // TODO: handle error
    }
  }

  async leaveMatchMaking(currentUserId: number) {
    const currentPlayer = this.getPlayer(currentUserId);
    if (!currentPlayer) return; // TODO
    try {
      const wait = waitFor(currentPlayer, (state) => state.matches("_.idle"), {
        timeout: 10000,
      });
      currentPlayer.send({ type: "LEAVE_MATCHMAKING" });
      await wait;
    } catch (error) {
      // TODO: handle error
    }
  }

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

  createGame = (gameMode: GameMode, player1Id: number, player2Id: number) => {
    return this.prismaService.game.create({
      data: {
        mode: gameMode,
        player1Id,
        player2Id,
      },
    });
    // TODO: create timer callback
  };

  joinMatchmakingRoom = async (userId: number, gameMode: GameMode) => {
    const matchmakingRoom = this.matchmakingRooms[gameMode];
    if (matchmakingRoom.has(userId)) return;
    console.log(1);
    if (matchmakingRoom.size === 1) {
      console.log(2);
      const player1 = this.getPlayer(matchmakingRoom.values().next().value);
      const player2 = this.getPlayer(userId);
      if (player1 && player2) {
        console.log(3);
        const p1 = player1.getSnapshot();
        const p2 = player2.getSnapshot();
        console.log(p1.can("GAME_FOUND"));
        if (p1.can("GAME_FOUND") && p2.can("GAME_FOUND")) {
          console.log(4);
          await this.createGame(gameMode, p1.context.userId, p2.context.userId);
          player1.send({ type: "GAME_FOUND" });
          player2.send({ type: "GAME_FOUND" });
          return;
        }
      }
    }
    matchmakingRoom.add(userId);
  };

  leaveMatchmakingRoom = (userId: number, gameMode: GameMode) => {
    const matchmakingRoom = this.matchmakingRooms[gameMode];
    matchmakingRoom.delete(userId);
  };
}
