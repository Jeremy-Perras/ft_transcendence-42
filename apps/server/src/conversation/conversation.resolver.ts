import { Resolver, Query, Args } from "@nestjs/graphql";
import { CurrentUser } from "../auth/currentUser.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "../user/user.model";
import { Conversation } from "./conversation.model";

@Resolver(Conversation)
export class ConversationResolver {
  constructor(private prisma: PrismaService) {}

  @Query((returns) => Conversation, { nullable: true })
  async getMessages(@CurrentUser() me: User, @Args("userId") userId: number) {
    const messages = await this.prisma.directMessage.findMany({
      include: { author: true, recipient: true },
      where: {
        OR: [
          {
            authorId: me.id,
            recipientId: userId,
          },
          { authorId: userId, recipientId: me.id },
        ],
      },
    });
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return {
      user,
      messages,
    };
  }
}
