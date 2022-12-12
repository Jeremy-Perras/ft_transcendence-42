import {
  Chats,
  DirectMessage,
  OtherUser,
  SearchResult,
  Self,
} from "@apps/shared";
import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async search(query: string): Promise<z.infer<typeof SearchResult>[]> {
    return [
      {
        avatar: "https://cdn.discordapp.com/avatars/0/0.png",
        id: 1,
        name: "User",
        type: "USER",
      },
    ];
  }

  async getCurrentUser(currentUserId: number): Promise<z.infer<typeof Self>> {
    return {
      id: 0,
      avatar: "https://cdn.discordapp.com/avatars/0/0.png",
      name: "User",
      blocked: new Set([1, 2, 3]),
      friends: new Set([1, 2, 4]),
    };
  }

  async getCurrentUserChats(
    currentUserId: number
  ): Promise<z.infer<typeof Chats>> {
    return {
      channelIds: new Set([1, 2, 3]),
      friendIds: new Set([1, 2, 3]),
      pendingFiendIds: new Set([1, 2, 3]),
    };
  }

  async getUserById(
    currentUserId: number,
    userId: number
  ): Promise<z.infer<typeof OtherUser>> {
    return {
      id: 0,
      avatar: "https://cdn.discordapp.com/avatars/0/0.png",
      block: false,
      friendship: "FRIEND",
      name: "User",
      status: "ONLINE",
    };
  }

  async getMessages(
    currentUserId: number,
    userId: number
  ): Promise<z.infer<typeof DirectMessage>> {
    return {
      authorId: 0,
      content: "Hello!",
      read: true,
      recipientId: 1,
      sentAt: new Date(),
    };
  }

  async updateName(
    currentUserId: number,
    name: string
  ): Promise<z.infer<typeof Self>> {
    return {
      id: 0,
      avatar: "https://cdn.discordapp.com/avatars/0/0.png",
      name: "User",
      blocked: new Set([1, 2, 3]),
      friends: new Set([1, 2, 4]),
    };
  }

  async blockUser(currentUserId: number, userId: number): Promise<void> {}

  async unblockUser(currentUserId: number, userId: number): Promise<void> {}

  async sendFriendRequest(
    currentUserId: number,
    userId: number
  ): Promise<void> {}

  async removeFriendRequest(
    currentUserId: number,
    userId: number
  ): Promise<void> {}

  async sendDirectMessage(
    currentUserId: number,
    userId: number,
    content: string
  ): Promise<z.infer<typeof DirectMessage>> {
    return {
      authorId: 0,
      content: "Hello!",
      read: true,
      recipientId: 1,
      sentAt: new Date(),
    };
  }
}
