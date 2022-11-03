import {
  Args,
  Int,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { GameMode, Prisma, User } from "@prisma/client";
import { CurrentUser } from "../auth/currentUser.decorator";
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
      startAt: game.startedAt ?? undefined,
      finishedAt: game.finishedAt ?? undefined,
      player1score: game.player1Score,
      player2score: game.player2Score,
    };
  }

  @Query((returns) => [Game])
  async games(
    @Args("id", { type: () => Int, nullable: true, defaultValue: null })
    id?: number | null,
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
      startAt: game.startedAt ?? undefined,
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    u.player2 = u.player2!;
    return {
      id: u.player2.id,
      name: u.player2.name,
      avatar: u.player2.avatar,
      rank: u.player2.rank,
    };
  }

  @Mutation((returns) => Game)
  async CreateGame(
    @Args("mode", { type: () => Int }) mode: number,
    @Args("player2Id", { type: () => Int, nullable: true }) player2Id: number,
    @CurrentUser() me: User
  ): Promise<gameType> {
    const m = await this.prisma.game.create({
      data: {
        player1Score: 0,
        player2Score: 0,
        player1Id: me.id,
        gameModeId: mode,
      },
    });
    return {
      id: m.id,
      player1score: m.player1Score,
      player2score: m.player1Score,
      gamemode:
        m.gameModeId === 1
          ? "Classic"
          : m.gameModeId === 2
          ? "Speed"
          : m.gameModeId === 3
          ? "Random"
          : "",
    };
  }

  @Query((returns) => Game)
  async joinGame(
    @CurrentUser() me: User,
    @Args("id", { type: () => Int })
    id: number
  ): Promise<gameType> {
    const m = await this.prisma.game.update({
      select: {
        player2: true,
        startedAt: true,
        player2Id: true,
        id: true,
        player1Score: true,
        player2Score: true,
        gameModeId: true,
      },
      where: {
        id: id,
      },
      data: { startedAt: new Date(), player2Id: me.id },
    });

    return {
      gamemode:
        m.gameModeId === 1
          ? "Classic"
          : m.gameModeId === 2
          ? "Speed"
          : m.gameModeId === 3
          ? "Random"
          : "",
      id,
      player1score: m.player1Score,
      player2score: m.player2Score,
      startAt: m.startedAt ?? undefined,
    };
  }
}
