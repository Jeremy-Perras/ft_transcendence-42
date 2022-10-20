import { Controller, Get, Param } from "@nestjs/common";
import { MessagesService } from "./messages.service";

@Controller("api/messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
}
