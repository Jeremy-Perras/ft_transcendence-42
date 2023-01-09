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

type SavedInvitation = Omit<GameInvitation, "inviterName">;

@WebSocketGateway({ cors: "*" })
export class SocketGateway {
  constructor(private prismaService: PrismaService) {}
  @WebSocketServer()
  server: Server;

  private saveInvitation: SavedInvitation[] = [];

  handleConnection(client: Socket, ...args: any[]) {
    client.join(client.request.session.passport.user.toString());
  }

  @SubscribeMessage("gameInvitation")
  async onGameInvitation(
    @MessageBody()
    { gameMode, inviteeId }: { gameMode: GameMode; inviteeId: number },
    @ConnectedSocket() client: Socket
  ) {
    const currentUserId = client.request.session.passport.user;
    if (
      !this.saveInvitation.some(
        (e) => e.inviteeId == inviteeId && e.inviterId == currentUserId
      )
    )
      this.saveInvitation.push({
        inviterId: currentUserId,
        gameMode,
        inviteeId,
      });
    const user = await this.prismaService.user.findUnique({
      select: { name: true },
      where: { id: currentUserId },
    });
    this.server.to(inviteeId.toString()).emit("newInvitation", {
      inviteerId: currentUserId,
      inviteeId,
      gameMode,
      inviterName: user?.name,
    });
  }

  @SubscribeMessage("acceptInvitation")
  async onAcceptInvitation(
    @MessageBody()
    { gameMode, inviteeId, inviterId, inviterName }: GameInvitation
  ) {
    const index = this.saveInvitation.findIndex(
      (e) => e.inviterId === inviterId && e.inviteeId == inviteeId
    );
    this.saveInvitation.splice(index, 1);
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
    this.server.to(inviteeId.toString()).emit("startGame", (await game).id);
    this.server.to(inviterId.toString()).emit("startGame", (await game).id);
  }

  @SubscribeMessage("refuseInvitation")
  async onRefuseInvitation(
    @MessageBody()
    { gameMode, inviteeId, inviterId, inviterName }: GameInvitation
  ) {
    const index = this.saveInvitation.findIndex(
      (e) => e.inviterId === inviterId && e.inviteeId == inviteeId
    );
    this.saveInvitation.splice(index, 1);
    this.server.to(inviterId.toString()).emit("refuseInvitation", {
      gameMode,
      inviteeId,
      inviterId,
      inviterName,
    });
  }

  @SubscribeMessage("cancelInvitation")
  async onCancelInvitation(
    @MessageBody()
    { gameMode, inviteeId, inviterId, inviterName }: GameInvitation
  ) {
    const index = this.saveInvitation.findIndex(
      (e) => e.inviterId === inviterId && e.inviteeId == inviteeId
    );
    this.saveInvitation.splice(index, 1);

    this.server.to(inviteeId.toString()).emit("cancelInvitation", {
      gameMode,
      inviteeId,
      inviterId,
      inviterName,
    });
  }

  // @SubscribeMessage("leaveMatchmaking")
  // async onLeaveMatchMaking(@MessageBody() body: GameInvitation) {
  //   return;
  // }

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
      }, new Array<SavedInvitation>());

      console.log("room destroyed", room);
      server.emit("offline", room);
    });
  }
}
