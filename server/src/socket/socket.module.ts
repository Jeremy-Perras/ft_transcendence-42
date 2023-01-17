import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketGateway } from "./socket.gateway";

@Module({
  imports: [PrismaModule],
  providers: [SocketGateway],
})
export class SocketModule {}
