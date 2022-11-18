import { OnModuleInit } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { use } from "passport";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { GatewayService } from "./gateway.service";

const ConnectedUsers: Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>[] = [];
@WebSocketGateway(8080, { cors: "*" })
export class MyGateway implements OnModuleInit {
  constructor(private gatewayService: GatewayService) {}
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on("connection", (socket) => {
      ConnectedUsers.push(socket);
      console.log("Connected");

      socket.on("disconnect", async (reason) => {
        console.log(socket.id + " disconnected :" + reason);
        const indexOfSocket = ConnectedUsers.findIndex((object) => {
          return object.id === socket.id;
        });
        ConnectedUsers.splice(indexOfSocket, 1);
        const users = await this.gatewayService.getUsers();
        users?.forEach(async (user) => {
          if (user.socket === socket.id && user.socket) {
            console.log(user.socket, socket.id);
            await this.gatewayService.updateSocket(user.id);
          }
        });
      });
    });
  }

  // body : [`dest`,`author`]
  @SubscribeMessage("newDirectMessageSent")
  async onNewDirectMessage(@MessageBody() body: string) {
    console.log(`New direct message to ${body[0]} from ${body[1]}`);
    const user = await this.gatewayService.getUserById(+body[0]!);
    ConnectedUsers.forEach((userSocket) => {
      //TO DO: emit only to socket corresponding to recipient
      if (userSocket.id === user?.socket) {
        console.log(user?.socket, userSocket.id);
        userSocket.emit("NewDirectMessage", body);
      }
    });
  }

  // body: `channelId`;
  @SubscribeMessage("newChannelMessageSent")
  async onNewChannelMessage(@MessageBody() body: string) {
    console.log("New channel message on channel" + body);
    const channel = await this.gatewayService.getChannel(+body);
    const users = await this.gatewayService.getUsers();
    console.log(channel);
    ConnectedUsers.forEach((userSocket) => {
      console.log(userSocket.id);
      channel?.members.forEach(async (user) => {
        const u = await this.gatewayService.getUserById(user.userId);
        if (u?.socket === userSocket.id) {
          userSocket.emit("NewChannelMessage", body);
        }
      });
    });
  }

  @SubscribeMessage("sendingInvitation")
  async onSendingInvitation(@MessageBody() body: number) {
    console.log("Invitation to " + body);
    const u = await this.gatewayService.getUserById(body);
    ConnectedUsers.forEach((userSocket) => {
      console.log(userSocket.id);
      if (u?.socket === userSocket.id) {
        userSocket.emit("sendingInvitation", body);
      }
    });
  }
}
