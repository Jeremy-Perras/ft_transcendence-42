import "reflect-metadata";
import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import { Channel } from "../channel/channel.model";
import { Game } from "../game/game.model";
import "reflect-metadata";

export type directMessageType = Omit<DirectMessage, "author" | "recipient"> & {
  author: userType;
  recipient: userType;
};

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
  | "achievements"
  | "pendingFriends"
  | "chats"
  | "status"
>;

registerEnumType(friendStatus, {
  name: "friendStatus",
});

export enum chatType {
  CHANNEL,
  USER,
}

registerEnumType(chatType, {
  name: "chatType",
});

export enum userStatus {
  ONLINE,
  OFFLINE,
  PLAYING,
}

registerEnumType(userStatus, {
  name: "userStatus",
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

  @Field((type) => userStatus)
  status: userStatus;

  @Field((type) => [DirectMessage])
  messages: [DirectMessage | undefined];

  @Field((type) => [Chat])
  chats: [Chat | undefined];
}

@ObjectType()
export class Chat {
  @Field((type) => Int)
  @Min(0)
  id: number;

  @Field((type) => chatType)
  type: chatType;

  @Field((type) => String)
  @IsNotEmpty()
  name: string;

  @Field((type) => String, { nullable: true })
  avatar: string | undefined;

  @Field((type) => String, { nullable: true })
  lastMessageContent: string | undefined;

  @Field((type) => Date, { nullable: true })
  lastMessageDate: Date | undefined;

  @Field((type) => Boolean)
  hasUnreadMessages: boolean;

  @Field((type) => userStatus, { nullable: true })
  status?: userStatus;
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
