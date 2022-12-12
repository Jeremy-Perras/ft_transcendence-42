import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketModule } from "../socket/socket.module";
import { SocketService } from "../socket/socket.service";
import { UploadController } from "./upload.controller";

@Module({
  imports: [PrismaModule, SocketModule],
  controllers: [UploadController],
})
export class UploadModule {}
