import { z } from "zod";
import { MessageSchema } from "./message";
import { UserSchema } from "./user";

export const ChannelSchema = z.object({
  user: UserSchema,
  messages: z.set(MessageSchema),
  unreadMessages: z.set(MessageSchema),
});
