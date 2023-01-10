import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";
import { GameMode } from "@prisma/client";

import { GameService, PlayerState } from "../game/game.service";
import { join } from "path";
import { IoAdapter } from "@nestjs/platform-socket.io";

type GameInvitation = {
  inviterId: number; // personne qui invite
  inviteeId: number;
  gameMode: string;
  inviterName: string;
};

enum UserState {
  MATCHING,
  PLAYING,
  INVITING,
  IDLE,
}

@WebSocketGateway({ cors: "*", transports: ["websocket"] })
export class SocketGateway {
  constructor(
    private prismaService: PrismaService,
    private gameService: GameService
  ) {}
  constructor(private eventEmitter: EventEmitter2) {}

  @WebSocketServer()
  private server: Server;

  private connectedUsers: Map<number, string> = new Map();

  private saveInvitation: GameInvitation[] = [];
  private gameInProgress = new Map<number, NodeJS.Timer>();

  private getUserState = async (id: number): Promise<UserState> => {
    const isInviting = this.saveInvitation.find((e) => e.inviterId == id);
    if (isInviting) {
      return UserState.INVITING;
    }

    let isMatching = false;

    for (const mode in GameMode) {
      if (isMatching) break;
      const sockets = await this.server.in(mode).fetchSockets();
      for (const socket of sockets) {
        if (isMatching) break;
        for (const room of socket.rooms) {
          if (room.substring(0, 5) === "user_") {
            if (+room.substring(5) === id) {
              isMatching = true;
              break;
            }
          }
        }
      }
    }

    if (isMatching) {
      return UserState.MATCHING;
    }

    const isPlaying = await this.prismaService.game.findMany({
      where: { OR: [{ player1Id: id }, { player2Id: id }], finishedAt: null },
    });
    if (isPlaying.length > 0) {
      return UserState.PLAYING;
    }

    return UserState.IDLE;
  };

  private cancelSentAndReceivedInvitations = (userId: number): void => {
    this.saveInvitation = this.saveInvitation.filter((invitation) => {
      if (invitation.inviterId === userId)
        //cancel sent invitation
        this.server
          .to("user_" + invitation.inviteeId.toString())
          .emit("cancelInvitation", invitation);
      else if (invitation.inviteeId === userId)
        //refuse received invitation
        this.server
          .to("user_" + invitation.inviterId.toString())
          .emit("error", "Invitation refused");
      return !(
        invitation.inviterId === userId || invitation.inviteeId === userId
      );
    });
  };

  private checkConnection = (userId: number): boolean => {
    if (this.server.sockets.adapter.rooms.get("user_" + userId)) {
      return true;
    }
    return false;
  };

  private playerState(gameId: number) {
    const callback = () => {
      const gameData = this.gameService.saveGameData.get(gameId);
      if (gameData?.player1.playerState === PlayerState.DOWN) {
        this.gameService.MovePadDown(gameId, gameData.player1.id);
      } else if (gameData?.player1.playerState === PlayerState.UP) {
        this.gameService.MovePadUp(gameId, gameData.player1.id);
      }
      if (gameData?.player2.playerState === PlayerState.DOWN) {
        this.gameService.MovePadDown(gameId, gameData.player2.id);
      } else if (gameData?.player2.playerState === PlayerState.UP) {
        this.gameService.MovePadUp(gameId, gameData.player2.id);
      }
      this.gameService.MoveBall(gameId);
      // this.server.to("game" + gameId).emit("updateCanvas", gameData);
      this.server.sockets.adapter.rooms.get(`game${gameId}`)?.forEach((s) => {
        this.server.to(s).emit("updateCanvas", gameData);
      });
    };
    this.gameInProgress.set(gameId, setInterval(callback, 100));
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const currentUserId = client.request.session.passport.user;

    client.join("user_" + client.request.session.passport.user.toString());
    const currentUserState = await this.getUserState(currentUserId);
    const status =
      currentUserState === UserState.PLAYING
        ? "Playing"
        : currentUserState === UserState.INVITING
        ? "Inviting"
        : currentUserState === UserState.MATCHING
        ? "Matching"
        : "Idle";
    if (
      this.server.sockets.adapter.rooms.get("user_" + currentUserId)?.size !== 1
    ) {
      client.emit("error", "You have a session opened in status : " + status);
    }
  }

