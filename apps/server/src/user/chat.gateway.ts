import { OnModuleInit } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { UserService } from "./user.service";

const ConnectedUsers: Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>[] = [];
@WebSocketGateway(8080, { cors: "*" })
export class MyGateway implements OnModuleInit {
  constructor(private userService: UserService) {}
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on("connection", (socket) => {
      ConnectedUsers.push(socket);
      console.log("Connected");
      socket.on("disconnect", (reason) => {
        console.log(socket.id + " disconnected :" + reason);
        const indexOfSocket = ConnectedUsers.findIndex((object) => {
          return object.id === socket.id;
        });
        ConnectedUsers.splice(indexOfSocket, 1);
      });
    });
  }

  // body : [`dest`,`author`]
  @SubscribeMessage("newDirectMessageSent")
  onNewDirectMessage(@MessageBody() body: string) {
    console.log(`New direct message to ${body[0]} from ${body[1]}`);
    ConnectedUsers.forEach((userSocket) => {
      console.log(userSocket.id);
      //TO DO: emit only to socket corresponding to recipient
      userSocket.emit("NewDirectMessage", body);
    });
  }

  // body : `channelId`
  @SubscribeMessage("newChannelMessageSent")
  onNewChannelMessage(@MessageBody() body: string) {
    console.log("New channel message on channel" + body);
    ConnectedUsers.forEach((userSocket) => {
      console.log(userSocket.id);
      //TO DO: emit only to users in corresponding channel
      userSocket.emit("NewChannelMessage", body);
    });
  }
}
