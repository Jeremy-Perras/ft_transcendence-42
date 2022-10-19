import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";

@Controller("api/messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.messagesService.findOne(+id);
  }
}
