import {
  Args,
  Int,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { channel } from "diagnostics_channel";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "../user/user.model";
import { Channel } from "./channel.model";

@Resolver(Channel)
export class ChannelResolver {
  constructor(private prisma: PrismaService) {}
  @Query((returns) => [Channel], { nullable: true })
  findChannel(@Args("name", { nullable: true }) name?: string) {
    return this.prisma.channel.findMany({
      include: { owner: true },
      where: {
        name: {
          contains: name ?? undefined,
        },
      },
    });
  }

  @Query((returns) => Channel, { nullable: true })
  FindChannelById(@Args("id", { type: () => Int }) id: number) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  @Query((returns) => [Channel], { nullable: true })
  findChannelByOwner(@Args("name", { nullable: true }) name?: string) {
    return this.prisma.channel.findMany({
      include: { owner: true },
      where: {
        owner: {
          name: { contains: name ?? undefined },
        },
      },
    });
  }
}