  @SubscribeMessage("joinMatchmaking")
  async joinMatchmaking(
    @MessageBody()
    gameMode: GameMode,
    @ConnectedSocket() client: Socket
  ) {
    const currentUserId = client.request.session.passport.user;
    const currentUserState = await this.getUserState(currentUserId);

    switch (currentUserState) {
      case UserState.PLAYING:
        this.server
          .to("user_" + currentUserId.toString())
          .emit("error", "Action not allowed - You are already playing");
        return;
      case UserState.INVITING:
        this.server
          .to("user_" + currentUserId.toString())
          .emit(
            "error",
            "Action not allowed - You are inviting someone. Cancel invitation first"
          );
        return;
      case UserState.MATCHING:
        this.server
          .to("user_" + currentUserId.toString())
          .emit(
            "error",
            "Action not allowed - You are already in queue for matchmaking"
          );
        return;
      default:
        break;
    }

    this.cancelSentAndReceivedInvitations(currentUserId);
    client.join(gameMode);

    let size = this.server.sockets.adapter.rooms.get(gameMode)?.size;

    while (size && size >= 2) {
      let ids: number[] = [];
      (await this.server.in(gameMode).fetchSockets()).forEach((socket) => {
        socket.rooms.forEach((room) => {
          if (room.substring(0, 5) === "user_") {
            ids = [...ids, +room.slice(5)];
          }
        });
      });
      if (ids[0] && ids[1]) {
        const game = await this.prismaService.game.create({
          data: {
            player1Id: ids[0],
            player2Id: ids[1],
            mode: gameMode,
            player1Score: 0,
            player2Score: 0,
          },
        });
        this.server
          .to("user_" + ids[0].toString())
          .to("user_" + ids[1].toString())
          .emit("startGame", game.id);
        (await this.server.in(gameMode).fetchSockets()).forEach((socket) => {
          socket.rooms.forEach((room) => {
            if (room.substring(0, room.length) === "user_" + ids[0]) {
              socket.leave(gameMode);
            } else if (room.substring(0, room.length) === "user_" + ids[1]) {
              socket.leave(gameMode);
            }
          });
        });
        size = this.server.sockets.adapter.rooms.get(gameMode)?.size;

        const sockets = await this.server.fetchSockets();
        for (const socket of sockets) {
          for (const room of socket.rooms) {
            if (room === "user_" + ids[0].toString()) {
              socket.join(`game${game.id}`);
            } else if (room === "user_" + ids[1].toString())
              socket.join(`game${game.id}`);
          }
        }
        this.playerState(game.id);
        this.gameService.InitialState(
          game.id,
          game.player2Id,
          game.player1Id,
          game.mode
        );
      }
    }
  }

  @SubscribeMessage("gameInvitation")
  async onGameInvitation(
    @MessageBody()
    {
      gameMode,
      inviteeId,
      inviterName,
    }: { gameMode: GameMode; inviteeId: number; inviterName: string },
    @ConnectedSocket() client: Socket
  ) {
    const currentUserId = client.request.session.passport.user;
    const currentUserState = await this.getUserState(currentUserId);
    const userState = await this.getUserState(inviteeId);
    if (!this.checkConnection(inviteeId)) {
      this.server
        .to("user_" + currentUserId)
        .emit("error", "Player is disconnected");
      return;
    }
    switch (currentUserState) {
      case UserState.PLAYING:
        this.server
          .to("user_" + currentUserId.toString())
          .emit("error", "Action not allowed - You are already playing");
        return;
      case UserState.INVITING:
        this.server
          .to(currentUserId.toString())
          .emit(
            "error",
            "Action not allowed - You are already inviting someone. Cancel invitation first"
          );
        return;
      case UserState.MATCHING:
        this.server
          .to("user_" + currentUserId.toString())
          .emit(
            "error",
            "Action not allowed - You are in matchmaking. Leave queue first"
          );
        return;
      default:
        break;
    }

    switch (userState) {
      case UserState.PLAYING:
        this.server
          .to("user_" + currentUserId.toString())
          .emit("error", "User is already in game");
        return;
      case UserState.MATCHING:
        this.server
          .to("user_" + currentUserId.toString())
          .emit(
            "error",
            "User is in queue for matchmaking. Send a direct message!"
          );
        return;
      case UserState.INVITING:
        this.server
          .to("user_" + currentUserId.toString())
          .emit("error", "User is already inviting someone");
        return;

      default:
        break;
    }

    this.cancelSentAndReceivedInvitations(currentUserId);

    if (
      !this.saveInvitation.some(
        (e) => e.inviteeId === inviteeId && e.inviterId === currentUserId
      )
    )
      this.saveInvitation.push({
        inviterId: currentUserId,
        gameMode,
        inviteeId,
        inviterName: inviterName,
      });

    this.server.to("user_" + inviteeId.toString()).emit("newInvitation", {
      inviterId: currentUserId,
      inviteeId,
      gameMode,
      inviterName: inviterName,
    });
  }

