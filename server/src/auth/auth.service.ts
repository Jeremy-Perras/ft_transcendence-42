import { InvalidCacheTarget } from "@apps/shared";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SocketService } from "../socket/socket.service";

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  private readonly logger = new Logger(AuthService.name);

  async getUserById(userId: number) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { id: userId },
      });
      return user;
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
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
