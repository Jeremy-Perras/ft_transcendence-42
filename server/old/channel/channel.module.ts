import { Module } from "@nestjs/common";
import { AuthModule } from "../../src/auth/auth.module";
import { PrismaModule } from "../../src/prisma/prisma.module";
import { SocketModule } from "../socket/socket.module";
import { ChannelMessageResolver, ChannelResolver } from "./channel.resolver";

@Module({
  imports: [PrismaModule, AuthModule, SocketModule],
  providers: [ChannelResolver, ChannelMessageResolver],
})
export class ChannelModule {}
