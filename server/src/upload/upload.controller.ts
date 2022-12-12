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
import { Request as ExpressRequest } from "express";
import { diskStorage } from "multer";
import path from "path";
import { AuthenticatedGuard } from "../auth/authenticated.guard";
import { UploadService } from "./upload.service";

@UseGuards(AuthenticatedGuard)
@Controller("/upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

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
      storage: diskStorage({
        destination: "./uploads/avatars/",
        filename: (req, file, cb) => {
          const filename =
            path.parse(file.originalname).name.replace(/\s/g, "") +
            Date.now() +
            req.user;
          const extension = path.parse(file.originalname).ext;
          cb(null, `${filename}${extension}`);
        },
      }),
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

    await this.uploadService.updateAvatar(+userId, file.filename);
  }
}
