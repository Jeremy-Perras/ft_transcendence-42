import "reflect-metadata";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import {
  Restricted,
  RestrictedMember,
  User,
  userType,
} from "../user/user.model";

export type channelType = Omit<
  Channel,
  "owner" | "messages" | "admins" | "members" | "banned" | "muted"
>;
export type channelMessageType = Omit<ChannelMessage, "author" | "readBy">;
export type restrictedMemberType = userType & Restricted;

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
export class ChannelMessage {
  @Field((type) => Int)
  @Min(0)
  id: number;

  @Field((type) => Int)
  @Min(0)
  authorId: number;

  @Field((type) => User)
  author: User;

  @Field((type) => [User])
  readBy: [User | undefined];

  @Field((type) => String, { nullable: true })
  content: string | null;

  @Field((type) => Date)
  sentAt: Date;
}
