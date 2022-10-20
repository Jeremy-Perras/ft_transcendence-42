import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { generateMock } from "@anatine/zod-mock";
import { MessageSchema } from "shared";
import { Userschema } from "../users/users.dto";

@Injectable()
export class MessagesService {
  findDirectMessages(query: number) {
    return generateMock(MessageSchema);
  }

  findChannelMessages(query: string) {
    return generateMock(MessageSchema);
  }
}
