import { Inject } from "@nestjs/common";
import { Resolver } from "@nestjs/graphql";
import { PrismaService } from "../prisma.service";
import { Chat } from "./chat.model";

@Resolver(Chat)
export class ChatResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
}
