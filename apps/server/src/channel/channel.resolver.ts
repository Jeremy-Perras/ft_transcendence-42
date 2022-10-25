import { Inject } from "@nestjs/common";
import { Resolver } from "@nestjs/graphql";
import { PrismaService } from "../prisma.service";
import { Channel } from "./channel.model";

@Resolver(Channel)
export class ChannelResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}
}
