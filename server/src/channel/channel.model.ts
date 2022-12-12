import "reflect-metadata";
import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import { User, userType } from "../user/user.model";
import { ChannelRestriction } from "@prisma/client";

export type channelType = Omit<
  Channel,
  "owner" | "messages" | "admins" | "members" | "banned" | "muted"
>;
export type channelMessageType = Omit<ChannelMessage, "author" | "readBy">;

registerEnumType(ChannelRestriction, {
  name: "ChannelRestriction",
});

@ObjectType()
export class ChannelRestrictedUser {
  @Field((type) => User)
  user: userType;

  @Field((type) => Date, { nullable: true })
  endAt?: Date;
}

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

  @Field((type) => [ChannelRestrictedUser])
  banned: [ChannelRestrictedUser | undefined];

  @Field((type) => [ChannelRestrictedUser])
  muted: [ChannelRestrictedUser | undefined];
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
