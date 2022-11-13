import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import {
  ChannelMessageReadResolver,
  ChannelMessageResolver,
  ChannelResolver,
} from "./channel.resolver";
import { ChannelService } from "./channel.service";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    ChannelResolver,
    ChannelMessageResolver,
    ChannelMessageReadResolver,
    ChannelService,
  ],
})
export class ChannelModule {}
