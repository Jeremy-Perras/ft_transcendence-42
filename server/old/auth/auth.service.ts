import { InvalidCacheTarget } from "@apps/shared";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SocketService } from "../../old/socket/socket.service";

@Injectable()
export class LogOutService {
  constructor(
    private prismaService: PrismaService,
    private socketService: SocketService
  ) {}

  private readonly logger = new Logger(LogOutService.name);

  async getUserById(userId: number) {
    try {
      const users = await this.prismaService.user.findFirst({
        select: { friends: { select: { id: true } } },
        where: { id: userId },
      });
      if (users) {
        this.socketService.emitInvalidateCache(
          InvalidCacheTarget.LOGOUT,
          users?.friends.map((u) => u.id),
          userId
        );
      }
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
