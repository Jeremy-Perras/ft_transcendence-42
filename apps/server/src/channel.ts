/* eslint-disable @typescript-eslint/no-unused-vars */

import "reflect-metadata";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import { Message } from "./message";
import { User } from "./user";

@ObjectType()
export class Post {
  @Field((type) => Int)
  @Min(0)
  id: number;

  @Field((type) => Boolean)
  private: boolean;

  @Field((type) => Boolean)
  passwordProtected: boolean;

  @Field((type) => User)
  owner: User;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field((type) => [User], { nullable: true })
  admin?: [User] | null;

  @Field((type) => [User], { nullable: true })
  user?: [User] | null;

  @Field((type) => [Message], { nullable: true })
  messages?: [Message] | null;

  @Field((type) => [Message], { nullable: true })
  unreadMessages?: [Message] | null;
}
