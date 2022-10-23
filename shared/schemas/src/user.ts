import { z } from "zod";

export const UserSchema = z.object({
  id: z.number().nonnegative(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  rank: z.number().nonnegative(),
});
