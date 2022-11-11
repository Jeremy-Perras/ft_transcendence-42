import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FileService {
  constructor(private prismaService: PrismaService) {}

  async getUpdateAvatar(userId: number | undefined, filename: string) {
    try {
      const user = await this.prismaService.user.update({
        select: { avatar: true },
        where: { id: userId },
        data: {
          avatar: "http://localhost:3000/uploads/useravatar/" + filename,
        },
      });
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
