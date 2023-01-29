import { ArgsType, Field, Int } from "@nestjs/graphql";
import {
  IsBase32,
  isBase32,
  IsByteLength,
  IsNumberString,
  Length,
  Min,
} from "class-validator";

@ArgsType()
export class GetUserArgs {
  @Field((type) => Int)
  @Min(0)
  userId: number;
}

@ArgsType()
export class SetUserName {
  @Field((type) => String)
  @Length(1, 50)
  name: string;
}

@ArgsType()
export class SendDirectMessage extends GetUserArgs {
  @Field((type) => String)
  @IsByteLength(1, 65535)
  message: string;
}

@ArgsType()
export class TwoFaToken {
  @Field((type) => String)
  @Length(6, 6)
  @IsNumberString({ no_symbols: true })
  token: string;
}

@ArgsType()
export class TwoFaSecret {
  @Field((type) => String)
  @Length(16, 16)
  @IsBase32()
  secret: string;
}
