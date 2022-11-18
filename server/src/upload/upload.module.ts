import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";

@Module({
  imports: [PrismaModule],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
