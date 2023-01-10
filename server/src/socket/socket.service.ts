import { Injectable } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";

@Injectable()
export class SocketService {
  constructor(private socketGateway: SocketGateway) {}

  invalidateDirectMessagesCache(currentUserId: number, userId: number) {
    this.socketGateway.server
      .to("user_" + userId.toString())
      .emit("invalidateDirectMessageCache", currentUserId);
  }

  invalidateChannelMessagesCache(channelId: number, userIds: number[]) {
    userIds.forEach((id) => {
      this.socketGateway.server
        .to("user_" + id.toString())
        .emit("invalidateChannelMessageCache", channelId);
    });
  }

  isUserConnected(userId: number) {
    const rooms = this.socketGateway.server.sockets.adapter.rooms;
    return !!rooms.get("user_" + userId.toString());
  }
}
