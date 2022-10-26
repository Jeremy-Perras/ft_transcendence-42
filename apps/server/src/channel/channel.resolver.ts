import { Resolver } from "@nestjs/graphql";
import { PrismaService } from "../prisma/prisma.service";
import { Channel } from "./channel.model";

@Resolver(Channel)
export class ChannelResolver {
  constructor(private prisma: PrismaService) {}
}
