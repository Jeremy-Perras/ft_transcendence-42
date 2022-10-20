import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { generateMock } from "@anatine/zod-mock";
import { UserSchema } from "shared";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll(query: string) {
    return `This action returns all users name ${query}`;
  }

  findOne(id: number) {
    const user = generateMock(UserSchema);
    user.id = id;
    return user;
  }

  me() {
    return generateMock(UserSchema);
  }
}
