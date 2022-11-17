import { OnModuleInit } from "@nestjs/common";
import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserService } from "./user.service";

@WebSocketGateway(8080, { cors: "*" })
export class MyGateway implements OnModuleInit {
  constructor(private userService: UserService) {}
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on("connection", (socket) => {
      console.log(socket.id);
      console.log("Connected");
    });
  }

  @SubscribeMessage("message")
  onNewMessage(@MessageBody() body: string) {
    console.log(body);
    this.server.emit("message", {
      msg: "New Message",
      content: body,
    });
  }
}
