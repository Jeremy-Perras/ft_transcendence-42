import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getUserById(userId: number) {
    try {
      const user = await this.prismaService.user.findFirst({
        select: { blockedBy: true, socket: true },
        where: { id: userId },
      });
      return user;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async getUsers() {
    try {
      const users = await this.prismaService.user.findMany({
        select: { blockedBy: true, socket: true, id: true, name: true },
      });
      return users;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
  async getChannel(channelId: number) {
    try {
      const channel = await this.prismaService.channel.findUnique({
        select: { id: true, members: true },
        where: { id: channelId },
      });
      return channel;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async updateSocket(userId: number) {
    try {
      const user = await this.prismaService.user.update({
        select: { blockedBy: true, socket: true },
        where: { id: userId },
        data: { socket: null },
      });
      return user;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
