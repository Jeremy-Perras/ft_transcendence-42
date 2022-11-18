import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import "reflect-metadata";
import { User, userType } from "../user/user.model";

export type gameType = Omit<Game, "players">;

export type playersType = {
  player1: userType;
  player2: userType;
};

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
  @Min(0)
  player1Score: number;

  @Field((type) => Int)
  @Min(0)
  player2Score: number;
}

@ObjectType()
export class Game {
  @Field((type) => Int)
  @Min(0)
  id: number;

  @Field()
  @IsNotEmpty()
  gamemode: string;

  @Field((type) => Date)
  startAt: Date;

  @Field((type) => Date, { nullable: true })
  finishedAt?: Date;

  @Field((type) => Players)
  players: Players;

  @Field((type) => Score)
  score: Score;
}
