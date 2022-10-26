import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async getFirstUser() {
    return await this.prismaService.user.findFirst();
  }
}
