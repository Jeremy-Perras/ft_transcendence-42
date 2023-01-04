import {
  Controller,
  Request,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UnsupportedMediaTypeException,
  UnauthorizedException,
  Get,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImageFileType } from "@prisma/client";
import { Request as ExpressRequest } from "express";
import { AuthenticatedGuard } from "../auth/authenticated.guard";
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "../user/user.service";

@UseGuards(AuthenticatedGuard)
@Controller("/upload")
export class UploadController {
  constructor(
    private readonly userService: UserService,
    private prismaService: PrismaService
  ) {}

  @Get("/avatar:id")
  async avatar(@Param("id") id: string) {
    try {
      return await this.prismaService.avatar.findUnique({
        where: {
          userId: +id,
        },
      });
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  @Post("/avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: (_, file, cb) => {
        if (file.mimetype.match(/\/(jpg|png)$/)) {
          cb(null, true);
        } else {
          cb(new UnsupportedMediaTypeException(), false);
        }
      },
      limits: { fileSize: 100000 },
    })
  )
  async uploadAvatar(
    @Request() req: ExpressRequest,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    const userId = req.user;

    if (!userId) {
      throw new UnauthorizedException();
    }

    const type = file.mimetype.match(/\/(jpg)$/)
      ? ImageFileType.JPG
      : ImageFileType.PNG;

    await this.userService.updateAvatar(+userId, type, file.buffer);
  }
}
