import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { generateMock } from "@anatine/zod-mock";
import { UserSchema } from "@shared/schemas";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getUsers(query: string) {
    if (query == undefined) {
      const user1 = generateMock(UserSchema);
      const user2 = generateMock(UserSchema);
      const user3 = generateMock(UserSchema);
      const user4 = generateMock(UserSchema);
      const user5 = generateMock(UserSchema);
      return { user1, user2, user3, user4, user5 };
    }

    const user1 = generateMock(UserSchema);
    const user2 = generateMock(UserSchema);
    const user3 = generateMock(UserSchema);
    user1.name = query + "1";
    user2.name = query + "2";
    user3.name = query + "3";
    return {
      user1,
      user2,
      user3,
    };
  }

  getUserById(id: number) {
    const user = generateMock(UserSchema);
    user.id = id;
    return user;
  }

  me() {
    return generateMock(UserSchema);
  }
}
