/* eslint-disable @typescript-eslint/no-unused-vars */

import "reflect-metadata";
import { Field, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";
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
