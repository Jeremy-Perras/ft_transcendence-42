import { NotFoundException, UseGuards } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { Prisma, GameMode } from "@prisma/client";
import { GqlAuthenticatedGuard } from "../auth/authenticated.guard";
import { CurrentUser } from "../auth/currentUser.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { GraphqlUser } from "../user/user.resolver";
import { Game } from "./game.model";

export type GraphqlGame = Omit<Game, "players">;

type GraphqlPlayers = {
  player1: GraphqlUser;
  player2: GraphqlUser;
};

@Resolver(Game)
@UseGuards(GqlAuthenticatedGuard)
export class GameResolver {
  constructor(private prisma: PrismaService) {}

  @Query((returns) => Game)
  async game(
    @Args("id", { type: () => Int }) id: number
  ): Promise<GraphqlGame> {
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
      gameMode: game.mode,
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
    @Args("gameMode", { type: () => GameMode, nullable: true })
    gameMode?: GameMode | null,
    @Args("finished", {
      type: () => Boolean,
      nullable: true,
      defaultValue: null,
    })
    finished?: boolean | null
  ): Promise<GraphqlGame[]> {
    const conditions: Prisma.Enumerable<Prisma.GameWhereInput> = [];
    if (finished !== null) {
      conditions.push(
        finished ? { NOT: { finishedAt: null } } : { finishedAt: null }
      );
    }
    if (gameMode) {
      conditions.push({ mode: gameMode });
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
      gameMode: game.mode,
      startAt: game.startedAt,
      finishedAt: game.finishedAt ?? undefined,
      score: {
        player1Score: game.player1Score,
        player2Score: game.player2Score,
      },
    }));
  }

  @ResolveField()
  async players(@Root() game: Game): Promise<GraphqlPlayers> {
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
        rank: g.player1.rank,
      },
      player2: {
        id: g.player2.id,
        name: g.player2.name,
        rank: g.player2.rank,
      },
    };
  }

  @Mutation((returns) => Int)
  async createGame(
    @Args("gameMode", { type: () => GameMode }) gameMode: GameMode,
    @Args("player2Id", { type: () => Int, nullable: true }) player2Id: number,
    @CurrentUser() currentUserId: number
  ) {
    const game = await this.prisma.game.create({
      data: {
        player1Score: 0,
        player2Score: 0,
        player1Id: currentUserId,
        mode: gameMode,
        player2Id: player2Id,
      },
    });

    return game.id;
  }

  @Mutation((returns) => Boolean)
  async launchGame(
    @Args("gameId", { type: () => Int, nullable: true }) gameId: number,
    @CurrentUser() currentUserId: number
  ) {
    const game = await this.prisma.game.update({
      where: { id: gameId },
      data: { startedAt: new Date() },
    });

    return true;
  }

  @Mutation((returns) => Boolean)
  async deleteGame(
    @Args("gameId", { type: () => Int, nullable: true }) gameId: number
  ) {
    const game = await this.prisma.game.delete({
      where: { id: gameId },
    });

    return true;
  }
}
