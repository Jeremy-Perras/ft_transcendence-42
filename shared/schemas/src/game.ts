import { z } from "zod";
import { DateSchema } from "./date";
import { GameModeSchema } from "./gameMode";
import { UserSchema } from "./user";

export const GameSchema = z.object({
  id: z.number().nonnegative(),
  mode: GameModeSchema.pick({ name: true, id: true }),
  startedAt: DateSchema,
  finishedAt: DateSchema.optional(),
  player1: UserSchema,
  player2: UserSchema,
  player1Score: z.number().nonnegative(),
  player2Score: z.number().nonnegative(),
});
