import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "../prisma/prisma.module";
import { CookieSerializer } from "./auth.serializer";
import { AuthController } from "./auth.controller";
import { SocketModule } from "../socket/socket.module";
import { UserModule } from "../user/user.module";
import { AuthStrategy } from "./login.guard";

@Module({
  imports: [
    PassportModule.register({ session: true }),
    PrismaModule,
    SocketModule,
    UserModule,
  ],
  providers: [AuthStrategy, CookieSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
