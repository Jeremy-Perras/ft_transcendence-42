import { Injectable, OnModuleInit } from "@nestjs/common";
import { io, Socket } from "socket.io-client";

@Injectable()
export class SocketClient implements OnModuleInit {
  public socketClient: Socket;
  constructor() {
    this.socketClient = io("http://localhost:8080");
  }
  onModuleInit() {
    this.event();
  }

  private event() {
    this.socketClient.emit("message", { msg: "hi" });
    this.socketClient.on("connect", () => {
      console.log("id", this.socketClient.id);
    });
    this.socketClient.on("message", (playload: any) => console.log(playload));
  }
}
