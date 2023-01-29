import { ArgsType, Field, IntersectionType } from "@nestjs/graphql";
import { GameMode } from "@prisma/client";
import { GetUserArgs } from "../user/user.args";

@ArgsType()
export class GameModeArgs {
  @Field((type) => GameMode)
  gameMode: GameMode;
}

@ArgsType()
export class InviteArgs extends IntersectionType(GetUserArgs, GameModeArgs) {}
