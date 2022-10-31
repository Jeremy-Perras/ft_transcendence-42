import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import "reflect-metadata";
import { User } from "../user/user.model";

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

  @Field((type) => User)
  player1: User;

  @Field((type) => User)
  player2: User;

  @Field((type) => Int)
  player1score: number;

  @Field((type) => Int)
  player2score: number;
}
