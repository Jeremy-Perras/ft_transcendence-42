import {
  createUnionType,
  Field,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import "reflect-metadata";
import { User } from "../user/user.model";
import { GameMode } from "@prisma/client";

registerEnumType(GameMode, {
  name: "GameMode",
});

@ObjectType()
export class Players {
  @Field((type) => User)
  player1: User;

  @Field((type) => User)
  player2: User;
}

@ObjectType()
export class Score {
  @Field((type) => Int)
  player1Score: number;

  @Field((type) => Int)
  player2Score: number;
}

@ObjectType()
export class Game {
  @Field((type) => Int)
  id: number;

  @Field((type) => GameMode)
  gameMode: GameMode;

  @Field((type) => Date)
  startAt: Date;

  @Field((type) => Date, { nullable: true })
  finishedAt?: Date;

  @Field((type) => Players)
  players: Players;

  @Field((type) => Score)
  score: Score;
}

@ObjectType()
export class Invitation {
  @Field((type) => User)
  sender: User;

  @Field((type) => GameMode)
  gameMode: GameMode;
}

@ObjectType()
export class WaitingForInviteeState {
  @Field((type) => User)
  invitee: User;

  @Field((type) => GameMode)
  gameMode: GameMode;
}

@ObjectType()
export class MatchmakingState {
  @Field((type) => GameMode)
  gameMode: GameMode;
}

@ObjectType()
export class PlayingState {
  @Field((type) => Game)
  game: Game;
}

export const StatesUnion = createUnionType({
  name: "StatesUnion",
  types: () =>
    [WaitingForInviteeState, MatchmakingState, PlayingState] as const,
});
