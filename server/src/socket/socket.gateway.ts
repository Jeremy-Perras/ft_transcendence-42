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
@WebSocketGateway({ cors: "*" })
export class SocketGateway {
  constructor(private prismaService: PrismaService) {}
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    client.join(client.request.session.passport.user.toString());
  }

  @SubscribeMessage("gameInvitation")
  async onInvitation(@MessageBody() body: string) {
    if (body[0] && body[1] && body[0][0] && body[0][1]) {
      const game = await this.prismaService.game.create({
        data: {
          player1Score: 0,
          player2Score: 0,
          player1Id: +body[0][0],
          mode: body[1] == "Classic" ? GameMode.CLASSIC : GameMode.RANDOM,
          player2Id: +body[0][1],
        },
      });
      this.server.to(body[0]).emit("gameInvitation", body[1], game.id);
    }
  }

  afterInit(server: Server, ...args: any[]) {
    server.of("/").adapter.on("delete-room", (room) => {
      console.log("room destroyed", room);
      server.emit("offline", room);
    });
  }
}
