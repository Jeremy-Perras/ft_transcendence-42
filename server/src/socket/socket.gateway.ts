import { InvalidCacheTarget } from "@apps/shared";
import { forwardRef, Inject } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SocketService } from "./socket.service";

@WebSocketGateway({ cors: "*" })
export class SocketGateway {
  constructor(
    @Inject(forwardRef(() => SocketService))
    private socketService: SocketService
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    client.join(client.request.session.passport.user.toString());
  }
}
