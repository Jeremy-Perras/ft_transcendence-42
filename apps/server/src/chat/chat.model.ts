import "reflect-metadata";
import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "../user/user.model";
import { Message } from "../message/message.model";

@ObjectType()
export class Chat {
  @Field((type) => User)
  author: User;

  @Field((type) => [Message], { nullable: true })
  Message?: [Message];

  @Field((type) => [Message], { nullable: true })
  unreadMessages?: [Message];
}
