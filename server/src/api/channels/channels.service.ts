import { generateMock } from "@anatine/zod-mock";
import { Injectable } from "@nestjs/common";
import { ChannelSchema } from "shared";

@Injectable()
export class ChannelsService {
  getChannels(query: string) {
    if (query == undefined) {
      const channel1 = generateMock(ChannelSchema);
      const channel2 = generateMock(ChannelSchema);
      const channel3 = generateMock(ChannelSchema);
      const channel4 = generateMock(ChannelSchema);
      const channel5 = generateMock(ChannelSchema);
      return { channel1, channel2, channel3, channel4, channel5 };
    } else {
      const channel1 = generateMock(ChannelSchema);
      channel1.name = query + "1";
      const channel2 = generateMock(ChannelSchema);
      channel2.name = query + "2";
      return { channel1, channel2 };
    }
  }

  getChannelById(id: number) {
    const channel = generateMock(ChannelSchema);
    return channel;
  }
}
