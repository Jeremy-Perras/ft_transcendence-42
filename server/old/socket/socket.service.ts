import { InvalidCacheTarget } from "@apps/shared";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../src/prisma/prisma.service";
import { SocketGateway } from "./socket.gateway";

@Injectable()
export class SocketService {
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private socketGateway: SocketGateway,
    private prismaService: PrismaService
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

  async onDisconnected(userId: number) {
    const friends = await this.prismaService.user.findUnique({
      select: { friends: { select: { id: true } } },
      where: { id: userId },
    });
    if (friends) {
      this.emitInvalidateCache(
        InvalidCacheTarget.LOGOUT,
        friends?.friends.map((u) => u.id),
        userId
      );
    }
  }
}
