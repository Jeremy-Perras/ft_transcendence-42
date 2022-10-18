import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Put,
  Delete,
} from "@nestjs/common";
import { CreateUserDto, UpdateUserDto } from "./users.dto";
import { UsersService } from "./users.service";

@Controller("api/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("oauth")
  oauth(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post("2fa")
  twofa(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get("me")
  me() {
    return this.usersService.me();
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(0, updateUserDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(":id/block")
  block(@Param("id") id: string) {
    return this.usersService.block(id);
  }

  @Delete(":id/block")
  unblock(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(":id/friend")
  friend(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Delete(":id/friend")
  unfriend(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Post("avatar")
  changeAvatar(@Body() body: any) {
    return this.usersService.findOne(0);
  }

  @Get("search/:query")
  findAll(@Param("query") query: string) {
    return this.usersService.findAll();
  }
}
