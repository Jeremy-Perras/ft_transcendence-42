import { Injectable } from "@nestjs/common";
import { GameMode } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SocketGateway } from "../socket/socket.gateway";
import { playerService } from "./player.machine";
import { waitFor } from "xstate/lib/waitFor";
import { UserService } from "../user/user.service";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class GameService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly socketGateway: SocketGateway
  ) {}

  private players: Map<number, ReturnType<typeof playerService>> = new Map();
  private games: Map<number, string> = new Map();
  private matchmakingRooms: Record<GameMode, number[]>;

  @OnEvent("user.offline")
  handleOffline({ userId }: { userId: number }) {
    const player = this.players.get(userId);
    if (player) {
      player.stop();
      // TODO
    }
  }

  getPlayer = (userId: number) => {
    let player = this.players.get(userId);
    if (player) return player;
    else if (this.socketGateway.isOnline(userId)) {
      player = playerService(userId, this, this.socketGateway);
      this.players.set(userId, player);
      return player;
    }
    return null;
  };

  async inviteUserToGame(
    currentUserId: number,
    inviteeId: number,
    gameMode: GameMode
  ) {
    const currentPlayer = this.getPlayer(currentUserId);
    if (!currentPlayer) return; // TODO
    currentPlayer.send({ type: "INVITE", inviteeId, gameMode });
    try {
      await waitFor(
        currentPlayer,
        (state) => state.matches("waitingForMatchmaking"),
        { timeout: 10000 }
      );
    } catch (error) {
      // TODO: handle error
    }
  }

  async cancelInvitation(currentUserId: number) {
    const currentPlayer = this.getPlayer(currentUserId);
    if (!currentPlayer) return; // TODO
    currentPlayer.send({ type: "CANCEL_INVITATION" });
    try {
      await waitFor(currentPlayer, (state) => state.matches("idle"), {
        timeout: 10000,
      });
    } catch (error) {
      // TODO: handle error
    }
  }

  async acceptInvitation(currentUserId: number, inviterId: number) {
    const currentPlayer = this.getPlayer(currentUserId);
    if (!currentPlayer) return; // TODO
    currentPlayer.send({ type: "ACCEPT_INVITATION", inviterId });
    try {
      await waitFor(currentPlayer, (state) => state.matches("playing"), {
        timeout: 10000,
      });
    } catch (error) {
      // TODO: handle error
    }
  }

  async joinMatchMaking(currentUserId: number, gameMode: GameMode) {
    const currentPlayer = this.getPlayer(currentUserId);
    if (!currentPlayer) return; // TODO
    currentPlayer.send({ type: "JOIN_MATCHMAKING", gameMode });
    try {
      await waitFor(
        currentPlayer,
        (state) => state.matches("waitingForMatchmaking"),
        {
          timeout: 10000,
        }
      );
    } catch (error) {
      // TODO: handle error
    }
  }

  async leaveMatchMaking(currentUserId: number) {
    const currentPlayer = this.getPlayer(currentUserId);
    if (!currentPlayer) return; // TODO
    currentPlayer.send({ type: "LEAVE_MATCHMAKING" });
    try {
      await waitFor(currentPlayer, (state) => state.matches("idle"), {
        timeout: 10000,
      });
    } catch (error) {
      // TODO: handle error
    }
  }

  getGame = (userId: number) => this.games.get(userId);

  createGame = async (
    gameMode: GameMode,
    player1Id: number,
    player2Id: number
  ) => {
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
    if (matchmakingRoom.length === 1) {
      const player1 = this.getPlayer(matchmakingRoom[0] as number);
      const player2 = this.getPlayer(userId);
      if (player1 && player2) {
        const p1 = player1.getSnapshot();
        const p2 = player2.getSnapshot();
        if (p1.can("GAME_FOUND") && p2.can("GAME_FOUND")) {
          await this.createGame(gameMode, p1.context.userId, p2.context.userId);
          player1.send({ type: "GAME_FOUND" });
          player2.send({ type: "GAME_FOUND" });
          return;
        }
      }
    }
    matchmakingRoom.push(userId);
  };

  leaveMatchmakingRoom = (userId: number, gameMode: GameMode) => {
    const matchmakingRoom = this.matchmakingRooms[gameMode];
    matchmakingRoom.splice(matchmakingRoom.indexOf(userId), 1);
  };
}
