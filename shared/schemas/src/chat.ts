import { z } from "zod";
import { MessageSchema } from "./message";
import { SetSchema } from "./set";
import { UserSchema } from "./user";

export const ChannelSchema = z.object({
  user: UserSchema,
  messages: SetSchema(MessageSchema),
  unreadMessages: SetSchema(MessageSchema),
});
