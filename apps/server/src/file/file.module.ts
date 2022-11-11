import { Module } from "@nestjs/common";
import { FileService } from "./file.service";
import { FileController } from "./file.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [FileService],
  controllers: [FileController],
})
export class FileModule {}
