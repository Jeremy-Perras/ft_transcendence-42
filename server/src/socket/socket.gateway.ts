import { OnModuleInit } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: "*" })
export class SocketGateway implements OnModuleInit {
  constructor(private eventEmitter: EventEmitter2) {}

  @WebSocketServer()
  private server: Server;

  private connectedUsers: Map<number, string> = new Map();

  onModuleInit() {
    this.server.on("connection", (client) => {
      client.on("getstatus", (callback) => {
        const userId = client.request.session.passport.user;
        const user = this.connectedUsers.get(userId);
        if (!user) {
          callback({
            status: "ok",
          });
          this.connectedUsers.set(userId, client.id);
          this.eventEmitter.emit("user.connection", userId);
        } else {
          callback({
            status: "You are already connected on another device",
          });
        }
      });
    });
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
