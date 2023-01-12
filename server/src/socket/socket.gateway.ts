import { EventEmitter2 } from "@nestjs/event-emitter";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: "*" })
export class SocketGateway {
  constructor(private eventEmitter: EventEmitter2) {}

  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<number, string> = new Map();

  handleConnection(client: Socket, ...args: any[]) {
    const userId = client.request.session.passport.user;
    const user = this.connectedUsers.get(userId);
    if (user) client.disconnect();
    else this.connectedUsers.set(userId, client.id);
  }

  handleDisconnect(client: Socket) {
    const userId = client.request.session.passport.user;
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.connectedUsers.delete(userId);
      this.eventEmitter.emit("user.offline", { userId });

      // if (user.length === 1) {
      // } else {
      //   const index = user.indexOf(client.id);
      //   if (index > -1) {
      //     user.splice(index, 1);
      //     this.connectedUsers.set(userId, user);
      //   }
      // }
    }
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
