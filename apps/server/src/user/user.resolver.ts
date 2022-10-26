import { Resolver, Query, Args } from "@nestjs/graphql";
import { CurrentUser } from "../auth/currentUser.decorator";
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
}
