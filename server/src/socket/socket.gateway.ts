import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";
import { GameMode } from "@prisma/client";
import e from "express";
type GameInvitation = {
  inviterId: number; // personne qui invite
  inviteeId: number;
  gameMode: string;
  inviterName: string;
};

@WebSocketGateway({ cors: "*" })
export class SocketGateway {
  constructor(private prismaService: PrismaService) {}
  @WebSocketServer()
  server: Server;
  private saveInvitation: GameInvitation[] = [];

  handleConnection(client: Socket, ...args: any[]) {
    client.join(client.request.session.passport.user.toString());
  }

  @SubscribeMessage("gameInvitation")
  async onGameInvitation(@MessageBody() body: GameInvitation) {
    if (
      !this.saveInvitation.some(
        (e) => e.inviterId == body.inviterId && e.inviteeId == body.inviterId
      )
    )
      this.saveInvitation.push(body);
    this.server.to(body.inviteeId.toString()).emit("newInvitation", body);
  }

  @SubscribeMessage("acceptInvitation")
  async onAcceptInvitation(@MessageBody() body: GameInvitation) {
    this.saveInvitation.splice(0, 1, body);
    const game = this.prismaService.game.create({
      data: {
        player1Id: body.inviterId,
        player2Id: body.inviteeId,
        mode:
          body.gameMode == "Classic"
            ? GameMode.CLASSIC
            : body.gameMode == "Random"
            ? GameMode.RANDOM
            : GameMode.SPEED,
        player1Score: 0,
        player2Score: 0,
      },
    });
    this.server
      .to(body.inviteeId.toString())
      .emit("startGame", (await game).id);
    this.server
      .to(body.inviterId.toString())
      .emit("startGame", (await game).id);
  }

  @SubscribeMessage("refuseInvitation")
  async onRefuseInvitation(@MessageBody() body: GameInvitation) {
    this.saveInvitation.splice(0, 1, body);
    this.server.to(body.inviterId.toString()).emit("refuseInvitation", body);
  }

  @SubscribeMessage("cancelInvitation")
  async onCancelInvitation(@MessageBody() body: GameInvitation) {
    this.saveInvitation.splice(0, 1, body);
    this.server.to(body.inviteeId.toString()).emit("cancelInvitation", body);
  }

  @SubscribeMessage("leaveMatchmaking")
  async onLeaveMatchMaking(@MessageBody() body: GameInvitation) {
    return;
  }

  afterInit(server: Server, ...args: any[]) {
    server.of("/").adapter.on("delete-room", (room) => {
      this.saveInvitation.forEach((e) => {
        if (e.inviterId == room) {
          this.server.to(e.inviteeId.toString()).emit("cancelInvitation", e);
        }
      });
      this.saveInvitation.forEach((e) => {
        if (e.inviteeId == room) {
          this.server.to(e.inviterId.toString()).emit("refuseInvitation", e);
        }
      });
      console.log("room destroyed", room);
      server.emit("offline", room);
    });
  }
}
