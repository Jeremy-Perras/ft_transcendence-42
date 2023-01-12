import { forwardRef, Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { GameModule } from "../game/game.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketGateway } from "./socket.gateway";
import { SocketService } from "./socket.service";

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => GameModule),
    ScheduleModule.forRoot(),
  ],
  providers: [SocketService, SocketGateway],
  exports: [SocketService],
})
export class SocketModule {}
