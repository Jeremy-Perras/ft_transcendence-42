import { Controller, Get, Param } from "@nestjs/common";
import { MessagesService } from "./messages.service";

@Controller("api/messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  @Get("/user/:id")
  getDirectMessages(@Param("id") id: number) {
    return this.messagesService.getDirectMessages(id);
  }

  @Get("/channel/:channel")
  getChannelMessages(@Param("channel") channel: string) {
    return this.messagesService.getChannelMessages(channel);
  }
}
