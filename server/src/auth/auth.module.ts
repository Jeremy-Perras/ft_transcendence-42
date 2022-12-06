import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "../prisma/prisma.module";
import { CookieSerializer } from "./auth.serializer";
import { AuthService, LogOutService } from "./auth.service";
import { AuthStrategy } from "./auth.strategy";
import { AuthController } from "./auth.controller";
import { SocketModule } from "../socket/socket.module";

@Module({
  imports: [
    PassportModule.register({ session: true }),
    PrismaModule,
    SocketModule,
  ],
  providers: [AuthService, AuthStrategy, CookieSerializer, LogOutService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
