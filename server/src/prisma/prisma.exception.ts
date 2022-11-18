import { ExceptionFilter, Catch } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { UserInputError } from "apollo-server-express";

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(e: PrismaClientKnownRequestError) {
    throw new UserInputError("Invalid input", {
      exception: {
        message: e.message,
        stacktrace: e.stack,
        prisma: e,
      },
    });
  }
}
