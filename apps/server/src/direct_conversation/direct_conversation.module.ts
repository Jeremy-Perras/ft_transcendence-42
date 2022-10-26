import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { DirectConversationResolver } from "./direct_conversation.resolver";

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [DirectConversationResolver],
})
export class DirectConversationModule {}
