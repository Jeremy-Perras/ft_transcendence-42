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
    cacheTarget: InvalidCacheTarget,
    ids: number[],
    targetId: number
  ) {
    ids.forEach((id) => {
      this.socketGateway.server
        .to(id.toString())
        .emit("invalidateCache", { cacheTarget, targetId });
    });
    return;
  }

  isUserConnected(userId: number) {
    const rooms = this.socketGateway.server.sockets.adapter.rooms;
    return !!rooms.get(userId.toString());
  }
}
