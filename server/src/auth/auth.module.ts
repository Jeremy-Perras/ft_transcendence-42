import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "../prisma/prisma.module";
import { CookieSerializer } from "./auth.serializer";
import { AuthController } from "./auth.controller";
import { AuthStrategy } from "./auth.strategy";

@Module({
  imports: [PassportModule.register({ session: true }), PrismaModule],
  providers: [AuthStrategy, CookieSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
