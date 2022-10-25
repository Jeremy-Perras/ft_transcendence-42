/* eslint-disable @typescript-eslint/no-unused-vars */

import "reflect-metadata";
import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "./user";
import { Message } from "./message";

@ObjectType()
export class Chat {
  @Field((type) => User)
  author: User;

  @Field((type) => [Message], { nullable: true })
  Message: [Message] | null;

  @Field((type) => [Message], { nullable: true })
  unreadMessages: [Message] | null;
}
