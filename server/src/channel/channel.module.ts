import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketModule } from "../socket/socket.module";
import { ChannelMessageResolver, ChannelResolver } from "./channel.resolver";

@Module({
  imports: [PrismaModule, AuthModule, SocketModule],
  providers: [ChannelResolver, ChannelMessageResolver],
})
export class ChannelModule {}
