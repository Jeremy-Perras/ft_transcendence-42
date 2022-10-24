import { Injectable } from "@nestjs/common";
import { generateMock } from "@anatine/zod-mock";
import { MessageSchema } from "@shared/schemas";

@Injectable()
export class MessagesService {
  getDirectMessages(userId: number) {
    const message1 = generateMock(MessageSchema);
    message1.author.name = "Direct chat test user";
    const message2 = generateMock(MessageSchema);
    message2.author.name = "Direct chat test user";
    const message3 = generateMock(MessageSchema);
    message3.author.name = "Direct chat test user";
    return { message1, message2, message3 };
  }

  getChannelMessages(channelId: number) {
    const message1 = generateMock(MessageSchema);
    const message2 = generateMock(MessageSchema);
    const message3 = generateMock(MessageSchema);
    const message4 = generateMock(MessageSchema);
    const message5 = generateMock(MessageSchema);
    const message6 = generateMock(MessageSchema);

    return { message1, message2, message3, message4, message5, message6 };
  }
}
