import { Inject } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { PrismaService } from "../prisma.service";
import { Chat } from "./chat.model";

@Resolver(Chat)
export class ChatResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  @Query((returns) => Chat, { nullable: true })
  getChat(@Args("id") id: number) {
    return this.prismaService.directMessage.findUnique({
      where: { id: id },
    });
  }
}
