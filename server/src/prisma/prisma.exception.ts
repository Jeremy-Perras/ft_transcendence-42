import { ExceptionFilter, Catch, BadRequestException } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(e: PrismaClientKnownRequestError) {
    throw new BadRequestException("Invalid input");
    // throw new BadRequestException("Invalid input", JSON{
    //   exception: {
    //     message: e.message,
    //     stacktrace: e.stack,
    //     prisma: e,
    //   },
    // });
  }
}
