import { z } from "zod";
import { GameModeSchema } from "./GameMode";
import { UserSchema } from "./user";

export const GameSchema = z.object({
  id: z.number().positive(),
  mode: GameModeSchema.pick({ name: true, id: true }),
  startedAt: z.date(),
  finishedAt: z.date().optional(),
  player1: UserSchema,
  player2: UserSchema,
  player1Score: z.number().nonnegative(),
  player2Score: z.number().nonnegative(),
});
