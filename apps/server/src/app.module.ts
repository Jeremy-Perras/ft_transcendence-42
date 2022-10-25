import { join } from "path";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { GraphQLModule } from "@nestjs/graphql";
import { PrismaService } from "./prisma.service";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { UserResolver } from "./user/user.resolver";
import { MessageResolver } from "./message/message.resolver";
import { ChannelResolver } from "./channel/channel.resolver";
import { ChatResolver } from "./chat/chat.resolver";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../", "client/dist"),
      exclude: ["/graphql"],
    }),
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
    PrismaService,
    UserResolver,
    MessageResolver,
    ChatResolver,
    ChannelResolver,
  ],
})
export class AppModule {}
