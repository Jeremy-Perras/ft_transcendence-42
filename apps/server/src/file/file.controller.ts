import {
  Controller,
  FileTypeValidator,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Request,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request as ExpressRequest } from "express";
import { diskStorage } from "multer";
import test from "node:test";
import path, { extname } from "path";
import { of } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { AuthenticatedGuard } from "../auth/authenticated.guard";
import { FileService } from "./file.service";

export const storage = {
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      cb(null, true);
    } else {
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST
        ),
        false
      );
    }
  },
  limits: { fileSize: 100000 },
  storage: diskStorage({
    destination: "./uploads/useravatar",
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, "") + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

@Controller("/file")
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @UseGuards(AuthenticatedGuard)
  @Post("/upload")
  @UseInterceptors(FileInterceptor("file", storage))
  async uploadFile(
    @Request() req: ExpressRequest,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    const userId = req.user!;
    const user = await this.fileService.getUpdateAvatar(+userId, file.filename);
    return;
  }
}
