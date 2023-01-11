import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { GameResolver } from "./game.resolver";
import { GameService } from "./game.service";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [GameResolver],
  exports: [GameService],
})
export class GameModule {}
