import { InvalidCacheTarget } from "@apps/shared";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SocketService } from "../socket/socket.service";

@Injectable()
export class UploadService {
  constructor(
    private prismaService: PrismaService,
    private socketService: SocketService
  ) {}

  private readonly logger = new Logger(UploadService.name);

  async updateAvatar(userId: number, filename: string) {
    try {
      await this.prismaService.user.update({
        select: { avatar: true },
        where: { id: userId },
        data: {
          avatar: filename,
        },
      });

      const friend = await this.prismaService.user.findMany({
        select: { id: true },
        where: { friendedBy: { some: { id: userId } } },
      });
      this.socketService.emitInvalidateCache(
        InvalidCacheTarget.AVATAR_USER,
        friend.map((f) => f.id),
        userId
      );
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
