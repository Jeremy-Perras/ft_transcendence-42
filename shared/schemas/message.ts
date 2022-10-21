import { z } from "zod";
import { UserSchema } from "./user";

export const MessageSchema = z.object({
  author: UserSchema,
  content: z.string().min(1),
  sentAt: z.preprocess((val) => {
    if (typeof val === "string") return new Date(val);
    if (val instanceof Date) return val;
    return false;
  }, z.date()),
});
