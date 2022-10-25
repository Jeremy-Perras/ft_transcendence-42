/* eslint-disable @typescript-eslint/no-unused-vars */

import "reflect-metadata";
import { Field, ObjectType, Int } from "@nestjs/graphql";
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
  avatar?: string | null;

  @Field((type) => Int)
  @Min(1)
  rank: number;
}
