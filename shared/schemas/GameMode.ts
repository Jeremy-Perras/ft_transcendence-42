import { z } from "zod";

export const GameModeSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  textColor: z.string().min(1),
  animation: z.any(), // TODO
  selectedAnimation: z.any(), // TODO
});
