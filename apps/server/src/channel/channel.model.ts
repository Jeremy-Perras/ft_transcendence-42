import "reflect-metadata";
import {
  Field,
  InputType,
  Int,
  IntersectionType,
  ObjectType,
} from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import { RestrictedMember, User } from "../user/user.model";

@ObjectType()
export class Channel {
  @Field((type) => Int)
  @Min(0)
  id: number;

  @Field((type) => Boolean)
  private: boolean;

  @Field((type) => Boolean)
  passwordProtected: boolean;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field((type) => User)
  owner: User;

  @Field((type) => [User])
  admins: [User | undefined];

  @Field((type) => [User])
  members: [User | undefined];

  @Field((type) => [ChannelMessage])
  messages: [ChannelMessage | undefined];

  @Field((type) => [RestrictedMember])
  banned: [RestrictedMember | undefined];

  @Field((type) => [RestrictedMember])
  muted: [RestrictedMember | undefined];
}

@ObjectType()
export class ChannelMessageRead {
  @Field((type) => Int)
  id: number;

  @Field((type) => User)
  user: User;

  @Field((type) => Date)
  readAt: Date;
}

@ObjectType()
export class ChannelMessage {
  @Field((type) => Int)
  id: number;

  @Field((type) => User)
  author: User;

  @Field((type) => [ChannelMessageRead])
  readBy: [ChannelMessageRead | undefined];

  @Field()
  @IsNotEmpty()
  content: string;

  @Field((type) => Date)
  sentAt: Date;
}
