import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { AppGateway } from "../app.gateway";
import { ChannelService } from "./channel";
import { Socket } from "socket.io";
import { CacheInvalidation, Channel, UserBase } from "@apps/shared";
import { z } from "zod";

@Injectable()
export class SocketService {
  constructor(
    @Inject(forwardRef(() => AppGateway))
    private socketGateway: AppGateway,
    private channelService: ChannelService
  ) {}

  invalidateOwnCache(
    socket: Socket,
    target: z.infer<typeof CacheInvalidation>
  ) {
    socket.emit("cache_invalidation", target);
  }

  invalidateUserCache(
    userId: z.infer<typeof UserBase.shape.id>,
    target: z.infer<typeof CacheInvalidation>
  ) {
    const isOnline = this.socketGateway.server.sockets.adapter.rooms.has(
      userId.toString()
    );

    if (isOnline) {
      this.socketGateway.server
        .to(userId.toString())
        .emit("cache_invalidation", target);
    }
  }

  async invalidateChannelMembersCache(
    currentUserId: z.infer<typeof UserBase.shape.id>,
    channelId: z.infer<typeof Channel.shape.id>,
    target: z.infer<typeof CacheInvalidation>
  ) {
    const members = await this.channelService.getMembers(
      currentUserId,
      channelId
    );

    members.forEach((member) =>
      this.invalidateUserCache(member.userId, target)
    );
  }

  async invalidateAllCache(target: z.infer<typeof CacheInvalidation>) {
    this.socketGateway.server.emit("cache_invalidation", target);
  }
}
