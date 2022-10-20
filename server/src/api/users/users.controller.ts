import { Controller, Get, Param, Query } from "@nestjs/common";
import { UsersService } from "./users.service";

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
