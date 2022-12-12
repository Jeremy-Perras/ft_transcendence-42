import { NestFactory } from "@nestjs/core";
import session from "express-session";
import passport from "passport";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./prisma/prisma.exception";
import { ExpressIoAdapter } from "./socket.adapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === "development"
        ? ["log", "error", "warn", "debug", "verbose"]
        : ["error", "warn"],
    cors: true,
  });

  app.useGlobalFilters(new PrismaExceptionFilter());

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //   })
  // );

  // TODO: don't use memory store in production
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET ?? "dev", // TODO: verify this
    resave: false,
    saveUninitialized: false,
  });
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
  const expressIoAdapter = new ExpressIoAdapter(app, sessionMiddleware);
  app.useWebSocketAdapter(expressIoAdapter);

  await app.listen(3000);
}
bootstrap();
