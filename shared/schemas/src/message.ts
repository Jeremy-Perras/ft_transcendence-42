import { z } from "zod";
import { DateSchema } from "./date";
import { UserSchema } from "./user";

export const MessageSchema = z.object({
  author: UserSchema,
  content: z.string().min(1),
  sentAt: DateSchema,
});
