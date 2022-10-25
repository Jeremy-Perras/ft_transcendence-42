import "reflect-metadata";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";

@ObjectType()
export class User {
  @Field((type) => Int)
  @Min(1)
  id: number;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field((type) => String, { nullable: true })
  avatar?: string;

  @Field((type) => Int)
  @Min(1)
  rank: number;
}
