import "reflect-metadata";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, Min } from "class-validator";
import { Message } from "../message/message.model";
import { User } from "../user/user.model";

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

  @Field((type) => [User], { nullable: true })
  admins?: [User];

  @Field((type) => [User], { nullable: true })
  members?: [User];

  @Field((type) => [Message], { nullable: true })
  messages?: [Message];
}
