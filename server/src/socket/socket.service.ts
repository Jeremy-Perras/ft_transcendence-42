import { InvalidCacheTarget } from "@apps/shared";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";

@Injectable()
export class SocketService {
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private socketGateway: SocketGateway
  ) {}

  emitInvalidateCache(
    userIds: number[],
    target:
      | {
          target: InvalidCacheTarget.SELF;
        }
      | {
          target:
            | InvalidCacheTarget.CHANNEL
            | InvalidCacheTarget.CHANNEL_MESSAGES
            | InvalidCacheTarget.USER
            | InvalidCacheTarget.DIRECT_MESSAGES;
          targetId: number;
        }
  ) {
    userIds.forEach((id) => {
      this.socketGateway.server
        .to(id.toString())
        .emit("invalidateCache", target);
    });
    return;
  }

  async emitInvalidateCacheAll(
    targetId: number,
    cacheTarget: InvalidCacheTarget.USER | InvalidCacheTarget.CHANNEL
  ) {
    this.socketGateway.server.emit("invalidateCache", {
      cacheTarget,
      targetId,
    });
  }

  isUserConnected(userId: number) {
    const rooms = this.socketGateway.server.sockets.adapter.rooms;
    return !!rooms.get(userId.toString());
  }
}
