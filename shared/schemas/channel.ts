import { z } from "zod";
import { MessageSchema } from "./message";
import { UserSchema } from "./user";

export const ChannelSchema = z.object({
  type: z.enum(["public", "private", "invite-only"]),
  owner: UserSchema,
  id: z.number().nonnegative(),
  name: z.string().min(1),
  admins: z.array(UserSchema),
  members: z.array(UserSchema),
  messages: z.array(MessageSchema),
  unreadMessages: z.array(MessageSchema),
});
