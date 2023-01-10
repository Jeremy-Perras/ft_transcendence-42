import { Injectable } from "@nestjs/common";
import { GameMode } from "@prisma/client";
import { createMachine } from "xstate";
import { PrismaService } from "../prisma/prisma.service";
import { SocketService } from "../socket/socket.service";

// TODO: handle online / offline status

type PlayerContext = {
  inviteeId?: number;
  gameMode?: number;
};
type PlayerEvent =
  | { type: "INVITE" }
  | { type: "CANCEL_INVITATION" }
  | { type: "INVITATION_ACCEPTED" }
  | { type: "JOIN_MATCHMAKING" }
  | { type: "LEAVE_MATCHMAKING" }
  | { type: "GAME_FOUND" }
  | { type: "END_GAME" };

type PlayerTypestate =
  | { value: "idle"; context: PlayerContext }
  | { value: "waitingForInvitee"; context: PlayerContext }
  | { value: "waitingForMatch"; context: PlayerContext }
  | { value: "playing"; context: PlayerContext };

@Injectable()
export class GameService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socketService: SocketService
  ) {}

  private players: Record<
    number,
    ReturnType<
      typeof createMachine<PlayerContext, PlayerEvent, PlayerTypestate>
    >
  > = {};

  getPlayer = (userId: number) => {
    // TODO error handling
    let player = this.players[userId];
    if (player) return player;
    else {
      player = createMachine<PlayerContext, PlayerEvent, PlayerTypestate>({
        id: "player",
        context: {
          inviteeId: undefined,
          gameMode: undefined,
        },
        states: {
          idle: {
            on: {
              INVITE: {},
              JOIN_MATCHMAKING: {},
            },
          },
          waitingForInvitee: {
            on: {
              CANCEL_INVITATION: {},
              INVITATION_ACCEPTED: {},
            },
          },
          waitingForMatch: {
            on: {
              LEAVE_MATCHMAKING: {},
              GAME_FOUND: {},
            },
          },
          playing: {
            on: {
              END_GAME: {},
            },
          },
        },
      });
      this.players[userId] = player;
      return player;
    }
  };

  inviteUserToGame(currentUserId: number, userId: number, gameMode: GameMode) {
    const currentPlayer = this.getPlayer(currentUserId);
    const otherPlayer = this.getPlayer(userId);

    currentPlayer.transition("INVITE", {});
  }

  cancelInvitation(currentUserId: number, userId: number) {}
  acceptInvitation(currentUserId: number, userId: number) {}
  joinMatchMaking(currentUserId: number, gameMode: GameMode) {}
  leaveMatchMaking(currentUserId: number) {}
  startGame(player1Id: number, player2Id: number, gameMode: GameMode) {}
  endGame(gameId: number) {}
}
