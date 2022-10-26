import { Resolver, Query, Args, Int, registerEnumType } from "@nestjs/graphql";

import { CurrentUser } from "../auth/currentUser.decorator";
import { Channel } from "../channel/channel.model";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "./user.model";

@Resolver(User)
export class UserResolver {
  constructor(private prisma: PrismaService) {}

  @Query((returns) => [User], { nullable: true })
  findUsers(@Args("name", { nullable: true }) name?: string) {
    return this.prisma.user.findMany({
      where: {
        name: {
          contains: name ?? undefined,
        },
      },
    });
  }

  @Query((returns) => User)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Query((returns) => [Channel], { nullable: true })
  async getMyChannel(@CurrentUser() me: User) {
    const c = await this.prisma.user.findFirst({
      select: { channelsAsMember: { select: { channel: true } } },
      where: {
        id: me.id,
      },
    });
    return c?.channelsAsMember.map((e) => e.channel);
  }

  @Query((returns) => User, { nullable: true })
  FindUsersById(@Args("id", { type: () => Int }) id: number) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  @Query((returns) => [User], { nullable: true })
  FindUsersByRank(
    @Args("rank", { type: () => Int, nullable: true }) rank: number
  ) {
    return this.prisma.user.findMany({
      where: {
        rank: {
          gte: rank ?? undefined,
        },
      },
      orderBy: {
        rank: "asc",
      },
    });
  }
}