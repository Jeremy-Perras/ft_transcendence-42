import { Controller, Get, Param } from "@nestjs/common";
import { MessagesService } from "./messages.service";

@Controller("api/messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  @Get("/user/:id")
  getDirectMessages(@Param("id") userId: number) {
    return this.messagesService.getDirectMessages(userId);
  }

  @Get("/channel/:id")
  getChannelMessages(@Param("id") channelId: number) {
    return this.messagesService.getChannelMessages(channelId);
  }
}
