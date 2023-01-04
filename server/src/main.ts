import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import session from "express-session";
import passport from "passport";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./prisma/prisma.exception";
import { ExpressIoAdapter } from "./socket/socket.adapter";

async function bootstrap() {
  if (!process.env.npm_config_local_prefix) {
    throw new Error("npm_config_local_prefix env variable is not set");
  }
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET env variable is not set");
  }

  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === "development"
        ? ["log", "error", "warn", "debug", "verbose"]
        : ["error", "warn"],
    cors: true,
  });

  app.useGlobalFilters(new PrismaExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MemoryStore = require("memorystore")(session);
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  });

  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  const expressIoAdapter = new ExpressIoAdapter(app, sessionMiddleware);
  app.useWebSocketAdapter(expressIoAdapter);

  await app.listen(3000);
}
bootstrap();
