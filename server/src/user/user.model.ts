import "reflect-metadata";
import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Channel } from "../channel/channel.model";
import { Game } from "../game/game.model";

export enum FriendStatus {
  NOT_FRIEND,
  INVITATION_RECEIVED,
  INVITATION_SENT,
  FRIEND,
}
registerEnumType(FriendStatus, {
  name: "FriendStatus",
});

export enum ChatType {
  CHANNEL,
  USER,
}
registerEnumType(ChatType, {
  name: "ChatType",
});

export enum UserStatus {
  ONLINE,
  OFFLINE,
  PLAYING,
}
registerEnumType(UserStatus, {
  name: "UserStatus",
});

@ObjectType()
export class User {
  @Field((type) => Int)
  id: number;

  @Field()
  name: string;

  @Field((type) => String)
  avatar: string;

  @Field((type) => Int)
  rank: number;

  @Field((type) => [User])
  friends: [User | undefined];

  @Field((type) => [User])
  pendingFriends: [User | undefined];

  @Field((type) => [Game])
  games: [Game | undefined];

  @Field((type) => [Achievement])
  achievements: [Achievement | undefined];

  @Field((type) => Boolean, { nullable: true })
  blocked?: boolean;

  @Field((type) => Boolean, { nullable: true })
  blocking?: boolean;

  @Field((type) => [Channel])
  channels: [Channel | undefined];

  @Field((type) => FriendStatus, { nullable: true })
  friendStatus?: FriendStatus;

  @Field((type) => UserStatus)
  status: UserStatus;

  @Field((type) => [DirectMessage])
  messages: [DirectMessage | undefined];

  @Field((type) => [Chat])
  chats: [Chat | undefined];
}

@ObjectType()
export class Chat {
  @Field((type) => Int)
  id: number;

  @Field((type) => ChatType)
  type: ChatType;

  @Field((type) => String)
  name: string;

  @Field((type) => String, { nullable: true })
  avatar: string | undefined;

  @Field((type) => String, { nullable: true })
  lastMessageContent: string | undefined;

  @Field((type) => Date, { nullable: true })
  lastMessageDate: Date | undefined;

  @Field((type) => Boolean)
  hasUnreadMessages: boolean;

  @Field((type) => UserStatus, { nullable: true })
  status?: UserStatus;
}

@ObjectType()
export class Achievement {
  @Field((type) => String)
  name: string;
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
  content: string;

  @Field((type) => Date)
  sentAt: Date;

  @Field((type) => Date, { nullable: true })
  readAt?: Date;
}
