import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ConversationResolver } from "./conversation.resolver";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ConversationResolver],
})
export class ConversationModule {}