  @SubscribeMessage("acceptInvitation")
  async onAcceptInvitation(
    @MessageBody()
    { gameMode, inviteeId, inviterId, inviterName }: GameInvitation,
    @ConnectedSocket() client: Socket
  ) {
    const currentUserId = client.request.session.passport.user;
    const currentUserState = await this.getUserState(currentUserId);
    const userState = await this.getUserState(inviterId);

    if (userState !== UserState.INVITING) {
      this.server
        .to("user_" + currentUserId.toString())
        .emit("error", inviterName + " canceled invitation");
      return;
    }

    if (currentUserState !== UserState.IDLE) {
      this.server
        .to("user_" + currentUserId.toString())
        .emit(
          "error",
          `Action not allowed - ${
            currentUserState === UserState.PLAYING
              ? "You are already playing"
              : currentUserState === UserState.INVITING
              ? "You are already inviting someone. Cancel invitation first"
              : "You are in matchmaking. Leave queue first"
          }`
        );
      this.server
        .to("user_" + inviterId.toString())
        .emit(
          "error",
          `${
            currentUserState === UserState.PLAYING
              ? "User is already playing"
              : currentUserState === UserState.INVITING
              ? "User is already inviting someone"
              : "User is in matchmaking"
          }`
        );
      return;
    }

    this.cancelSentAndReceivedInvitations(inviteeId);
    this.cancelSentAndReceivedInvitations(inviterId);

    const game = await this.prismaService.game.create({
      data: {
        player1Id: inviterId,
        player2Id: inviteeId,
        mode: gameMode as GameMode,

        player1Score: 0,
        player2Score: 0,
      },
    });

    this.server.to("user_" + inviteeId.toString()).emit("startGame", game.id);
    this.server.to("user_" + inviterId.toString()).emit("startGame", game.id);
    this.playerState(game.id);
    const sockets = await this.server.fetchSockets();
    for (const socket of sockets) {
      for (const room of socket.rooms) {
        if (room === "user_" + `${inviteeId}`) {
          socket.join(`game${game.id}`);
        } else if (room === "user_" + `${inviterId}`)
          socket.join(`game${game.id}`);
      }
    }

    this.gameService.InitialState(
      game.id,
      game.player2Id,
      game.player1Id,
      game.mode
    );
  }

  @SubscribeMessage("refuseInvitation")
  async onRefuseInvitation(
    @MessageBody()
    { gameMode, inviteeId, inviterId, inviterName }: GameInvitation
  ) {
    const userState = await this.getUserState(inviterId);
    const currentUserState = await this.getUserState(inviteeId);

    const index = this.saveInvitation.findIndex(
      (i) => i.inviterId === inviterId && i.inviteeId === inviteeId
    );
    this.saveInvitation.splice(index, 1);

    if (userState !== UserState.INVITING) {
      this.server
        .to("user_" + inviteeId.toString())
        .emit("error", "User is not inviting you anymore");
      return;
    }

    if (currentUserState === UserState.IDLE)
      this.server.to("user_" + inviterId.toString()).emit("cancelInvitation", {
        gameMode,
        inviteeId,
        inviterId,
        inviterName,
      });
    this.server
      .to("user_" + inviterId.toString())
      .emit("error", " invitation refused");
  }

