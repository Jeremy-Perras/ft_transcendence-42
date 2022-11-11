import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import path from "path";
import { of } from "rxjs";
import { v4 as uuidv4 } from "uuid";
export const storage = {
  storage: diskStorage({
    destination: "./uploads/profileimages",
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
  @Post("/upload")
  @UseInterceptors(FileInterceptor("file", storage))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return of({ imagePath: file.path });
  }
}
