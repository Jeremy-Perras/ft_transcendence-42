import { NotFoundException, UseGuards } from "@nestjs/common";
import {
  Args,
  Int,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { Prisma } from "@prisma/client";
import { GqlAuthenticatedGuard } from "../auth/authenticated.guard";
import { PrismaService } from "../prisma/prisma.service";
import { Game, gameType, playersType } from "./game.model";

@Resolver(Game)
@UseGuards(GqlAuthenticatedGuard)
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
      throw new NotFoundException("Game not found");
    }

    return {
      id: game.id,
      gamemode: game.mode.name,
      startAt: game.startedAt,
      finishedAt: game.finishedAt ?? undefined,
      score: {
        player1Score: game.player1Score,
        player2Score: game.player2Score,
      },
    };
  }

  @Query((returns) => [Game])
  async games(
    @Args("id", { type: () => Int, nullable: true, defaultValue: null })
    id?: number | null,
    @Args("gameMode", { type: () => Int, nullable: true, defaultValue: null })
    gameMode?: number | null,
    @Args("finished", {
      type: () => Boolean,
      nullable: true,
      defaultValue: null,
    })
    finished?: boolean | null
  ): Promise<gameType[]> {
    const conditions: Prisma.Enumerable<Prisma.GameWhereInput> = [];
    if (finished !== null) {
      conditions.push(
        finished ? { NOT: { finishedAt: null } } : { finishedAt: null }
      );
    }
    if (gameMode !== null) {
      conditions.push({ gameModeId: gameMode });
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
      score: {
        player1Score: game.player1Score,
        player2Score: game.player2Score,
      },
    }));
  }

  @ResolveField()
  async players(@Root() game: Game): Promise<playersType> {
    const g = await this.prisma.game.findUnique({
      select: {
        player1: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rank: true,
          },
        },
        player2: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rank: true,
          },
        },
      },
      where: {
        id: game.id,
      },
    });

    if (!g) {
      throw new NotFoundException("Game not found");
    }

    return {
      player1: {
        id: g.player1.id,
        name: g.player1.name,
        avatar: g.player1.avatar,
        rank: g.player1.rank,
      },
      player2: {
        id: g.player2.id,
        name: g.player2.name,
        avatar: g.player2.avatar,
        rank: g.player2.rank,
      },
    };
  }
}
