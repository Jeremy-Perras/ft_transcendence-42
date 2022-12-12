import { Strategy } from "passport-custom";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Logger } from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, "auth") {
  constructor(private prismaService: PrismaService) {
    super();
  }

  private readonly logger = new Logger(AuthStrategy.name);

  async validate(req: Request): Promise<number | undefined> {
    try {
      const id = +req.body.id;
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });
      return user?.id;
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
