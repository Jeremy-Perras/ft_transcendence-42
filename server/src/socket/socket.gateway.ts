import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";
import { GameMode } from "@prisma/client";
import { Game } from "../game/game.model";
import { CurrentUser } from "../auth/currentUser.decorator";
@WebSocketGateway({ cors: "*" })
export class SocketGateway {
  constructor(private prismaService: PrismaService) {}
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    client.join(client.request.session.passport.user.toString());
  }

  @SubscribeMessage("gameInvitation")
  async onInvitation(@MessageBody() body: string[]) {
    if (body[0] && body[1] && body[0][0] && body[0][1]) {
      const game = await this.prismaService.game.create({
        data: {
          player1Score: 0,
          player2Score: 0,
          player1Id: +body[0][0],
          mode:
            body[1] == "Classic"
              ? GameMode.CLASSIC
              : body[1] == "Fireball"
              ? GameMode.SPEED
              : GameMode.RANDOM,
          player2Id: +body[0][1],
        },
      });
      body.push(game.id.toString());
      const user = await this.prismaService.user.findUnique({
        select: { name: true },
        where: { id: +body[0][1] },
      });
      if (user?.name) {
        body.push(user.name.toString());
      }
      console.log(body);
      this.server.to(body[0][0].toString()).emit("launchInvitation", body);
    }
  }

  afterInit(server: Server, ...args: any[]) {
    server.of("/").adapter.on("delete-room", (room) => {
      console.log("room destroyed", room);
      server.emit("offline", room);
    });
  }
}
