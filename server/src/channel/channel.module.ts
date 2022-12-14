import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import {
  ChannelMessageReadResolver,
  ChannelMessageResolver,
  ChannelResolver,
} from "./channel.resolver";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    ChannelResolver,
    ChannelMessageResolver,
    ChannelMessageReadResolver,
  ],
})
export class ChannelModule {}
