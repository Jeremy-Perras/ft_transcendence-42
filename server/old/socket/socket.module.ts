import { Module } from "@nestjs/common";
import { PrismaModule } from "../../src/prisma/prisma.module";
import { SocketGateway } from "./socket.gateway";
import { SocketService } from "./socket.service";

@Module({
  imports: [PrismaModule],
  providers: [SocketService, SocketGateway],
  exports: [SocketService],
})
export class SocketModule {}
