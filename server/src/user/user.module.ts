import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketModule } from "../socket/socket.module";
import { DirectMessageResolver, UserResolver } from "./user.resolver";

@Module({
  imports: [PrismaModule, AuthModule, SocketModule],
  providers: [UserResolver, DirectMessageResolver],
})
export class UserModule {}
