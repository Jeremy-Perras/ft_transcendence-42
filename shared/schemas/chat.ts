import { z } from "zod";
import { MessageSchema } from "./Message";
import { UserSchema } from "./User";

export const ChannelSchema = z.object({
  user: UserSchema,
  messages: z.set(MessageSchema),
  unreadMessages: z.set(MessageSchema),
});
