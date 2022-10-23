import { z } from "zod";
import { MessageSchema } from "./message";
import { SetSchema } from "./set";
import { UserSchema } from "./user";

export const ChannelSchema = z.object({
  id: z.number().nonnegative(),
  private: z.boolean(),
  passwordProtected: z.boolean(),
  owner: UserSchema,
  name: z.string().min(1),
  admins: SetSchema(UserSchema),
  members: SetSchema(UserSchema),
  messages: SetSchema(MessageSchema),
  unreadMessages: SetSchema(MessageSchema),
});
