import "reflect-metadata";
import { Field, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";
import { User } from "../user/user.model";

@ObjectType()
export class Message {
  @Field((type) => User)
  author: User;

  @Field()
  @IsNotEmpty()
  content: string;

  @Field((type) => Date)
  sendAt: Date;
}
