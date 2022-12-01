import { Module } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";
import { SocketService } from "./socket.service";

@Module({
  providers: [SocketService, SocketGateway],
  exports: [SocketService],
})
export class SocketModule {}
