import { Module } from "@nestjs/common";
import { MessagesModule } from "./api/messages/messages.module";
import { ChannelsModule } from "./api/channels/channels.module";
import { UsersModule } from "./api/users/users.module";
import { GamesModule } from "./api/games/games.module";
import { join } from "path";
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../", "client/dist"),
      exclude: ["/api*"],
    }),
    MessagesModule,
    ChannelsModule,
    UsersModule,
    GamesModule,
  ],
})
export class AppModule {}
