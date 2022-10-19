import { generateMock } from "@anatine/zod-mock";
import { Injectable } from "@nestjs/common";
import { channel } from "diagnostics_channel";
import { ChannelSchema, MessageSchema } from "shared";

@Injectable()
export class ChannelsService {
  findAll() {
    return `This action returns all channels`;
  }

  findOne(name: string) {
    let channel = generateMock(ChannelSchema);
    //TODO compilation issue from ChannelSchema
    return channel;
  }
  findMessages(name: string) {
    return generateMock(ChannelSchema).messages;
  }
}
