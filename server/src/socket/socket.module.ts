import { forwardRef, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { GameModule } from "../game/game.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketGateway } from "./socket.gateway";

@Module({
  imports: [PrismaModule, forwardRef(() => GameModule)],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
