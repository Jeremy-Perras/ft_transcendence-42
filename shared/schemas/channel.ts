import { z } from "zod";
import { MessageSchema } from "./Message";
import { UserSchema } from "./User";

export const ChannelSchema = z.object({
  type: z.enum(["public", "private", "invite-only"]),
  owner: UserSchema,
  admins: z.set(UserSchema),
  members: z.set(UserSchema),
  messages: z.set(MessageSchema),
  unreadMessages: z.set(MessageSchema),
});
