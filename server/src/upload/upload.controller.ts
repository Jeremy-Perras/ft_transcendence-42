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
  StreamableFile,
  Res,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImageFileType } from "@prisma/client";
import { Request as ExpressRequest, Response } from "express";
import { AuthenticatedGuard } from "../auth/authenticated.guard";
import { PrismaService } from "../prisma/prisma.service";

@UseGuards(AuthenticatedGuard)
@Controller("/upload")
export class UploadController {
  constructor(private prismaService: PrismaService) {}

  @Get("/avatar/:id")
  async avatar(
    @Param("id") id: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile | undefined> {
    try {
      const c = await this.prismaService.avatar.findUnique({
        where: {
          userId: +id,
        },
      });
      res.set({
        "Content-Type": `image/${c?.fileType.toLowerCase()}`,
      });
      if (c?.image) return new StreamableFile(c?.image);
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

    try {
      await this.prismaService.avatar.update({
        where: { userId: +userId },
        data: { fileType: type, image: file.buffer },
      });
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }
}
