import { OnModuleInit } from "@nestjs/common";
import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway(8080, { cors: "*" })
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on("connection", (socket) => {
      console.log(socket.id);
      console.log("Connected");
    });
  }

  @SubscribeMessage("newMessage")
  onNewMessage(@MessageBody() body: any) {
    console.log(body);
    this.server.emit("onMessage", {
      msg: "New Message",
      content: body,
    });
  }
}
