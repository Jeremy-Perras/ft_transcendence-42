import { Inject } from "@nestjs/common";
import { Resolver, Query, Args } from "@nestjs/graphql";
import { PrismaService } from "../prisma.service";
import { User } from "./user.model";

@Resolver(User)
export class UserResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  @Query((returns) => [User], { nullable: true })
  findUsers(@Args("name", { nullable: true }) name?: string) {
    return this.prismaService.user.findMany({
      where: {
        name: {
          contains: name ?? undefined,
        },
      },
    });
  }
}
