import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  getGameModes() {
    return this.prisma.gameMode.findMany();
  }
}
