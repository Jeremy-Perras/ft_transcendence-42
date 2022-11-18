import { join } from "path";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { UserModule } from "./user/user.module";
import { ChannelModule } from "./channel/channel.module";
import { GameModule } from "./game/game.module";
import { AuthModule } from "./auth/auth.module";
import { FileModule } from "./file/file.module";
import { GatewayModule } from "./gateway/gateway.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../", "client/dist"),
      serveRoot: "/",
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../uploads"),
      serveRoot: "/uploads",
    }),

    AuthModule,
    GatewayModule,
    UserModule,
    GameModule,
    ChannelModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      definitions: { emitTypenameField: true },
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      buildSchemaOptions: {
        dateScalarMode: "timestamp",
      },
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    FileModule,
  ],
})
export class AppModule {}
