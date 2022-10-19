import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./users.dto";
import { generateMock } from "@anatine/zod-mock";
import { UserSchema } from "shared";
import { userInfo } from "os";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll(query: string) {
    console.log(query);
    return `This action returns users with ${query}  `;
  }

  findOne(id: number) {
    let user = generateMock(UserSchema);
    user.id = id;
    return user;
  }

  me() {
    return generateMock(UserSchema);
  }
}