  //TODO
  @SubscribeMessage("cancelInvitation")
  async onCancelInvitation(@ConnectedSocket() client: Socket) {
    const currentUserId = client.request.session.passport.user;
    const currentUserState = await this.getUserState(currentUserId);

    if (currentUserState === UserState.INVITING) {
      this.saveInvitation.filter((i) => {
        if (i.inviterId === currentUserId) {
          this.server
            .to("user_" + i.inviteeId.toString())
            .emit("error", `${i.inviterName} canceled invitation`);
          return false;
        }
        return true;
      });
    } else {
      this.server
        .to("user_" + currentUserId.toString())
        .emit("error", `Action not allowed `);
    }
  }

  @SubscribeMessage("leaveMatchmaking")
  async onLeaveMatchMaking(@ConnectedSocket() client: Socket) {
    const currentUserId = client.request.session.passport.user;
    const currentUserState = await this.getUserState(currentUserId);
    if (currentUserState === UserState.MATCHING)
      for (const mode in GameMode) {
        const sockets = await this.server.in(mode).fetchSockets();
        for (const socket of sockets) {
          for (const room of socket.rooms) {
            if (room === "user_" + `${currentUserId}`) {
              socket.leave(mode);
            }
          }
        }
      }
    else {
      this.server
        .to("user_" + currentUserId.toString())
        .emit("error", "You are not in queue for matchmaking");
    }
  }
  @SubscribeMessage("gameReady")
  async onGameReady(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const gameData = this.gameService.saveGameData.get(gameId);
    this.server.to(`game${gameId}`).emit("updateCanvas", gameData);
  }

  @SubscribeMessage("movePadUp")
  async onMovePadUp(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const currentUserId = client.request.session.passport.user;
    this.gameService.PlayerState(PlayerState.UP, currentUserId, gameId);
  }
  //["gameId" : {player1 : {x, y, currentMove, score}, player2 : {x,y,currentMove,score}, }]
  @SubscribeMessage("movePadDown")
  async onMovePadDown(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const currentUserId = client.request.session.passport.user;
    this.gameService.PlayerState(PlayerState.DOWN, currentUserId, gameId);
  }

  @SubscribeMessage("stopPad")
  async onstopPad(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const currentUserId = client.request.session.passport.user;
    this.gameService.PlayerState(PlayerState.STILL, currentUserId, gameId);
  }

  @SubscribeMessage("joinRoomAsViewer")
  async onJoinRoomAsViewer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const gameData = this.gameService.saveGameData.get(gameId);
    client.join(`game${gameId}`);
    this.server.to(`game${gameId}`).emit("updateCanvas", gameData);
  }

  @SubscribeMessage("endGame")
  async endGame(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameId: number
  ) {
    const interval = this.gameInProgress.get(gameId);
    if (interval) {
      clearInterval(interval);
      const gameData = this.gameService.saveGameData.get(gameId);
      await this.prismaService.game.update({
        where: { id: gameId },
        data: {
          finishedAt: new Date(),
          player1Score: gameData?.player1.score,
          player2Score: gameData?.player2.score,
        },
      });
      this.gameInProgress.delete(gameId);
      this.server.socketsLeave(`game${gameId}`);
    }
  }

  afterInit(server: Server, ...args: any[]) {
    server.of("/").adapter.on("delete-room", (room) => {
      this.saveInvitation = this.saveInvitation.reduce((acc, curr) => {
        if (curr.inviteeId === +room) {
          this.server
            .to("user_" + curr.inviterId.toString())
            .emit("refuseInvitation", curr);
        } else if (curr.inviterId === +room) {
          this.server
            .to("user_" + curr.inviteeId.toString())
            .emit("cancelInvitation", curr);
        } else {
          acc.push(curr);
        }
        return acc;
      }, new Array<GameInvitation>());

      console.log("room destroyed", room);
      server.emit("offline", room);
    });
  handleConnection(client: Socket, ...args: any[]) {
    const userId = client.request.session.passport.user;
    const user = this.connectedUsers.get(userId);
    if (user) {
      client.emit("error", "You are already connected on another device");
      client.disconnect();
    } else {
      this.connectedUsers.set(userId, client.id);
      this.eventEmitter.emit("user.connection", userId);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.request.session.passport.user;
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.connectedUsers.delete(userId);
    }
    this.eventEmitter.emit("user.disconnect", userId);
  }

  sendToUser(userId: number, event: string, data: unknown) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.server.to(user).emit(event, data);
    }
  }

  isOnline(userId: number) {
    return this.connectedUsers.has(userId);
  }
}
