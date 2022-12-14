import "reflect-metadata";
import {
  Field,
  Int,
  IntersectionType,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import { Channel } from "../channel/channel.model";
import { Game } from "../game/game.model";
import "reflect-metadata";

export type directMessageType = Omit<DirectMessage, "author" | "recipient">;

export enum friendStatus {
  NOT_FRIEND,
  INVITATION_RECEIVED,
  INVITATION_SEND,
  FRIEND,
}

export type userType = Omit<
  User,
  | "friends"
  | "blocked"
  | "blocking"
  | "messages"
  | "channels"
  | "games"
  | "status"
  | "achievements"
  | "pendingFriends"
>;

registerEnumType(friendStatus, {
  name: "friendStatus",
});

@ObjectType()
export class User {
  @Field((type) => Int)
  @Min(0)
  id: number;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field((type) => String)
  avatar: string;

  @Field((type) => Int)
  @Min(0)
  rank: number;

  @Field((type) => [User])
  friends: [User | undefined];

  @Field((type) => [User])
  pendingFriends: [User | undefined];

  @Field((type) => [Game])
  games: [Game | undefined];

  @Field((type) => [Achievement])
  achievements: [Achievement | undefined];

  @Field((type) => Boolean)
  blocked: boolean;

  @Field((type) => Boolean)
  blocking: boolean;

  @Field((type) => [Channel])
  channels: [Channel | undefined];

  @Field((type) => friendStatus, { nullable: true })
  friendStatus?: friendStatus;

  @Field((type) => [DirectMessage])
  messages: [DirectMessage | undefined];
}

@ObjectType()
export class Achievement {
  @Field((type) => String)
  @IsNotEmpty()
  name: string;

  @Field((type) => String)
  @IsNotEmpty()
  icon: string;
}
@ObjectType()
export class DirectMessage {
  @Field((type) => Int)
  @Min(0)
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
