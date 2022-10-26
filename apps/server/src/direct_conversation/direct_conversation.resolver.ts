import { Resolver, Query, Args } from "@nestjs/graphql";
import { CurrentUser } from "../auth/currentUser.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "../user/user.model";
import { DirectConversation } from "./direct_conversation.model";

@Resolver(DirectConversation)
export class DirectConversationResolver {
  constructor(private prisma: PrismaService) {}

  @Query((returns) => DirectConversation, { nullable: true })
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
