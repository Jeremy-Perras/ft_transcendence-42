import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SocketModule } from "../socket/socket.module";
import { UserService } from "../user/user.service";
import { UploadController } from "./upload.controller";

@Module({
  imports: [PrismaModule, SocketModule],
  providers: [UserService],
  controllers: [UploadController],
})
export class UploadModule {}
