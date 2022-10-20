import { Controller, Get, Param, Query } from "@nestjs/common";
import { MessagesService } from "./messages.service";

@Controller("api/messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  @Get()
  findDirectMessages(@Query("u") query: number) {
    if (query) {
      return this.messagesService.findDirectMessages(query);
    }
  }

  @Get()
  findChannelMessages(@Query("c") query: string) {
    if (query) {
      return this.messagesService.findChannelMessages(query);
    }
  }
}
