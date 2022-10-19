import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Put,
  Delete,
  Query,
} from "@nestjs/common";
import { CreateUserDto, UpdateUserDto, Userschema } from "./users.dto";
import { UsersService } from "./users.service";
import { ApiCreatedResponse } from "@nestjs/swagger";
@Controller("api/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  me() {
    return this.usersService.me();
  }

  @Get(":id")
  findOne(@Param("id") id: number) {
    return this.usersService.findOne(id);
  }

  @Get()
  findAll(@Query("q") query: string) {
    if (query) {
      return this.usersService.findAll(query);
    }
  }
}
