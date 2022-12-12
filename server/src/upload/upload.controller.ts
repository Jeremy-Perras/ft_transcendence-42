import { InvalidCacheTarget } from "@apps/shared";
import {
  Controller,
  Request,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UnsupportedMediaTypeException,
  UnauthorizedException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImageFileType } from "@prisma/client";
import { Request as ExpressRequest } from "express";
import { diskStorage } from "multer";
import path from "path";
import { AuthenticatedGuard } from "../auth/authenticated.guard";
import { SocketService } from "../socket/socket.service";
import { UserService } from "../user/user.service";

@UseGuards(AuthenticatedGuard)
@Controller("/upload")
export class UploadController {
  constructor(
    private readonly userService: UserService,
    private socketservice: SocketService
  ) {}

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
    this.socketservice.emitInvalidateCacheAll(+userId, InvalidCacheTarget.USER);
  }
}
