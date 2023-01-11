import { forwardRef, Module } from "@nestjs/common";
import { GameModule } from "../game/game.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketGateway } from "./socket.gateway";
import { SocketService } from "./socket.service";

@Module({
  imports: [PrismaModule, forwardRef(() => GameModule)],
  providers: [SocketService, SocketGateway],
  exports: [SocketService],
})
export class SocketModule {}
