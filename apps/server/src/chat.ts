/* eslint-disable @typescript-eslint/no-unused-vars */

import "reflect-metadata";
import { Field, ObjectType, Int } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import { User } from "./user";
import { Message } from "./message";

@ObjectType()
export class Chat {
  @Field((type) => User)
  author: User;

  @Field((type) => [Message], { nullable: true })
  Message: [Message] | undefined;

  @Field((type) => [Message], { nullable: true })
  unreadMessages: [Message] | undefined;
}
