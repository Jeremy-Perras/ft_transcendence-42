import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UploadService {
  constructor(private prismaService: PrismaService) {}

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
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
