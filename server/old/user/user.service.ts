import { InvalidCacheTarget } from "@apps/shared";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Achievement, Channel, DirectMessage, User } from "@prisma/client";
import DataLoader from "dataloader";
import { PrismaService } from "../prisma/prisma.service";
import { SocketService } from "../socket/socket.service";
import {
  Chat,
  chatType,
  userStatus,
  userType as GraphQLUser,
} from "./user.model";
import { channelType as GraphQLChannel } from "../channel/channel.model";
import { ChannelService } from "../channel/channel.service";

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private socketService: SocketService
  ) {}

  static formatUser(user: User): GraphQLUser {}

  async getUserById(userLoader: DataLoader<User["id"], User>, id: number) {
    try {
      return UserService.formatUser(await userLoader.load(id));
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async searchUsersByName(
    userLoader: DataLoader<User["id"], User>,
    name: string
  ) {
    const users = await this.prismaService.user.findMany({
      where: {
        name: {
          mode: "insensitive",
          contains: name,
        },
      },
    });
    return users.map((user) => {
      userLoader.prime(user.id, user);
      return UserService.formatUser(user);
    });
  }

  async getFriendedBy(
    userloader: DataLoader<User["id"], User>,
    friendedByIdsLoader: DataLoader<User["id"], number[]>,
    id: number
  ) {
    try {
      const friendedByIds = await friendedByIdsLoader.load(id);
      const users = await userloader.loadMany(friendedByIds);
      return users.reduce((acc, curr) => {
        if (curr && "id" in curr) {
          acc.push(UserService.formatUser(curr));
        }
        return acc;
      }, new Array<GraphQLUser>());
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async getFriends(
    userloader: DataLoader<User["id"], User>,
    friendIdsLoader: DataLoader<User["id"], number[]>,
    id: number
  ) {
    try {
      const friendIds = await friendIdsLoader.load(id);
      const users = await userloader.loadMany(friendIds);
      return users.reduce((acc, curr) => {
        if (curr && "id" in curr) {
          acc.push(UserService.formatUser(curr));
        }
        return acc;
      }, new Array<GraphQLUser>());
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async getBlockedBy(
    userloader: DataLoader<User["id"], User>,
    blockedByIdsLoader: DataLoader<User["id"], number[]>,
    id: number
  ) {
    try {
      const blockByIds = await blockedByIdsLoader.load(id);
      const users = await userloader.loadMany(blockByIds);
      return users.reduce((acc, curr) => {
        if (curr && "id" in curr) {
          acc.push(UserService.formatUser(curr));
        }
        return acc;
      }, new Array<GraphQLUser>());
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async getBlocking(
    userloader: DataLoader<User["id"], User>,
    blockingIdsLoader: DataLoader<User["id"], number[]>,
    id: number
  ) {
    try {
      const blockingIds = await blockingIdsLoader.load(id);
      const users = await userloader.loadMany(blockingIds);
      return users.reduce((acc, curr) => {
        if (curr && "id" in curr) {
          acc.push(UserService.formatUser(curr));
        }
        return acc;
      }, new Array<GraphQLUser>());
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async getAchievements(
    achievementDataloader: DataLoader<User["id"], Achievement[]>,
    id: number
  ) {
    try {
      const achievements = await achievementDataloader.load(id);
      return achievements.map((achievement) => {
        return {
          name: achievement.name,
          icon: achievement.icon,
        };
      });
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async getChannels(
    userChannelIdsLoader: DataLoader<User["id"], number[]>,
    channelLoader: DataLoader<Channel["id"], Channel>,
    id: number
  ) {
    try {
      const channelIds = await userChannelIdsLoader.load(id);
      const channels = await channelLoader.loadMany(channelIds);
      return channels.reduce((acc, curr) => {
        if (curr && "id" in curr) {
          acc.push(ChannelService.formatChannel(curr));
        }
        return acc;
      }, new Array<GraphQLChannel>());
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async unblock(currentUserId: number, userId: number) {
    try {
      await this.prismaService.userBlocking.delete({
        where: {
          blockerId_blockeeId: {
            blockeeId: userId,
            blockerId: currentUserId,
          },
        },
      });
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async block(currentUserId: number, userId: number) {
    try {
      await this.unFriend(currentUserId, userId);
      await this.prismaService.userBlocking.create({
        data: {
          blockeeId: userId,
          blockerId: currentUserId,
        },
      });
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async unFriend(currentUserId: number, userId: number) {
    try {
      await this.prismaService.userFriends.delete({
        where: {
          inviterId_inviteeId: {
            inviteeId: userId,
            inviterId: currentUserId,
          },
        },
      });
      await this.refuseFriendInvite(currentUserId, userId);
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async friend(currentUserId: number, userId: number) {
    try {
      await this.prismaService.userFriends.create({
        data: {
          inviteeId: userId,
          inviterId: currentUserId,
        },
      });
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async refuseFriendInvite(currentUserId: number, userId: number) {
    try {
      await this.prismaService.userFriends.delete({
        where: {
          inviterId_inviteeId: {
            inviterId: userId,
            inviteeId: currentUserId,
          },
        },
      });
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async updateName(currentUserId: number, name: string) {
    try {
      await this.prismaService.user.update({
        where: {
          id: currentUserId,
        },
        data: {
          name: name,
        },
      });
    } catch (error) {
      throw new ForbiddenException("Name already used");
    }
  }

  async getMessages(
    currentUser: number,
    userId: number,
    directMessagesReceivedLoader: DataLoader<
      [User["id"], User["id"]],
      (DirectMessage & { author: User; recipient: User })[]
    >,
    directMessagesSentLoader: DataLoader<
      [User["id"], User["id"]],
      (DirectMessage & { author: User; recipient: User })[]
    >
  ) {
    try {
      await this.prismaService.directMessage.updateMany({
        where: {
          authorId: userId,
          recipientId: currentUser,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      const [received, sent] = await Promise.all([
        directMessagesReceivedLoader.load([currentUser, userId]),
        directMessagesSentLoader.load([currentUser, userId]),
      ]);

      return [...received, ...sent]
        .sort((a, b) => b.sentAt.getMilliseconds() - a.sentAt.getMilliseconds())
        .map((message) => ({
          id: message.id,
          content: message.content,
          sentAt: message.sentAt,
          readAt: message.readAt ?? undefined,
          author: UserService.formatUser(message.author),
          recipient: UserService.formatUser(message.recipient),
        }));
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async getChats(currentUserId: number) {
    const res = await this.prismaService.user.findUnique({
      where: { id: currentUserId },
      select: {
        blocking: true,
        friends: {
          where: {
            invitee: {
              friends: {
                some: {
                  inviteeId: currentUserId,
                },
              },
            },
          },
          select: {
            invitee: {
              select: {
                id: true,
                name: true,
                avatar: true,
                messageReceived: {
                  where: {
                    authorId: currentUserId,
                  },
                  select: {
                    content: true,
                    sentAt: true,
                    readAt: true,
                    authorId: true,
                  },
                  orderBy: { sentAt: "desc" },
                  take: 1,
                },
                messageSent: {
                  where: {
                    recipientId: currentUserId,
                  },
                  select: {
                    content: true,
                    sentAt: true,
                    readAt: true,
                    authorId: true,
                  },
                  orderBy: { sentAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
        ownedChannels: {
          select: {
            id: true,
            name: true,
            channelMessages: {
              select: {
                authorId: true,
                content: true,
                sentAt: true,
                readBy: {
                  select: {
                    userId: true,
                  },
                },
              },
              orderBy: { sentAt: "desc" },
              take: 1,
            },
          },
        },
        channels: {
          select: {
            channel: {
              select: {
                id: true,
                name: true,
                channelMessages: {
                  select: {
                    authorId: true,
                    content: true,
                    sentAt: true,
                    readBy: {
                      select: {
                        userId: true,
                      },
                    },
                  },
                  orderBy: { sentAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!res) return [];

    const mergeResult: Chat[] = [];

    const formatChannel = (channel: typeof res.ownedChannels[number]) => {
      mergeResult.push({
        type: chatType.CHANNEL,
        id: channel.id,
        name: channel.name,
        avatar: undefined,
        lastMessageContent: res.blocking.some(
          (u) => u.blockeeId === channel.channelMessages[0]?.authorId
        )
          ? "Unblock this user to see this message"
          : channel.channelMessages[0]?.content,
        lastMessageDate: channel.channelMessages[0]?.sentAt,
        hasUnreadMessages: !channel.channelMessages[0]
          ? false
          : channel.channelMessages[0]?.authorId === currentUserId
          ? false
          : channel.channelMessages[0]?.readBy.some(
              (id) => id.userId === currentUserId
            )
          ? false
          : true,
        status: undefined,
      });
    };
    res?.ownedChannels.forEach(formatChannel);
    res?.channels.forEach((c) => formatChannel(c.channel));

    res.friends.forEach((f) => {
      let lastMessage;
      if (f.invitee.messageReceived[0] && f.invitee.messageSent[0]) {
        f.invitee.messageReceived[0]?.sentAt < f.invitee.messageSent[0]?.sentAt
          ? (lastMessage = f.invitee.messageSent[0])
          : (lastMessage = f.invitee.messageReceived[0]);
      } else if (f.invitee.messageReceived[0] && !f.invitee.messageSent[0])
        lastMessage = f.invitee.messageReceived[0];
      else if (f.invitee.messageSent[0] && !f.invitee.messageReceived[0])
        lastMessage = f.invitee.messageSent[0];
      else lastMessage = undefined;

      mergeResult.push({
        type: chatType.USER,
        id: f.invitee.id,
        name: f.invitee.name,
        avatar: f.invitee.avatar,
        hasUnreadMessages: !lastMessage
          ? false
          : lastMessage?.authorId === currentUserId
          ? false
          : lastMessage?.readAt
          ? false
          : true,
        lastMessageContent: lastMessage?.content,
        lastMessageDate: lastMessage?.sentAt,
        status: this.socketService.isUserConnected(f.invitee.id)
          ? userStatus.ONLINE
          : userStatus.OFFLINE,
      });
    });

    return mergeResult.sort((x, y) => {
      const x_val = x.lastMessageDate ? x.lastMessageDate.valueOf() : -1;
      const y_val = y.lastMessageDate ? y.lastMessageDate.valueOf() : -1;
      return y_val - x_val;
    });
  }

  async sendDirectMessage(
    currentUserId: number,
    userId: number,
    message: string
  ) {
    try {
      await this.prismaService.directMessage.create({
        data: {
          content: message,
          authorId: currentUserId,
          recipientId: userId,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async emitUserCacheInvalidation(
    currentUserId: number,
    InvalidCacheTarget: InvalidCacheTarget
  ) {
    const users = await this.prismaService.user.findMany();
    this.socketService.emitInvalidateCache(
      InvalidCacheTarget,
      users.map((u) => u.id),
      currentUserId
    );
  }
}
