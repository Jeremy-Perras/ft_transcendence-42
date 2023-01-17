import { ExceptionFilter, Catch, BadRequestException } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(e: PrismaClientKnownRequestError) {
    throw new BadRequestException("Invalid input");
  }
}
