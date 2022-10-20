import { generateMock } from "@anatine/zod-mock";
import { Injectable } from "@nestjs/common";
import { ChannelSchema } from "shared";

@Injectable()
export class ChannelsService {
  findAll() {
    return generateMock(ChannelSchema);
  }

  findOne(name: string) {
    const channel = generateMock(ChannelSchema);
    channel.name = name;
    return channel;
  }

  findMessages(name: string) {
    void name;
    return generateMock(ChannelSchema).messages;
  }
}
