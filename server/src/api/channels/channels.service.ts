import { generateMock } from "@anatine/zod-mock";
import { Injectable } from "@nestjs/common";
import { ChannelSchema } from "shared";

@Injectable()
export class ChannelsService {
  findAll(query: string) {
    return `This action returns channels with name containing ${query}`;
  }

  findOne(name: string) {
    const channel = generateMock(ChannelSchema);
    channel.name = name;
    return channel;
  }
}
