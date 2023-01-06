import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";

@WebSocketGateway({ cors: "*" })
export class SocketGateway {
  constructor(private prismaService: PrismaService) {}
  @WebSocketServer()
  server: Server;
  private saveInvitation: string[] = [];
  private Invitation: boolean;
  handleConnection(client: Socket, ...args: any[]) {
    client.join(client.request.session.passport.user.toString());
  }

  @SubscribeMessage("gameInvitation")
  async onGameInvitation(@MessageBody() body: string[]) {
    if (body[0] && body[1] && body[0][0] && body[0][1]) {
      const user = await this.prismaService.user.findUnique({
        select: { name: true },
        where: { id: +body[0][1] },
      });
      if (user?.name) {
        body.push(user.name.toString());
      }
      this.Invitation = true;
      if (this.saveInvitation[0]) {
        for (let index = 0; index < this.saveInvitation.length; index++) {
          if (
            this.saveInvitation[index]![0] == body[0][0] &&
            this.saveInvitation[index]![1] == body[0][1]
          ) {
            this.Invitation = false;
          }
        }
      }
      if (this.Invitation == true) {
        for (let index = 0; index < body.length; index++) {
          this.saveInvitation?.push(body[index]!);
        }
      }
      console.log(this.saveInvitation);
    }
  }

  @SubscribeMessage("cancelInvitation")
  async onCancelInvitation(@MessageBody() body: string[]) {
    this.saveInvitation.find((e, index) => {
      if (e[0] && body[0]) e[0][1] == body[0][1] && e[0][1];
    });
    return;
  }

  @SubscribeMessage("refuseInvitation")
  async onRefuseInvitation(@MessageBody() body: string[]) {
    return;
  }

  @SubscribeMessage("acceptInvitation")
  async onAcceptInvitation(@MessageBody() body: string[]) {
    return;
  }

  @SubscribeMessage("leaveMatchmaking")
  async onLeaveMatchemaking(@MessageBody() body: string[]) {
    return;
  }

  afterInit(server: Server, ...args: any[]) {
    server.of("/").adapter.on("delete-room", (room) => {
      console.log("room destroyed", room);
      server.emit("offline", room);
    });
  }
}
