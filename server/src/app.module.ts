import { join } from "path";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { AppGateway } from "./app.gateway";
import { AuthModule } from "./auth/auth.module";
import { ChannelService } from "./services/channel";
import { UserService } from "./services/user";
import { PrismaService } from "./prisma/prisma.service";
import { SocketService } from "./services/socket";

@Module({
  providers: [
    AppGateway,
    ChannelService,
    UserService,
    PrismaService,
    SocketService,
  ],
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../", "client/dist"), // TODO: use env var
      serveRoot: "/",
    }),
    AuthModule,
  ],
})
export class AppModule {}
