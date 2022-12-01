import { SocketAction } from "@apps/shared";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { sortFns } from "@tanstack/react-query-devtools/build/lib/utils";
import { Server, Socket } from "socket.io";
import { SocketService } from "./socket.service";

@WebSocketGateway({ cors: "*" })
export class SocketGateway {
  constructor(private socketService: SocketService) {}
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    client.join(client.request.session.passport.user.toString());
    this.server
      .to(client.request.session.passport.user.toString())
      .emit("test");
  }

  @SubscribeMessage(SocketAction.DIRECT_MESSAGE)
  async onNewDirectMessage(@MessageBody() body: string) {}
}
