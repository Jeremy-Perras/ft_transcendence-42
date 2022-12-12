import { z } from "zod";

export const UserBase = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(255),
  avatar: z.string().min(1),
});

export const OtherUser = UserBase.extend({
  status: z.enum(["ONLINE", "OFFLINE", "IN_GAME"]),
  friendship: z.enum(["PENDING", "FRIEND", "NOT_FRIEND"]),
  block: z.boolean(),
});

export const Self = UserBase.extend({
  friends: z.set(OtherUser.shape.id),
  blocked: z.set(OtherUser.shape.id),
});

export const DirectMessage = z.object({
  authorId: UserBase.shape.id,
  recipientId: UserBase.shape.id,
  content: z.nullable(z.string().min(1)),
  sentAt: z.date(),
  read: z.boolean(),
});

export const Channel = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(255),
  ownerId: UserBase.shape.id,
  isPrivate: z.boolean(),
  isPasswordProtected: z.boolean(),
});

export const ChannelMember = z.object({
  userId: UserBase.shape.id,
  channelId: Channel.shape.id,
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const ChannelRestriction = z.object({
  userId: UserBase.shape.id,
  channelId: Channel.shape.id,
  type: z.enum(["BANNED", "MUTED"]),
  endAt: z.nullable(z.date()),
});

export const ChannelMessage = z.object({
  channelId: Channel.shape.id,
  authorId: UserBase.shape.id,
  content: z.nullable(z.string().min(1)),
  sentAt: z.date(),
  readBy: z.set(UserBase.shape.id),
});

export const Chats = z.object({
  pendingFiendIds: z.set(OtherUser.shape.id),
  friendIds: z.set(OtherUser.shape.id),
  channelIds: z.set(Channel.shape.id),
});

export const SearchResult = z.object({
  id: z.union([UserBase.shape.id, Channel.shape.id]),
  name: z.union([UserBase.shape.name, Channel.shape.name]),
  avatar: z.optional(UserBase.shape.avatar),
  type: z.enum(["USER", "CHANNEL"]),
});

export const CacheInvalidation = z.discriminatedUnion("type", [
  z.object({ type: z.literal("CHATS") }),

  z.object({ type: z.literal("SELF") }),
  z.object({ type: z.literal("OTHER_USER"), key: OtherUser.shape.id }),
  z.object({
    type: z.literal("DIRECT_MESSAGES"),
    key: z.tuple([
      DirectMessage.shape.authorId,
      DirectMessage.shape.recipientId,
    ]),
  }),

  z.object({ type: z.literal("CHANNEL"), key: Channel.shape.id }),
  z.object({ type: z.literal("CHANNEL_MEMBERS"), key: Channel.shape.id }),
  z.object({ type: z.literal("CHANNEL_RESTRICTIONS"), key: Channel.shape.id }),
  z.object({
    type: z.literal("CHANNEL_MESSAGES"),
    key: ChannelMessage.shape.channelId,
  }),
]);

export const Model = z.discriminatedUnion("type", [
  z.object({ type: z.literal("SEARCH_RESULT"), data: SearchResult }),

  z.object({ type: z.literal("CHATS"), data: Chats }),

  z.object({ type: z.literal("OTHER_USER"), data: OtherUser }),
  z.object({ type: z.literal("SELF"), data: Self }),
  z.object({ type: z.literal("DIRECT_MESSAGE"), data: DirectMessage }),

  z.object({ type: z.literal("CHANNEL"), data: Channel }),
  z.object({ type: z.literal("CHANNEL_MESSAGE"), data: ChannelMessage }),
  z.object({ type: z.literal("CHANNEL_MEMBER"), data: ChannelMember }),
  z.object({
    type: z.literal("CHANNEL_RESTRICTION"),
    data: ChannelRestriction,
  }),

  z.object({ type: z.literal("CACHE_INVALIDATION"), data: CacheInvalidation }),
]);
