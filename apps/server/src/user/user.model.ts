import "reflect-metadata";
import { Field, Int, IntersectionType, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import { Channel } from "../channel/channel.model";
import { Game } from "../game/game.model";

@ObjectType()
export class User {
  @Field((type) => Int)
  id: number;

  @Field()
  name: string;

  @Field((type) => String, { nullable: true })
  socket?: string;

  @Field((type) => String)
  avatar: string;

  @Field((type) => Int)
  rank: number;

  @Field((type) => [User])
  friends: [User | undefined];

  @Field((type) => [Game])
  games: [Game | undefined];

  @Field((type) => Boolean)
  blocked: boolean;

  @Field((type) => Boolean)
  blocking: boolean;

  @Field((type) => [Channel])
  channels: [Channel | undefined];

  @Field((type) => [DirectMessage])
  messages: [DirectMessage | undefined];
}

@ObjectType()
export class DirectMessage {
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

@ObjectType()
export class Restricted {
  @Field((type) => Date, { nullable: true })
  endAt: Date | null;
}
@ObjectType()
export class RestrictedMember extends IntersectionType(Restricted, User) {}
