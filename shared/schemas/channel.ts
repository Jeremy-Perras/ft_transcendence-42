import { z } from "zod";
import { MessageSchema } from "./message";
import { UserSchema } from "./user";

export const ChannelSchema = z.object({
  type: z.enum(["public", "private", "invite-only"]),
  owner: UserSchema,
  name: z.string().nonempty(),
  admins: z.set(UserSchema),
  members: z.set(UserSchema),
  messages: z.set(MessageSchema),
  unreadMessages: z.set(MessageSchema),
});
