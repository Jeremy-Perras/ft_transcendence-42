import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";
import { GameMode } from "@prisma/client";

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

@WebSocketGateway({ cors: "*" })
export class SocketGateway {
  constructor(private prismaService: PrismaService) {}
  @WebSocketServer()
  server: Server;

  private saveInvitation: GameInvitation[] = [];

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
          .to(invitation.inviteeId.toString())
          .emit("cancelInvitation", invitation);
      else if (invitation.inviteeId === userId)
        //refuse received invitation
        this.server
          .to(invitation.inviterId.toString())
          .emit("refuseInvitation", invitation);
      return !(
        invitation.inviterId === userId || invitation.inviteeId === userId
      );
    });
  };

  handleConnection(client: Socket, ...args: any[]) {
    client.join("user_" + client.request.session.passport.user.toString());
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
          .to(currentUserId.toString())
          .emit("error", "Action not allowed - You are already playing");
        return;
      case UserState.INVITING:
        this.server
          .to(currentUserId.toString())
          .emit(
            "error",
            "Action not allowed - You are inviting someone. Cancel invitation first"
          );
        return;
      case UserState.MATCHING:
        this.server
          .to(currentUserId.toString())
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
          .to(ids[0].toString())
          .to(ids[1].toString())
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
    switch (currentUserState) {
      case UserState.PLAYING:
        this.server
          .to(currentUserId.toString())
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
          .to(currentUserId.toString())
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
          .to(currentUserId.toString())
          .emit("error", " User is already in game");
        return;
      case UserState.MATCHING:
        this.server
          .to(currentUserId.toString())
          .emit(
            "error",
            " User is in queue for matchmaking. Send a direct message!"
          );
        return;
      case UserState.INVITING:
        this.server
          .to(currentUserId.toString())
          .emit("error", " User is already inviting someone");
        return;

      default:
        break;
    }

    if (
      !this.saveInvitation.some(
        (e) => e.inviteeId == inviteeId && e.inviterId === currentUserId
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
    this.cancelSentAndReceivedInvitations(currentUserId);
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
        .to(currentUserId.toString())
        .emit("error", inviterName + " canceled invitation");
      return;
    }

    if (currentUserState !== UserState.IDLE) {
      this.server
        .to(currentUserId.toString())
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
        .to(inviterId.toString())
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

    const game = this.prismaService.game.create({
      data: {
        player1Id: inviterId,
        player2Id: inviteeId,
        mode: gameMode as GameMode,

        player1Score: 0,
        player2Score: 0,
      },
    });

    // TODO create callback Timer
    this.server
      .to("user_" + inviteeId.toString())
      .emit("startGame", (await game).id);
    this.server
      .to("user_" + inviterId.toString())
      .emit("startGame", (await game).id);
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
        .to(inviteeId.toString())
        .emit("error", "User is not inviting you anymore");
      return;
    }

    if (currentUserState === UserState.IDLE)
      this.server.to(inviterId.toString()).emit("cancelInvitation", {
        gameMode,
        inviteeId,
        inviterId,
        inviterName,
      });
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
            .to(i.inviteeId.toString())
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
  async onLeaveMatchMaking(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    gameMode: GameMode
  ) {
    const currentUserId = client.request.session.passport.user;
    const currentUserState = await this.getUserState(currentUserId);
    if (currentUserState === UserState.MATCHING)
      for (const mode in GameMode) {
        const sockets = await this.server.in(mode).fetchSockets();
        for (const socket of sockets) {
          for (const room of socket.rooms) {
            if (room === "user_" + `${currentUserId}`) {
              socket.leave(gameMode);
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

  afterInit(server: Server, ...args: any[]) {
    server.of("/").adapter.on("delete-room", (room) => {
      this.saveInvitation = this.saveInvitation.reduce((acc, curr) => {
        if (curr.inviteeId === +room) {
          this.server
            .to(curr.inviterId.toString())
            .emit("refuseInvitation", curr);
        } else if (curr.inviterId === +room) {
          this.server
            .to(curr.inviteeId.toString())
            .emit("cancelInvitation", curr);
        } else {
          acc.push(curr);
        }
        return acc;
      }, new Array<GameInvitation>());

      console.log("room destroyed", room);
      server.emit("offline", room);
    });
  }
}
