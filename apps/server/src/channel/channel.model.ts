import "reflect-metadata";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import { User } from "../user/user.model";

@ObjectType()
export class Channel {
  @Field()
  typename: "Channel";

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

  @Field((type) => [User], { nullable: true })
  admins?: [User];

  @Field((type) => [User], { nullable: true })
  members?: [User];

  @Field((type) => [ChannelMessage], { nullable: true })
  messages?: [ChannelMessage];
}

@ObjectType()
export class ChannelMessageRead {
  @Field()
  typename: "ChannelMessageRead";

  @Field((type) => Int)
  id: number;

  @Field((type) => User)
  user: User;

  @Field((type) => Date)
  readAt: Date;
}

@ObjectType()
export class ChannelMessage {
  @Field()
  typename: "ChannelMessage";

  @Field((type) => Int)
  id: number;

  @Field((type) => User)
  author: User;

  @Field((type) => [ChannelMessageRead])
  readBy: [ChannelMessageRead];

  @Field()
  @IsNotEmpty()
  content: string;

  @Field((type) => Date)
  sentAt: Date;
}
