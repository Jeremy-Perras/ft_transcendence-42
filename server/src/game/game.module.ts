import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { GameResolver } from "./game.resolver";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [GameResolver],
})
export class GameModule {}
