import { Model, AppEvent, EventResponse } from "@apps/shared";
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { z } from "zod";
import { ChannelService } from "./services/channel";
import { SocketService } from "./services/socket";
import { UserService } from "./services/user";

@WebSocketGateway({ cors: "*" })
export class AppGateway {
  constructor(
    private userService: UserService,
    private channelService: ChannelService,
    private socketService: SocketService
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    client.join(client.request.session.passport.user.toString());
  }

  @SubscribeMessage("event")
  async handleQuery(
    client: Socket,
    data: z.infer<typeof AppEvent>
  ): Promise<
    | z.infer<typeof Model>
    | z.infer<typeof Model>[]
    | z.infer<typeof EventResponse>
  > {
    const parsed = AppEvent.safeParse(data);
    if (parsed.success) {
      const currentUserId = client.request.session.passport.user;
      switch (parsed.data.event) {
        case "SEARCH": {
          const users = parsed.data.data.includeUsers
            ? (await this.userService.search(parsed.data.data.query)).map(
                (u) =>
                  ({
                    type: "SEARCH_RESULT",
                    data: u,
                  } as z.infer<typeof Model>)
              )
            : [];

          const channels = parsed.data.data.includeChannels
            ? (await this.channelService.search(parsed.data.data.query)).map(
                (u) =>
                  ({
                    type: "SEARCH_RESULT",
                    data: u,
                  } as z.infer<typeof Model>)
              )
            : [];

          return [...users, ...channels];
        }
        case "GET_SELF":
          return {
            type: "SELF",
            data: await this.userService.getCurrentUser(currentUserId),
          };
        case "GET_CHATS":
          return {
            type: "CHATS",
            data: await this.userService.getCurrentUserChats(currentUserId),
          };
        case "GET_USER":
          return {
            type: "OTHER_USER",
            data: await this.userService.getUserById(
              currentUserId,
              parsed.data.data.userId
            ),
          };
        case "GET_DIRECT_MESSAGES":
          // TODO: read notify
          return {
            type: "DIRECT_MESSAGE",
            data: await this.userService.getMessages(
              currentUserId,
              parsed.data.data.userId
            ),
          };
        case "UPDATE_NAME": {
          const self = await this.userService.updateName(
            currentUserId,
            parsed.data.data.name
          );

          this.socketService.invalidateOwnCache(client, {
            type: "SELF",
          });

          this.socketService.invalidateAllCache({
            type: "OTHER_USER",
            key: currentUserId,
          });

          return {
            // TODO
            type: "SELF",
            data: self,
          };
        }
        case "BLOCK_USER": {
          await this.userService.blockUser(
            currentUserId,
            parsed.data.data.userId
          );

          const self = await this.userService.getCurrentUser(currentUserId);

          const otherUser = await this.userService.getUserById(
            currentUserId,
            parsed.data.data.userId
          );

          this.socketService.invalidateUserCache(parsed.data.data.userId, {
            type: "OTHER_USER",
            key: currentUserId,
          });

          return [
            {
              type: "SELF",
              data: self,
            },
            {
              type: "OTHER_USER",
              data: otherUser,
            },
          ];
        }
        case "UNBLOCK_USER": {
          await this.userService.unblockUser(
            currentUserId,
            parsed.data.data.userId
          );

          const self = await this.userService.getCurrentUser(currentUserId);

          const otherUser = await this.userService.getUserById(
            currentUserId,
            parsed.data.data.userId
          );

          this.socketService.notifyUser(parsed.data.data.userId, {
            type: "INVALIDATE",
            data: ["OTHER_USER", currentUserId],
          });

          return [
            {
              type: "SELF",
              data: self,
            },
            {
              type: "OTHER_USER",
              data: otherUser,
            },
          ];
        }
        case "SEND_FRIEND_REQUEST": {
          await this.userService.sendFriendRequest(
            currentUserId,
            parsed.data.data.userId
          );

          const self = await this.userService.getCurrentUser(currentUserId);

          const otherUser = await this.userService.getUserById(
            currentUserId,
            parsed.data.data.userId
          );

          this.socketService.notifyUser(parsed.data.data.userId, {
            type: "INVALIDATE",
            data: ["OTHER_USER", currentUserId],
          });

          return [
            {
              type: "SELF",
              data: self,
            },
            {
              type: "OTHER_USER",
              data: otherUser,
            },
          ];
        }
        case "ACCEPT_FRIEND_REQUEST": {
          await this.userService.sendFriendRequest(
            currentUserId,
            parsed.data.data.userId
          );

          const self = await this.userService.getCurrentUser(currentUserId);

          const otherUser = await this.userService.getUserById(
            currentUserId,
            parsed.data.data.userId
          );

          this.socketService.notifyUser(parsed.data.data.userId, {
            type: "INVALIDATE",
            data: ["OTHER_USER", currentUserId],
          });

          return [
            {
              type: "SELF",
              data: self,
            },
            {
              type: "OTHER_USER",
              data: otherUser,
            },
          ];
        }
        case "DECLINE_FRIEND_REQUEST": {
          await this.userService.removeFriendRequest(
            currentUserId,
            parsed.data.data.userId
          );

          const self = await this.userService.getCurrentUser(currentUserId);

          const otherUser = await this.userService.getUserById(
            currentUserId,
            parsed.data.data.userId
          );

          this.socketService.notifyUser(parsed.data.data.userId, {
            type: "INVALIDATE",
            data: ["OTHER_USER", currentUserId],
          });

          return [
            {
              type: "SELF",
              data: self,
            },
            {
              type: "OTHER_USER",
              data: otherUser,
            },
          ];
        }
        case "REMOVE_FRIEND": {
          await this.userService.removeFriendRequest(
            currentUserId,
            parsed.data.data.userId
          );

          const self = await this.userService.getCurrentUser(currentUserId);

          const otherUser = await this.userService.getUserById(
            currentUserId,
            parsed.data.data.userId
          );

          this.socketService.notifyUser(parsed.data.data.userId, {
            type: "INVALIDATE",
            data: ["OTHER_USER", currentUserId],
          });

          return [
            {
              type: "SELF",
              data: self,
            },
            {
              type: "OTHER_USER",
              data: otherUser,
            },
          ];
        }
        case "SEND_DIRECT_MESSAGE": {
          const message = await this.userService.sendDirectMessage(
            currentUserId,
            parsed.data.data.userId,
            parsed.data.data.content
          );

          this.socketService.notifyUser(parsed.data.data.userId, {
            type: "INVALIDATE",
            data: ["OTHER_USER", currentUserId],
          });

          return {
            type: "DIRECT_MESSAGE",
            data: message,
          };
        }
        case "GET_CHANNEL":
          return {
            type: "CHANNEL",
            data: await this.channelService.getChannelById(
              parsed.data.data.channelId
            ),
          };
        case "GET_CHANNEL_MESSAGES": {
          const messages = await this.channelService.getMessages(
            currentUserId,
            parsed.data.data.channelId
          );

          return messages.map((message) => ({
            type: "CHANNEL_MESSAGE",
            data: message,
          }));
        }
        case "GET_CHANNEL_MEMBERS": {
          const members = await this.channelService.getMembers(
            currentUserId,
            parsed.data.data.channelId
          );

          return members.map((member) => ({
            type: "CHANNEL_MEMBER",
            data: member,
          }));
        }
        case "GET_CHANNEL_RESTRICTIONS": {
          const restrictions = await this.channelService.getRestrictions(
            currentUserId,
            parsed.data.data.channelId
          );

          return restrictions.map((restriction) => ({
            type: "CHANNEL_RESTRICTION",
            data: restriction,
          }));
        }
        case "CREATE_CHANNEL": {
          const channel = await this.channelService.createChannel(
            currentUserId,
            parsed.data.data.name,
            parsed.data.data.isPrivate,
            parsed.data.data.password
          );

          return {
            type: "CHANNEL",
            data: channel,
          };
        }
        case "DELETE_CHANNEL": {
          await this.channelService.deleteChannel(
            currentUserId,
            parsed.data.data.channelId
          );

          this.socketService.notifyChannel(
            currentUserId,
            parsed.data.data.channelId,
            {
              type: "INVALIDATE",
              data: ["CHANNEL", parsed.data.data.channelId],
            }
          );

          return {
            type: "DELETED_CHANNEL",
            data: {
              channelId: parsed.data.data.channelId,
            },
          };
        }
        case "JOIN_CHANNEL": {
          await this.channelService.joinChannel(
            currentUserId,
            parsed.data.data.channelId,
            parsed.data.data.password
          );

          this.socketService.notifyChannel(
            currentUserId,
            parsed.data.data.channelId,
            {
              type: "INVALIDATE",
              data: ["CHANNEL", parsed.data.data.channelId],
            }
          );

          return {
            type: "CHANNEL_MEMBER",
            data: {
              userId: currentUserId,
              channelId: parsed.data.data.channelId,
              role: "MEMBER",
            },
          };
        }
        case "ADD_CHANNEL_MEMBER": {
          await this.channelService.inviteUser(
            currentUserId,
            parsed.data.data.channelId,
            parsed.data.data.userId
          );

          this.socketService.notifyChannel(
            currentUserId,
            parsed.data.data.channelId,
            {
              type: "INVALIDATE",
              data: ["CHANNEL", parsed.data.data.channelId],
            }
          );

          return {
            type: "CHANNEL_MEMBER",
            data: {
              userId: currentUserId,
              channelId: parsed.data.data.channelId,
              role: "MEMBER",
            },
          };
        }
        case "LEAVE_CHANNEL": {
          await this.channelService.leaveChannel(
            currentUserId,
            parsed.data.data.channelId
          );

          this.socketService.notifyChannel(
            currentUserId,
            parsed.data.data.channelId,
            {
              type: "INVALIDATE",
              data: ["CHANNEL", parsed.data.data.channelId],
            }
          );

          return {
            type: "REMOVE_MEMBER",
            data: {
              userId: currentUserId,
              channelId: parsed.data.data.channelId,
            },
          };
        }
        case "REMOVE_CHANNEL_MEMBER": {
          await this.channelService.removeUser(
            currentUserId,
            parsed.data.data.userId,
            parsed.data.data.channelId
          );

          this.socketService.notifyChannel(
            currentUserId,
            parsed.data.data.channelId,
            {
              type: "INVALIDATE",
              data: ["CHANNEL", parsed.data.data.channelId],
            }
          );

          return {
            type: "REMOVE_MEMBER",
            data: {
              userId: currentUserId,
              channelId: parsed.data.data.channelId,
            },
          };
        }
        case "UPDATE_CHANNEL_MEMBER_ROLE": {
          const member = await this.channelService.setMemberRole(
            currentUserId,
            parsed.data.data.userId,
            parsed.data.data.channelId,
            parsed.data.data.role
          );

          this.socketService.notifyChannel(
            currentUserId,
            parsed.data.data.channelId,
            {
              type: "INVALIDATE",
              data: ["CHANNEL", parsed.data.data.channelId],
            }
          );

          return {
            type: "CHANNEL_MEMBER",
            data: member,
          };
        }
        case "ADD_CHANNEL_RESTRICTION": {
          const restriction =
            await this.channelService.createChannelRestriction(
              currentUserId,
              parsed.data.data.userId,
              parsed.data.data.channelId,
              parsed.data.data.type,
              parsed.data.data.endAt
            );

          this.socketService.notifyChannel(
            currentUserId,
            parsed.data.data.channelId,
            {
              type: "INVALIDATE",
              data: ["CHANNEL", parsed.data.data.channelId],
            }
          );

          return {
            type: "CHANNEL_RESTRICTION",
            data: restriction,
          };
        }
        case "UPDATE_CHANNEL_NAME": {
          const channel = await this.channelService.updateChannelName(
            currentUserId,
            parsed.data.data.channelId,
            parsed.data.data.name
          );

          this.socketService.broadcast({
            type: "INVALIDATE",
            data: ["CHANNEL", parsed.data.data.channelId],
          });

          return {
            type: "CHANNEL",
            data: channel,
          };
        }
        case "UPDATE_CHANNEL_PASSWORD": {
          const channel = await this.channelService.updateChannelPassword(
            currentUserId,
            parsed.data.data.channelId,
            parsed.data.data.password
          );

          this.socketService.broadcast({
            type: "INVALIDATE",
            data: ["CHANNEL", parsed.data.data.channelId],
          });

          return {
            type: "CHANNEL",
            data: channel,
          };
        }
        case "UPDATE_CHANNEL_IS_PRIVATE": {
          const channel = await this.channelService.setChannelPrivateStatus(
            currentUserId,
            parsed.data.data.channelId,
            parsed.data.data.isPrivate
          );

          this.socketService.broadcast({
            type: "INVALIDATE",
            data: ["CHANNEL", parsed.data.data.channelId],
          });

          return {
            type: "CHANNEL",
            data: channel,
          };
        }
        case "SEND_CHANNEL_MESSAGE": {
          const message = await this.channelService.sendChannelMessage(
            currentUserId,
            parsed.data.data.channelId,
            parsed.data.data.content
          );

          this.socketService.notifyChannel(
            currentUserId,
            parsed.data.data.channelId,
            {
              type: "INVALIDATE",
              data: ["CHANNEL", parsed.data.data.channelId],
            }
          );

          return {
            type: "CHANNEL_MESSAGE",
            data: message,
          };
        }
        default:
          ((_: never) => _)(parsed.data);
      }
    }
    return {
      response: "ERROR",
      data: "Invalid event",
    };
  }
}
