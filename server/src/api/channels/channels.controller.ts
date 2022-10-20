import { Controller, Get, Param } from "@nestjs/common";
import { ChannelsService } from "./channels.service";

@Controller("api/channels")
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  findAll() {
    return this.channelsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") name: string) {
    return this.channelsService.findOne(name);
  }

  @Get(":id/messages")
  findMessages(@Param("id") name: string) {
    return this.channelsService.findMessages(name);
  }
}
