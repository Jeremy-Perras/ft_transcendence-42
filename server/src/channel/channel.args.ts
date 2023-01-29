import { ArgsType, Field, Int, PickType } from "@nestjs/graphql";
import { IsByteLength, IsOptional, Length, Min } from "class-validator";

@ArgsType()
export class ChannelArgs {
  @Field((type) => Int)
  @Min(0)
  id: number;

  @Field((type) => String)
  @Length(1, 50)
  name: string;

  @Field((type) => String, { nullable: true })
  @IsOptional()
  @Length(1, 255)
  password: string | null;

  @Field((type) => Boolean)
  inviteOnly: boolean;
}

@ArgsType()
export class GetChannelArgs extends PickType(ChannelArgs, ["id"] as const) {}

@ArgsType()
export class SearchChannelsArgs extends PickType(ChannelArgs, [
  "name",
] as const) {}

@ArgsType()
export class ChannelPasswordArgs extends PickType(ChannelArgs, [
  "id",
  "password",
] as const) {}

@ArgsType()
export class TargetUserArgs extends PickType(ChannelArgs, ["id"] as const) {
  @Field((type) => Int)
  @Min(0)
  userId: number;
}

@ArgsType()
export class CreateChannelArgs extends PickType(ChannelArgs, [
  "name",
  "inviteOnly",
  "password",
] as const) {}

@ArgsType()
export class RestrictUserArgs extends PickType(ChannelArgs, ["id"] as const) {
  @Field((type) => Int)
  @Min(0)
  userId: number;

  @Field((type) => Date, { nullable: true })
  restrictUntil: Date | null;
}

@ArgsType()
export class SendChannelMessageArgs extends GetChannelArgs {
  @Field((type) => String)
  @IsByteLength(1, 65535)
  message: string;
}
