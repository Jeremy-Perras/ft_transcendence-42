import { join, resolve } from "path";
import { DynamicModule, Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { UserModule } from "./user/user.module";
import { ChannelModule } from "./channel/channel.module";
import { GameModule } from "./game/game.module";
import { AuthModule } from "./auth/auth.module";
import { UploadModule } from "./upload/upload.module";
import { SocketModule } from "./socket/socket.module";
import { DataLoaderInterceptor } from "./dataloader";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { EventEmitterModule } from "@nestjs/event-emitter";

const serveStaticModule: DynamicModule[] = [];
if (process.env.NODE_ENV === "production") {
  serveStaticModule.push(
    ServeStaticModule.forRoot({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      rootPath: resolve(process.env.npm_config_local_prefix!, "client/dist"),
      serveRoot: "/",
    })
  );
}

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
  imports: [
    EventEmitterModule.forRoot(),
    ...serveStaticModule,
    SocketModule,
    AuthModule,
    UserModule,
    GameModule,
    ChannelModule,
    UploadModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      definitions: { emitTypenameField: true },
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      buildSchemaOptions: {
        dateScalarMode: "isoDate",
      },
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
  ],
})
export class AppModule {}
