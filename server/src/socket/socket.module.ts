import { forwardRef, Module } from "@nestjs/common";
import { GameModule } from "../game/game.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketGateway } from "./socket.gateway";

@Module({
  imports: [PrismaModule, forwardRef(() => GameModule)],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
