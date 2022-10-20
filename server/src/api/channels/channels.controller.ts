import { Controller, Get, Param, Query } from "@nestjs/common";
import { ChannelsService } from "./channels.service";

@Controller("api/channels")
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  findAll(@Query("q") query: string) {
    return this.channelsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") name: string) {
    return this.channelsService.findOne(name);
  }
}
