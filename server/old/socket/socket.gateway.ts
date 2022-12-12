import { forwardRef, Inject } from "@nestjs/common";
import {
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

  onModuleInit() {
    this.server.on("connection", (socket) => {
      const [socketId, userId] = socket.rooms;
    });
  }

  handleConnection(client: Socket, ...args: any[]) {
    client.join(client.request.session.passport.user.toString());
  }

  @SubscribeMessage("event")
  handleEvent(client: Socket, data: string): string {
    return data;
  }
}
