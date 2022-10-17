import { Module } from "@nestjs/common";
import { join } from "path";
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../../", "client/dist"),
      exclude: ["/api/*"],
    }),
  ],
})
export class AppModule {}
