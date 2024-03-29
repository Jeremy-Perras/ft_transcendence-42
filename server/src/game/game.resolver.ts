import {
  BadRequestException,
  NotFoundException,
  RequestTimeoutException,
  UseGuards,
} from "@nestjs/common";
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
import { GameService } from "./game.service";
import { waitFor } from "xstate/lib/waitFor";
import { GameModeArgs, InviteArgs } from "./game.args";
import { GetUserArgs } from "../user/user.args";
import UserSession from "../auth/userSession.model";

export type GraphqlGame = Omit<Game, "players">;

type GraphqlPlayers = {
  player1: GraphqlUser;
  player2: GraphqlUser;
};

@Resolver(Game)
@UseGuards(GqlAuthenticatedGuard)
export class GameResolver {
  constructor(
    private prisma: PrismaService,
    private gameService: GameService
  ) {}

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

  @Mutation((returns) => Boolean)
  async sendGameInvite(
    @Args() { userId, gameMode }: InviteArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    const currentPlayer = this.gameService.getPlayer(currentUser.id);
    if (!currentPlayer) throw new BadRequestException();
    const wait = waitFor(
      currentPlayer,
      (state) => state.matches("_.waitingForInvitee"),
      {
        timeout: 1000,
      }
    ).catch(() => {
      throw new RequestTimeoutException("This player is not responding");
    });

    const name = await this.prisma.user.findFirst({
      select: { name: true },
      where: { id: currentUser.id },
    });

    currentPlayer.send({
      type: "INVITE",
      inviteeId: userId,
      gameMode,
      name: name?.name ? name.name : "undifined",
    });
    await wait;

    return true;
  }

  @Mutation((returns) => Boolean)
  async cancelGameInvite(@CurrentUser() currentUser: UserSession) {
    const currentPlayer = this.gameService.getPlayer(currentUser.id);
    if (!currentPlayer) throw new BadRequestException();
    const wait = waitFor(currentPlayer, (state) => state.matches("_.idle"), {
      timeout: 10000,
    }).catch(() => {
      throw new RequestTimeoutException(
        "We were not able to cancel the invite, try again"
      );
    });
    currentPlayer.send({ type: "CANCEL_INVITATION" });
    await wait;
    return true;
  }

  @Mutation((returns) => Boolean)
  async acceptGameInvite(
    @Args() { userId }: GetUserArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    const currentPlayer = this.gameService.getPlayer(currentUser.id);
    if (!currentPlayer) throw new BadRequestException();
    const wait = waitFor(currentPlayer, (state) => state.matches("_.playing"), {
      timeout: 10000,
    }).catch(() => {
      throw new RequestTimeoutException("This player is not responding");
    });
    currentPlayer.send({ type: "ACCEPT_INVITATION", inviterId: userId });
    await wait;
    return true;
  }

  @Mutation((returns) => Boolean)
  async refuseGameInvite(
    @Args() { userId }: GetUserArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    const currentPlayer = this.gameService.getPlayer(currentUser.id);
    if (!currentPlayer) throw new BadRequestException();
    const wait = waitFor(
      currentPlayer,
      (state) => !state.context.invitations.has(userId),
      {
        timeout: 10000,
      }
    ).catch(() => {
      throw new RequestTimeoutException(
        "We were not able to refuse the invite, try again"
      );
    });
    currentPlayer.send({ type: "REFUSE_INVITATION", inviterId: userId });

    await wait;
    return true;
  }

  @Mutation((returns) => Boolean)
  async joinMatchmaking(
    @Args() { gameMode }: GameModeArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    const currentPlayer = this.gameService.getPlayer(currentUser.id);
    if (!currentPlayer) throw new BadRequestException();
    const wait = waitFor(
      currentPlayer,
      (state) => state.matches("_.waitingForMatchmaking"),
      {
        timeout: 10000,
      }
    ).catch(() => {
      throw new RequestTimeoutException(
        "Unable to join matchmaking, try again"
      );
    });
    currentPlayer.send({ type: "JOIN_MATCHMAKING", gameMode });
    await wait;
    return true;
  }

  @Mutation((returns) => Boolean)
  async leaveMatchmaking(@CurrentUser() currentUser: UserSession) {
    const currentPlayer = this.gameService.getPlayer(currentUser.id);
    if (!currentPlayer) throw new BadRequestException();
    const wait = waitFor(currentPlayer, (state) => state.matches("_.idle"), {
      timeout: 10000,
    }).catch(() => {
      throw new RequestTimeoutException(
        "Unable to leave matchmaking, try again"
      );
    });
    currentPlayer.send({ type: "LEAVE_MATCHMAKING" });
    await wait;
    return true;
  }
}
