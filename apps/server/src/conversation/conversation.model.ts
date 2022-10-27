import "reflect-metadata";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "../user/user.model";
import { Message } from "../message/message.model";

@ObjectType()
export class Conversation {
  @Field((type) => User)
  user: User;

  @Field((type) => [Message], { nullable: true })
  messages?: [Message];
}
