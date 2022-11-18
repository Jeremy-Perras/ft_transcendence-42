import { Injectable } from "@nestjs/common";
import { channelType } from "./channel.model";

@Injectable()
export class ChannelService {
  returnChannel(channel: {
    id: number;
    name: string;
    inviteOnly: boolean;
    password: string | null;
  }): channelType {
    return {
      id: channel.id,
      name: channel.name,
      passwordProtected: !!channel.password,
      private: channel.inviteOnly,
    };
  }
}
