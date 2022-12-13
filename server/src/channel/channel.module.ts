import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketModule } from "../socket/socket.module";

import {
  ChannelLoader,
  ChannelMembersLoader,
  ChannelMessageReadIdsLoader,
  ChannelMessagesLoader,
  ChannelRestrictedUserLoader,
} from "./channel.loaders";
import { ChannelMessageResolver, ChannelResolver } from "./channel.resolver";
import { ChannelService } from "./channel.service";

@Module({
  imports: [PrismaModule, AuthModule, SocketModule],
  providers: [
    ChannelResolver,
    ChannelMessageResolver,
    ChannelService,
    ChannelLoader,
    ChannelMembersLoader,
    ChannelRestrictedUserLoader,
    ChannelMessagesLoader,
    ChannelMessageReadIdsLoader,
  ],
  exports: [
    ChannelService,
    ChannelLoader,
    ChannelMembersLoader,
    ChannelRestrictedUserLoader,
    ChannelMessagesLoader,
    ChannelMessageReadIdsLoader,
  ],
})
export class ChannelModule {}
