import {
  Args,
  Int,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { PrismaService } from "../prisma/prisma.service";
import { userType } from "../user/user.resolver";
import { Game } from "./game.model";

type GameType = Omit<Game, "player1" | "player2">;

@Resolver(Game)
export class GameResolver {
  constructor(private prisma: PrismaService) {}

  @Query((returns) => [Game])
  async game(): Promise<GameType[] | null> {
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
        finishedAt: {
          not: null,
        },
      },
    });
    if (!games) {
      throw new Error("Game not found");
    }
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
  async player1(@Root() game: Game): Promise<userType | null> {
    const u = await this.prisma.game.findUnique({
      select: { player1: true },
      where: {
        id: game.id,
      },
    });
    return u
      ? {
          id: u.player1.id,
          name: u.player1.name,
          avatar: u.player1.avatar,
          rank: u.player1.rank,
        }
      : null;
  }

  @ResolveField()
  async player2(@Root() game: Game): Promise<userType | null> {
    const u = await this.prisma.game.findUnique({
      select: { player2: true },
      where: {
        id: game.id,
      },
    });
    return u
      ? {
          id: u.player2.id,
          name: u.player2.name,
          avatar: u.player2.avatar,
          rank: u.player2.rank,
        }
      : null;
  }
}
