import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChannelService {
  constructor(private prismaService: PrismaService) {}

  async getUserById(userId: number) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { id: userId },
      });
      return user;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async getChannelById(userId: number) {
    try {
      const user = await this.prismaService.channel.findFirst({
        select: { admins: true, owner: true, banned: true, password: true },
        where: { id: userId },
      });

      return user;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
