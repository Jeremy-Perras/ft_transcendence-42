import {
  Channel,
  ChannelMember,
  ChannelMessage,
  ChannelRestriction,
  SearchResult,
} from "@apps/shared";
import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChannelService {
  constructor(private prismaService: PrismaService) {}

  async search(query: string): Promise<z.infer<typeof SearchResult>[]> {
    return [
      {
        id: 1,
        name: "User",
        type: "CHANNEL",
      },
    ];
  }

  async getChannelById(channelId: number): Promise<z.infer<typeof Channel>> {
    return {
      id: 1,
      name: "Channel",
      ownerId: 1,
      isPrivate: false,
      isPasswordProtected: false,
    };
  }

  async getMessages(
    currentUserId: number,
    channelId: number
  ): Promise<z.infer<typeof ChannelMessage>[]> {
    return [
      {
        authorId: 0,
        content: "Hello!",
        sentAt: new Date(),
        channelId: 1,
        readBy: new Set([1, 2, 3]),
      },
    ];
  }

  async getMembers(
    currentUserId: number,
    channelId: number
  ): Promise<z.infer<typeof ChannelMember>[]> {
    return [
      {
        role: "ADMIN",
        channelId: 1,
        userId: 1,
      },
    ];
  }

  async getRestrictions(
    currentUserId: number,
    channelId: number
  ): Promise<z.infer<typeof ChannelRestriction>[]> {
    return [
      {
        userId: 1,
        channelId: 1,
        endAt: new Date(),
        type: "BANNED",
      },
    ];
  }

  async createChannel(
    currentUserId: number,
    name: string,
    isPrivate: boolean,
    password?: string
  ): Promise<z.infer<typeof Channel>> {
    return {
      id: 1,
      isPasswordProtected: true,
      isPrivate: true,
      name: "Channel",
      ownerId: 1,
    };
  }

  async deleteChannel(
    currentUserId: number,
    channelId: number
  ): Promise<void> {}

  async joinChannel(
    currentUserId: number,
    channelId: number,
    password?: string
  ): Promise<void> {}

  async inviteUser(
    currentUserId: number,
    channelId: number,
    userId: number
  ): Promise<void> {}

  async leaveChannel(currentUserId: number, channelId: number): Promise<void> {}

  async removeUser(
    currentUserId: number,
    channelId: number,
    userId: number
  ): Promise<void> {}

  async setMemberRole(
    currentUserId: number,
    channelId: number,
    userId: number,
    role: z.infer<typeof ChannelMember>["role"]
  ): Promise<z.infer<typeof ChannelMember>> {
    return {
      channelId: 1,
      userId: 1,
      role: "ADMIN",
    };
  }

  async createChannelRestriction(
    currentUserId: number,
    channelId: number,
    userId: number,
    type: z.infer<typeof ChannelRestriction>["type"],
    endAt: Date | null
  ): Promise<z.infer<typeof ChannelRestriction>> {
    return {
      channelId: 1,
      endAt: new Date(),
      type: "BANNED",
      userId: 1,
    };
  }

  async updateChannelName(
    currentUserId: number,
    channelId: number,
    name: string
  ): Promise<z.infer<typeof Channel>> {
    return {
      id: 1,
      isPasswordProtected: true,
      isPrivate: true,
      name: "Channel",
      ownerId: 1,
    };
  }

  async updateChannelPassword(
    currentUserId: number,
    channelId: number,
    password: string | null
  ): Promise<z.infer<typeof Channel>> {
    return {
      id: 1,
      isPasswordProtected: true,
      isPrivate: true,
      name: "Channel",
      ownerId: 1,
    };
  }

  async setChannelPrivateStatus(
    currentUserId: number,
    channelId: number,
    isPrivate: boolean
  ): Promise<z.infer<typeof Channel>> {
    return {
      id: 1,
      isPasswordProtected: true,
      isPrivate: true,
      name: "Channel",
      ownerId: 1,
    };
  }

  async sendChannelMessage(
    currentUserId: number,
    channelId: number,
    content: string
  ): Promise<z.infer<typeof ChannelMessage>> {
    return {
      authorId: 1,
      channelId: 1,
      content: "Hello!",
      readBy: new Set([1, 2, 3]),
      sentAt: new Date(),
    };
  }
}
