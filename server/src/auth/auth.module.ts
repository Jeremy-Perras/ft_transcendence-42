import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "../prisma/prisma.module";
import { CookieSerializer } from "./auth.serializer";
import { AuthService } from "./auth.service";
import { AuthStrategy } from "./auth.strategy";
import { AuthController } from "./auth.controller";

@Module({
  imports: [PassportModule.register({ session: true }), PrismaModule],
  providers: [AuthService, AuthStrategy, CookieSerializer],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
