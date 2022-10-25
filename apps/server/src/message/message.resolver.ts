import { Inject } from "@nestjs/common";
import { Resolver } from "@nestjs/graphql";
import { PrismaService } from "../prisma.service";
import { Message } from "./message.model";

@Resolver(Message)
export class MessageResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
}
