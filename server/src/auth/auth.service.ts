import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

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
