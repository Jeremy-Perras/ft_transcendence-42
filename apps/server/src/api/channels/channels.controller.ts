import { Controller, Get, Param, Query, UseInterceptors } from "@nestjs/common";
import { SetInterceptor } from "../../interceptors/set.interceptor";
import { ChannelsService } from "./channels.service";

@UseInterceptors(SetInterceptor)
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
