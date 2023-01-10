import { EventEmitter2 } from "@nestjs/event-emitter";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: "*" })
export class SocketGateway {
  constructor(private eventEmitter: EventEmitter2) {}

  @WebSocketServer()
  private server: Server;

  private connectedUsers: Map<number, string> = new Map();

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
