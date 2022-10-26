import { Inject } from "@nestjs/common";
import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { channel } from "diagnostics_channel";
import { PrismaService } from "../prisma.service";
import { Channel } from "./channel.model";

@Resolver(Channel)
export class ChannelResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  // @Query((returns) => [Channel], { nullable: true })
  // findChannels(@Args("name", { nullable: true }) name?: string) {
  //   return this.prismaService.channel.findMany({
  //     where: {
  //       name: {
  //         contains: name ?? undefined,
  //       },
  //     },
  //   });
  // }

  @Query((returns) => Channel, { nullable: true })
  getChannel(@Args("id") id: number) {
    return this.prismaService.channel.findUnique({ where: { id: id } });
  }
}
