import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { generateMock } from "@anatine/zod-mock";
import { UserSchema } from "shared";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getUsers(query: string) {
    if (query == undefined) {
      let user1 = generateMock(UserSchema);
      let user2 = generateMock(UserSchema);
      let user3 = generateMock(UserSchema);
      let user4 = generateMock(UserSchema);
      let user5 = generateMock(UserSchema);
      return { user1, user2, user3, user4, user5 };
    }

    let user1 = generateMock(UserSchema);
    let user2 = generateMock(UserSchema);
    let user3 = generateMock(UserSchema);
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
