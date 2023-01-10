import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GameModule } from "../game/game.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketModule } from "../socket/socket.module";
import {
  AchivementsLoader,
  BlockedByIdsLoader,
  BlockingIdsLoader,
  DirectMessagesReceivedLoader,
  DirectMessagesSentLoader,
  FriendedByIdsLoader,
  FriendIdsLoader,
  UserChannelIdsLoader,
  UserLoader,
} from "./user.loaders";
import { DirectMessageResolver, UserResolver } from "./user.resolver";
import { UserService } from "./user.service";

@Module({
  imports: [PrismaModule, AuthModule, SocketModule, GameModule],
  providers: [
    UserResolver,
    DirectMessageResolver,
    UserService,
    UserLoader,
    FriendedByIdsLoader,
    FriendIdsLoader,
    BlockedByIdsLoader,
    BlockingIdsLoader,
    AchivementsLoader,
    UserChannelIdsLoader,
    DirectMessagesSentLoader,
    DirectMessagesReceivedLoader,
  ],
  exports: [
    UserService,
    UserLoader,
    FriendedByIdsLoader,
    FriendIdsLoader,
    BlockedByIdsLoader,
    BlockingIdsLoader,
    AchivementsLoader,
    UserChannelIdsLoader,
    DirectMessagesSentLoader,
    DirectMessagesReceivedLoader,
  ],
})
export class UserModule {}
