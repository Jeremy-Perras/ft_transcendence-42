import { z } from "zod";
import {
  Channel,
  ChannelMember,
  ChannelMessage,
  ChannelRestriction,
  DirectMessage,
  OtherUser,
  UserBase,
} from "./models";

// TODO:
// join matchmaking | gameType
// leave matchmaking | gameType
// invite to game | id, gameType
// accept game invitation | id, gameType

const ChannelPassword = z.string().min(1).max(255);

export const EventResponse = z.discriminatedUnion("response", [
  z.object({ response: z.literal("ERROR"), data: z.string() }),
  z.object({ response: z.literal("SUCCESS"), data: z.string() }),
]);

export const AppEvent = z.discriminatedUnion("event", [
  // QUERIES
  z.object({
    event: z.literal("SEARCH"),
    data: z.object({
      query: z.string().min(1),
      includeUsers: z.boolean(),
      includeChannels: z.boolean(),
    }),
  }),
  z.object({
    event: z.literal("GET_SELF"),
    data: z.object({}),
  }),
  z.object({
    event: z.literal("GET_CHATS"),
    data: z.object({}),
  }),
  z.object({
    event: z.literal("GET_USER"),
    data: z.object({ userId: UserBase.shape.id }),
  }),
  z.object({
    event: z.literal("GET_DIRECT_MESSAGES"),
    data: z.object({
      userId: OtherUser.shape.id,
      limit: z.optional(z.number().positive()),
      offset: z.optional(z.number().positive()),
    }),
  }),
  z.object({
    event: z.literal("GET_CHANNEL"),
    data: z.object({ channelId: Channel.shape.id }),
  }),
  z.object({
    event: z.literal("GET_CHANNEL_MESSAGES"),
    data: z.object({
      channelId: Channel.shape.id,
      limit: z.number().positive(),
      offset: z.number().positive(),
    }),
  }),
  z.object({
    event: z.literal("GET_CHANNEL_MEMBERS"),
    data: z.object({
      channelId: Channel.shape.id,
    }),
  }),
  z.object({
    event: z.literal("GET_CHANNEL_RESTRICTIONS"),
    data: z.object({
      channelId: Channel.shape.id,
      restrictionTypes: z.set(ChannelRestriction.shape.type),
      onlyActive: z.boolean(),
    }),
  }),
  // MUTATIONS
  z.object({
    event: z.literal("UPDATE_NAME"),
    data: z.object({ name: UserBase.shape.name }),
  }),
  z.object({
    event: z.literal("BLOCK_USER"),
    data: z.object({ userId: OtherUser.shape.id }),
  }),
  z.object({
    event: z.literal("UNBLOCK_USER"),
    data: z.object({ userId: OtherUser.shape.id }),
  }),
  z.object({
    event: z.literal("SEND_FRIEND_REQUEST"),
    data: z.object({ userId: OtherUser.shape.id }),
  }),
  z.object({
    event: z.literal("ACCEPT_FRIEND_REQUEST"),
    data: z.object({ userId: OtherUser.shape.id }),
  }),
  z.object({
    event: z.literal("DECLINE_FRIEND_REQUEST"),
    data: z.object({ userId: OtherUser.shape.id }),
  }),
  z.object({
    event: z.literal("REMOVE_FRIEND"),
    data: z.object({ userId: OtherUser.shape.id }),
  }),
  z.object({
    event: z.literal("SEND_DIRECT_MESSAGE"),
    data: z.object({
      userId: OtherUser.shape.id,
      content: DirectMessage.shape.content.unwrap(),
    }),
  }),
  z.object({
    event: z.literal("CREATE_CHANNEL"),
    data: z.object({
      name: Channel.shape.name,
      isPrivate: Channel.shape.isPrivate,
      password: z.optional(ChannelPassword),
    }),
  }),
  z.object({
    event: z.literal("DELETE_CHANNEL"),
    data: z.object({ channelId: Channel.shape.id }),
  }),
  z.object({
    event: z.literal("JOIN_CHANNEL"),
    data: z.object({
      channelId: Channel.shape.id,
      password: z.optional(ChannelPassword),
    }),
  }),
  z.object({
    event: z.literal("LEAVE_CHANNEL"),
    data: z.object({ channelId: Channel.shape.id }),
  }),
  z.object({
    event: z.literal("ADD_CHANNEL_MEMBER"),
    data: z.object({
      channelId: Channel.shape.id,
      userId: OtherUser.shape.id,
    }),
  }),
  z.object({
    event: z.literal("REMOVE_CHANNEL_MEMBER"),
    data: z.object({
      channelId: Channel.shape.id,
      userId: OtherUser.shape.id,
    }),
  }),
  z.object({
    event: z.literal("UPDATE_CHANNEL_MEMBER_ROLE"),
    data: z.object({
      channelId: Channel.shape.id,
      userId: OtherUser.shape.id,
      role: ChannelMember.shape.role,
    }),
  }),
  z.object({
    event: z.literal("ADD_CHANNEL_RESTRICTION"),
    data: z.object({
      channelId: Channel.shape.id,
      userId: OtherUser.shape.id,
      type: ChannelRestriction.shape.type,
      endAt: ChannelRestriction.shape.endAt,
    }),
  }),
  z.object({
    event: z.literal("UPDATE_CHANNEL_NAME"),
    data: z.object({
      channelId: Channel.shape.id,
      name: Channel.shape.name,
    }),
  }),
  z.object({
    event: z.literal("UPDATE_CHANNEL_PASSWORD"),
    data: z.object({
      channelId: Channel.shape.id,
      password: z.nullable(ChannelPassword),
    }),
  }),
  z.object({
    event: z.literal("UPDATE_CHANNEL_IS_PRIVATE"),
    data: z.object({
      channelId: Channel.shape.id,
      isPrivate: Channel.shape.isPrivate,
    }),
  }),
  z.object({
    event: z.literal("SEND_CHANNEL_MESSAGE"),
    data: z.object({
      channelId: Channel.shape.id,
      content: ChannelMessage.shape.content.unwrap(),
    }),
  }),
]);
