import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketModule } from "../socket/socket.module";
import {
  AchivementsLoader,
  AvatarLoader,
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
  imports: [PrismaModule, AuthModule, SocketModule],
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
    AvatarLoader,
    UserChannelIdsLoader,
    DirectMessagesSentLoader,
    DirectMessagesReceivedLoader,
  ],
  exports: [UserService],
})
export class UserModule {}
