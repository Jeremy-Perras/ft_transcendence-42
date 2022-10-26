import { join } from "path";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { FakeAuthGuard } from "./auth/fake.guard";
import { APP_GUARD } from "@nestjs/core";
import { UserModule } from "./user/user.module";
import { ChannelModule } from "./channel/channel.module";
import { DirectConversationModule } from "./direct_conversation/direct_conversation.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../", "client/dist"),
      exclude: ["/graphql"],
    }),
    UserModule,
    ChannelModule,
    DirectConversationModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      buildSchemaOptions: { dateScalarMode: "timestamp" },
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FakeAuthGuard,
    },
  ],
})
export class AppModule {}
