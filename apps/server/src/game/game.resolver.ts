import {
  Args,
  Int,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { userType } from "../user/user.resolver";
import { Game } from "./game.model";

export type gameType = Omit<Game, "player1" | "player2">;

@Resolver(Game)
export class GameResolver {
  constructor(private prisma: PrismaService) {}

  @Query((returns) => Game)
  async game(@Args("id", { type: () => Int }) id: number): Promise<gameType> {
    const game = await this.prisma.game.findUnique({
      select: {
        id: true,
        startedAt: true,
        finishedAt: true,
        mode: true,
        player1Score: true,
        player2Score: true,
      },
      where: {
        id: id,
      },
    });
    if (!game) {
      throw new Error("Game not found");
    }
    return {
      id: game.id,
      gamemode: game.mode.name,
      startAt: game.startedAt,
      finishedAt: game.finishedAt ?? undefined,
      player1score: game.player1Score,
      player2score: game.player2Score,
    };
  }

  @Query((returns) => [Game])
  async games(
    @Args("id", { type: () => Int, nullable: true }) id: number | null,
    @Args("finished", { type: () => Boolean, nullable: true })
    finished: boolean | null
  ): Promise<gameType[]> {
    const conditions: Prisma.Enumerable<Prisma.GameWhereInput> = [];
    if (finished !== null) {
      conditions.push(
        finished ? { NOT: { finishedAt: null } } : { finishedAt: null }
      );
    }
    if (id !== null) {
      conditions.push({
        OR: [
          {
            player1Id: id,
          },
          {
            player2Id: id,
          },
        ],
      });
    }

    const games = await this.prisma.game.findMany({
      select: {
        id: true,
        startedAt: true,
        finishedAt: true,
        mode: true,
        player1Score: true,
        player2Score: true,
      },
      where: {
        AND: conditions,
      },
    });

    return games.map((game) => ({
      id: game.id,
      gamemode: game.mode.name,
      startAt: game.startedAt,
      finishedAt: game.finishedAt ?? undefined,
      player1score: game.player1Score,
      player2score: game.player2Score,
    }));
  }

  @ResolveField()
  async player1(@Root() game: Game): Promise<userType> {
    let u = await this.prisma.game.findUnique({
      select: { player1: true },
      where: {
        id: game.id,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    u = u!;
    return {
      id: u.player1.id,
      name: u.player1.name,
      avatar: u.player1.avatar,
      rank: u.player1.rank,
    };
  }

  @ResolveField()
  async player2(@Root() game: Game): Promise<userType> {
    let u = await this.prisma.game.findUnique({
      select: { player2: true },
      where: {
        id: game.id,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    u = u!;
    return {
      id: u.player2.id,
      name: u.player2.name,
      avatar: u.player2.avatar,
      rank: u.player2.rank,
    };
  }
}
