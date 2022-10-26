import { Inject } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { PrismaService } from "../prisma.service";
import { Message } from "./message.model";

@Resolver(Message)
export class MessageResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  // @Query((returns) => [Message], { nullable: true })
  // getMessages(@Args("id") id: number) {
  //   return this.prismaService.channel.findUnique({ where: { id: id } });
  // }
}
