import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketModule } from "../socket/socket.module";
import { GameResolver } from "./game.resolver";
import { GameService } from "./game.service";

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), SocketModule],
  providers: [GameResolver, GameService],
  exports: [GameService],
})
export class GameModule {}
