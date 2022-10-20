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
  getUserById(@Param("id") id: number) {
    return this.usersService.getUserById(id);
  }

  @Get() getUsers(@Query("q") query: string) {
    return this.usersService.getUsers(query);
  }
}
