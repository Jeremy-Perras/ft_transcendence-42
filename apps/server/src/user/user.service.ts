import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getUserById(userId: number) {
    try {
      const user = await this.prismaService.user.findFirst({
        select: { blockedBy: true },
        where: { id: userId },
      });
      return user;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
