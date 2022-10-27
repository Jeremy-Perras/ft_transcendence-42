import "reflect-metadata";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import { Channel } from "../channel/channel.model";

@ObjectType()
export class User {
  @Field()
  typename: "User";

  @Field((type) => Int)
  @Min(1)
  id: number;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field((type) => String)
  avatar: string;

  @Field((type) => Int)
  @Min(1)
  rank: number;

  @Field((type) => [User])
  friends: [User];

  @Field((type) => Boolean)
  blocked: boolean;

  @Field((type) => Boolean)
  blocking: boolean;

  @Field((type) => [Channel])
  channels: [Channel];

  @Field((type) => [DirectMessage])
  messages: [DirectMessage];
}

@ObjectType()
export class DirectMessage {
  @Field()
  typename: "DirectMessage";

  @Field((type) => Int)
  id: number;

  @Field((type) => User)
  author: User;

  @Field((type) => User)
  recipient: User;

  @Field()
  @IsNotEmpty()
  content: string;

  @Field((type) => Date)
  sentAt: Date;

  @Field((type) => Date, { nullable: true })
  readAt?: Date;
}
