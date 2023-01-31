import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserAchievement, Channel, DirectMessage, User } from "@prisma/client";
import DataLoader from "dataloader";
import { PrismaService } from "../prisma/prisma.service";
import {
  Chat,
  ChatType,
  MatchmakingState,
  PlayingState,
  UserStatus,
  WaitingForInviteeState,
} from "./user.model";
import { ChannelService } from "../channel/channel.service";
import { GraphqlUser } from "./user.resolver";
import { GraphqlChannel } from "../channel/channel.resolver";
import { SocketGateway } from "../socket/socket.gateway";
import { GameService } from "../game/game.service";
import { waitFor } from "xstate/lib/waitFor";
import UserSession from "../auth/userSession.model";
import { authenticator } from "otplib";

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private socketGateway: SocketGateway,
    private gameService: GameService
  ) {}

  private newAccount = new Map<
    number,
    { id: number; name: string; image: string }
  >();

  getNewAccountInfo(id: number) {
    const user = this.newAccount.get(id);
    if (user && user.name && user.image && user.id) {
      return { name: user.name, image: user.image, id: user.id };
    } else {
      return undefined;
    }
  }

  async validateNewAccount(id: number, name: string) {
    const user = this.getNewAccountInfo(id);
    if (user) {
      const image_response = await fetch(user.image);
      if (!image_response.ok) throw new Error("image_response not ok");
      const image_array_buffer = await image_response.arrayBuffer();
      const image_magic_code = Buffer.from(image_array_buffer, 0, 4);
      let file_type: "JPG" | "PNG" | undefined;
      if (
        Buffer.from("ffd8ffe0", "hex").equals(image_magic_code) ||
        Buffer.from("ffd8ffe1", "hex").equals(image_magic_code)
      ) {
        file_type = "JPG";
      } else if (Buffer.from("89504e47", "hex").equals(image_magic_code)) {
        file_type = "PNG";
      }
      if (!file_type) throw new Error("file_type not ok");
      try {
        const newUser = await this.prismaService.user.create({
          data: {
            id: user.id,
            name: name,
          },
        });
        await this.prismaService.avatar.create({
          data: {
            userId: newUser.id,
            image: Buffer.from(image_array_buffer),
            fileType: file_type,
          },
        });
        this.newAccount.delete(id);
        return {
          id: newUser.id,
          twoFactorVerified: undefined,
        };
      } catch (error) {
        return "This username is already in use.";
      }
    }
    return "Error creating account, try again!";
  }

  static formatGraphqlUser(user: User): GraphqlUser {
    return {
      id: user.id,
      name: user.name,
      rank: user.rank,
    };
  }

  async getOrCreateUser(accessToken: string): Promise<UserSession | number> {
    try {
      const user42_response = await fetch("https://api.intra.42.fr/v2/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!user42_response.ok) throw new Error();
      const user42_data = await user42_response.json();
      if (
        "id" in user42_data &&
        "login" in user42_data &&
        "image" in user42_data &&
        "link" in user42_data.image
      ) {
        const user = await this.prismaService.user.findUnique({
          where: {
            id: user42_data.id,
          },
        });

        if (user) {
          return {
            id: user.id,
            twoFactorVerified: user.twoFASecret ? false : undefined,
          };
        } else {
          const id = Math.floor(Math.random() * 1000);
          this.newAccount.set(id, {
            id: user42_data.id,
            name: user42_data.login,
            image: user42_data.image.link,
          });
          return id;
        }
      } else {
        throw new Error();
      }
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async getUser2FASecret(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user.twoFASecret;
  }

  async get2FAStatus(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user.twoFASecret ? true : false;
  }

  async getUserById(userLoader: DataLoader<User["id"], User>, id: number) {
    try {
      return UserService.formatGraphqlUser(await userLoader.load(id));
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
      return UserService.formatGraphqlUser(user);
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
          acc.push(UserService.formatGraphqlUser(curr));
        }
        return acc;
      }, new Array<GraphqlUser>());
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
          acc.push(UserService.formatGraphqlUser(curr));
        }
        return acc;
      }, new Array<GraphqlUser>());
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
          acc.push(UserService.formatGraphqlUser(curr));
        }
        return acc;
      }, new Array<GraphqlUser>());
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
          acc.push(UserService.formatGraphqlUser(curr));
        }
        return acc;
      }, new Array<GraphqlUser>());
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async getAchievements(
    achievementDataloader: DataLoader<User["id"], UserAchievement[]>,
    id: number
  ) {
    try {
      const achievements = await achievementDataloader.load(id);
      return achievements.map((achievement) => {
        return {
          name: achievement.achievement,
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
      }, new Array<GraphqlChannel>());
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async unblock(currentUserId: number, userId: number) {
    try {
      await this.prismaService.userBlock.delete({
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
      await this.prismaService.userBlock.create({
        data: {
          blockeeId: userId,
          blockerId: currentUserId,
        },
      });

      await this.unFriend(currentUserId, userId);
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async unFriend(currentUserId: number, userId: number) {
    try {
      const invitationSent = await this.prismaService.user.findUnique({
        select: {
          friendRequestsReceived: { where: { senderId: currentUserId } },
        },
        where: { id: userId },
      });
      if (
        invitationSent?.friendRequestsReceived &&
        invitationSent?.friendRequestsReceived.length > 0
      )
        await this.prismaService.friendRequest.delete({
          where: {
            senderId_receiverId: {
              senderId: currentUserId,
              receiverId: userId,
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
      await this.prismaService.friendRequest.create({
        data: {
          senderId: currentUserId,
          receiverId: userId,
        },
      });
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async refuseFriendInvite(currentUserId: number, userId: number) {
    try {
      const invitationReceived = await this.prismaService.user.findUnique({
        select: {
          friendRequestsReceived: { where: { senderId: userId } },
        },
        where: { id: currentUserId },
      });
      if (
        invitationReceived?.friendRequestsReceived &&
        invitationReceived?.friendRequestsReceived.length > 0
      )
        await this.prismaService.friendRequest.delete({
          where: {
            senderId_receiverId: {
              senderId: userId,
              receiverId: currentUserId,
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
        .sort((a, b) => a.sentAt.valueOf() - b.sentAt.valueOf())
        .map((message) => ({
          id: message.id,
          content: message.content,
          sentAt: message.sentAt,
          readAt: message.readAt ?? undefined,
          author: UserService.formatGraphqlUser(message.author),
          recipient: UserService.formatGraphqlUser(message.recipient),
        }));
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async getGames(userId: number) {
    const games = await this.prismaService.game.findMany({
      select: {
        id: true,
        startedAt: true,
        finishedAt: true,
        mode: true,
        player1Score: true,
        player2Score: true,
        player1Id: true,
        player2Id: true,
      },
      where: {
        OR: [
          {
            player1Id: userId,
          },
          {
            player2Id: userId,
          },
        ],
      },
      orderBy: { startedAt: "desc" },
    });
    return games.map((game) => ({
      id: game.id,
      gameMode: game.mode,
      startAt: game.startedAt,
      finishedAt: game.finishedAt ?? undefined,
      score: {
        player1Score: game.player1Score,
        player2Score: game.player2Score,
      },
      player1Id: game.player1Id,
      player2Id: game.player2Id,
    }));
  }

  async getChats(currentUserId: number) {
    const res = await this.prismaService.user.findUnique({
      where: { id: currentUserId },
      select: {
        usersBlocked: true,
        friendRequestsSent: {
          where: {
            receiver: {
              friendRequestsSent: {
                some: {
                  receiverId: currentUserId,
                },
              },
            },
          },
          select: {
            receiver: {
              select: {
                id: true,
                name: true,
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

    const formatChannel = (channel: (typeof res.ownedChannels)[number]) => {
      mergeResult.push({
        type: ChatType.CHANNEL,
        id: channel.id,
        name: channel.name,
        lastMessageContent: res.usersBlocked.some(
          (u) => u.blockeeId === channel.channelMessages[0]?.authorId
        )
          ? "Unblock this user to see this message"
          : channel.channelMessages[0]?.content,
        lastMessageDate: channel.channelMessages[0]?.sentAt,
        hasUnreadMessages: channel.channelMessages[0]
          ? channel.channelMessages[0].authorId === currentUserId
            ? false
            : !channel.channelMessages[0].readBy.some(
                (id) => id.userId === currentUserId
              )
          : false,
        status: undefined,
      });
    };
    res?.ownedChannels.forEach(formatChannel);
    res?.channels.forEach((c) => formatChannel(c.channel));

    res.friendRequestsSent.forEach((f) => {
      let lastMessage;
      if (f.receiver.messageReceived[0] && f.receiver.messageSent[0]) {
        f.receiver.messageReceived[0]?.sentAt <
        f.receiver.messageSent[0]?.sentAt
          ? (lastMessage = f.receiver.messageSent[0])
          : (lastMessage = f.receiver.messageReceived[0]);
      } else if (f.receiver.messageReceived[0] && !f.receiver.messageSent[0])
        lastMessage = f.receiver.messageReceived[0];
      else if (f.receiver.messageSent[0] && !f.receiver.messageReceived[0])
        lastMessage = f.receiver.messageSent[0];
      else lastMessage = undefined;

      mergeResult.push({
        type: ChatType.USER,
        id: f.receiver.id,
        name: f.receiver.name,
        hasUnreadMessages: lastMessage
          ? lastMessage.authorId === currentUserId
            ? false
            : !lastMessage.readAt
          : false,
        lastMessageContent: lastMessage?.content,
        lastMessageDate: lastMessage?.sentAt,
        status: this.socketGateway.isOnline(f.receiver.id)
          ? UserStatus.ONLINE
          : UserStatus.OFFLINE,
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

  async getInvitations(currentUserId: number) {
    const player = this.gameService.getPlayer(currentUserId);
    if (!player) return [];
    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: [...player.getSnapshot().context.invitations.keys()],
        },
      },
    });
    return users.map((user) => ({
      gameMode: player.getSnapshot().context.invitations.get(user.id)!,
      sender: {
        id: user.id,
        name: user.name,
        rank: user.rank,
      },
    }));
  }

  async getState(currentUserId: number) {
    const player = this.gameService.getPlayer(currentUserId);
    if (!player) return null;

    try {
      await waitFor(
        player,
        (state) => !state.matches("disconnected") && !state.matches("offline"),
        { timeout: 1000 }
      );
      const snap = player.getSnapshot();
      if (snap.matches("_.playing")) {
        const game = this.gameService.getGame(currentUserId)!;
        const c = new PlayingState();
        c.game = {
          gameMode: game.game.type,
          id: game.id,
          score: {
            player1Score: game.player1.score,
            player2Score: game.player2.score,
          },
          startAt: game.startedAt,
        };
        return c;
      } else if (snap.matches("_.waitingForInvitee")) {
        const user = await this.prismaService.user.findUnique({
          where: { id: player.getSnapshot().context.inviteeId },
        });
        const c = new WaitingForInviteeState();
        c.invitee = { id: user!.id, name: user!.name, rank: user!.rank };
        c.gameMode = player.getSnapshot().context.gameMode!;
        return c;
      } else if (snap.matches("_.waitingForMatchmaking")) {
        const c = new MatchmakingState();
        c.gameMode = player.getSnapshot().context.gameMode!;
        return c;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async enable2Fa(currentUserId: number, secret: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: currentUserId },
    });

    if (!user) throw new NotFoundException("User not found");
    if (user.twoFASecret) throw new BadRequestException("2FA already enabled");

    await this.prismaService.user.update({
      where: { id: currentUserId },
      data: {
        twoFASecret: secret,
      },
    });
  }

  async disable2Fa(currentUserId: number, token: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: currentUserId },
    });

    if (!user) throw new NotFoundException("User not found");
    if (!user.twoFASecret) throw new BadRequestException("2FA not enabled");

    if (authenticator.check(token, user.twoFASecret)) {
      await this.prismaService.user.update({
        where: { id: currentUserId },
        data: {
          twoFASecret: null,
        },
      });
    } else {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
