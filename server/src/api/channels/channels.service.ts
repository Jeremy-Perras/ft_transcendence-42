import { generateMock } from "@anatine/zod-mock";
import { Injectable } from "@nestjs/common";
import { ChannelSchema } from "shared";

@Injectable()
export class ChannelsService {
  getChannels(query: string) {
    if (query == "") {
      const channel1 = generateMock(ChannelSchema);
      const channel2 = generateMock(ChannelSchema);
      const channel3 = generateMock(ChannelSchema);
      const channel4 = generateMock(ChannelSchema);
      const channel5 = generateMock(ChannelSchema);
      return { channel1, channel2, channel3, channel4, channel5 };
    }

    if (query == "2") {
      const channel1 = generateMock(ChannelSchema);
      channel1.name = query + "2";
      const channel2 = generateMock(ChannelSchema);
      channel2.name = query + "2";
      return { channel1, channel2 };
    }
    const channel1 = generateMock(ChannelSchema);
    channel1.name += "query";
    const channel2 = generateMock(ChannelSchema);
    channel2.name += "query";
    const channel3 = generateMock(ChannelSchema);
    channel3.name += "query";
    return { channel1, channel2, channel3 };
  }

  getChannelByName(name: string) {
    return generateMock(ChannelSchema, {
      strinMap: { name: () => `${name}` },
    });
  }
}
