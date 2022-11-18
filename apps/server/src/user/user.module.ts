import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { DirectMessageResolver, UserResolver } from "./user.resolver";
import { UserService } from "./user.service";
// import { MyGateway } from "./chat.gateway";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [UserResolver, DirectMessageResolver, UserService],
})
export class UserModule {}
