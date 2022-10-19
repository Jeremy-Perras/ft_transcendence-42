import { z } from "zod";

export const UserSchema = z.object({
  id: z.number().positive(),
  name: z.string(),
  avatar: z.string().url().optional(),
  rank: z.number().nonnegative(),
});
