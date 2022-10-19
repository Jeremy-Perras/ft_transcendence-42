import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { UpdateChannelDto } from "./dto/update-channel.dto";

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
