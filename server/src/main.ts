import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import session from "express-session";
import passport from "passport";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./prisma/prisma.exception";

async function bootstrap() {
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
  app.use(
    session({
      // TODO: don't use memory store in production
      secret: "keyboard", // TODO: use env variable
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(3000);
}
bootstrap();
