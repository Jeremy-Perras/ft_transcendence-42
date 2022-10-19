import { z } from "zod";
import { UserSchema } from "./User";

export const MessageSchema = z.object({
  author: UserSchema,
  content: z.string().min(1),
  sentAt: z.date(),
});
