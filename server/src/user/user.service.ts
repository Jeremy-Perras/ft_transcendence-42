import { InvalidCacheTarget } from "@apps/shared";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Achievement, DirectMessage, User } from "@prisma/client";
import DataLoader from "dataloader";
import { PrismaService } from "../prisma/prisma.service";
import { SocketService } from "../socket/socket.service";

// TODO: pass UserLoader to prime cache when possible

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private socketService: SocketService
  ) {}

  private static formatUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      rank: user.rank,
    };
  }

  async getUserById(dataloader: DataLoader<User["id"], User>, id: number) {
    try {
      return UserService.formatUser(await dataloader.load(id));
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }

  async searchUsersByName(
    dataloader: DataLoader<User["id"], User>,
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
      dataloader.prime(user.id, user);
      return UserService.formatUser(user);
    });
  }

  async getFriendedBy(dataloader: DataLoader<User["id"], User[]>, id: number) {
    const friendedBy = await dataloader.load(id);
    return friendedBy.map(UserService.formatUser);
  }

  async getFriends(dataloader: DataLoader<User["id"], User[]>, id: number) {
    const friends = await dataloader.load(id);
    return friends.map(UserService.formatUser);
  }

  async getBlockedBy(dataloader: DataLoader<User["id"], User[]>, id: number) {
    return (await dataloader.load(id)).map(UserService.formatUser);
  }

  async getBlocking(dataloader: DataLoader<User["id"], User[]>, id: number) {
    return (await dataloader.load(id)).map(UserService.formatUser);
  }

  async getAchievements(
    dataloader: DataLoader<User["id"], Achievement[]>,
    id: number
  ) {
    const achievements = await dataloader.load(id);
    return achievements.map((achievement) => {
      return {
        name: achievement.name,
        icon: achievement.icon,
      };
    });
  }

  async unblock(currentUserId: number, userId: number) {
    await this.prismaService.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        blocking: { disconnect: { id: userId } },
      },
    });
  }

  async block(currentUserId: number, userId: number) {
    this.unFriend(currentUserId, userId);

    this.prismaService.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        blocking: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async unFriend(currentUserId: number, userId: number) {
    await this.prismaService.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        friends: {
          disconnect: {
            id: userId,
          },
        },
      },
    });

    this.refuseFriendInvite(currentUserId, userId);
  }

  async friend(currentUserId: number, userId: number) {
    await this.prismaService.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        friends: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async refuseFriendInvite(currentUserId: number, userId: number) {
    await this.prismaService.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        friendedBy: {
          disconnect: {
            id: userId,
          },
        },
      },
    });
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
      // P2002: Unique constraint failed on the fields: (`name`)
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
  }

  async sendDirectMessage(
    currentUserId: number,
    userId: number,
    message: string
  ) {
    await this.prismaService.directMessage.create({
      data: {
        content: message,
        authorId: currentUserId,
        recipientId: userId,
        sentAt: new Date(),
      },
    });
  }

  async emitUserCacheInvalidation(currentUserId: number) {
    const users = await this.prismaService.user.findMany();
    this.socketService.emitInvalidateCache(
      InvalidCacheTarget.UPDATE_USER_NAME,
      users.map((u) => u.id),
      currentUserId
    );
  }
}
