import { Controller, Get, Param, Query } from "@nestjs/common";
import { ChannelsService } from "./channels.service";

@Controller("api/channels")
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get(":id")
  getChannelById(@Param("id") id: number) {
    return this.channelsService.getChannelById(id);
  }

  @Get()
  getChannels(@Query("q") query: string) {
    return this.channelsService.getChannels(query);
  }
}
