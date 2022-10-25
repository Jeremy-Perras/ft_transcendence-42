/* eslint-disable @typescript-eslint/no-unused-vars */

import "reflect-metadata";
import { Field, ObjectType, Int } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import { User } from "./user";

@ObjectType()
export class Message {
  @Field((type) => User)
  author: User;

  @Field()
  @IsNotEmpty()
  content: string;

  @Field((type) => Date)
  sendAt: Date;
}
