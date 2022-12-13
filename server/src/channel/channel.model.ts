import "reflect-metadata";
import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { User } from "../user/user.model";
import { ChannelRestriction } from "@prisma/client";

registerEnumType(ChannelRestriction, {
  name: "ChannelRestriction",
});

@ObjectType()
export class ChannelRestrictedUser {
  @Field((type) => User)
  user: User;

  @Field((type) => Date, { nullable: true })
  endAt?: Date;
}

@ObjectType()
export class Channel {
  @Field((type) => Int)
  id: number;

  @Field((type) => Boolean)
  private: boolean;

  @Field((type) => Boolean)
  passwordProtected: boolean;

  @Field()
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
  id: number;

  @Field((type) => Int)
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
