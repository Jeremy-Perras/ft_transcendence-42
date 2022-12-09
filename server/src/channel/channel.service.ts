import { InvalidCacheTarget } from "@apps/shared";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Achievement, DirectMessage, Channel, User } from "@prisma/client";
import DataLoader from "dataloader";
import { channel } from "diagnostics_channel";
import { PrismaService } from "../prisma/prisma.service";
import { SocketService } from "../socket/socket.service";
import { UserService } from "../user/user.service";

@Injectable()
export class ChannelService {
  constructor(
    private prismaService: PrismaService,
    private socketService: SocketService
  ) {}

  private static formatChannel(channel: Channel) {
    return {
      id: channel.id,
      name: channel.name,
      passwordProtected: !!channel.password,
      private: channel.inviteOnly,
    };
  }

  async getChannelById(
    dataloader: DataLoader<Channel["id"], Channel>,
    id: number
  ) {
    try {
      return ChannelService.formatChannel(await dataloader.load(id));
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async getOwner(
    dataloader: DataLoader<Channel["id"], User>,
    channelId: number
  ) {
    try {
      return UserService.formatUser(await dataloader.load(channelId));
    } catch {
      throw new NotFoundException("Channel not found");
    }
  }

  async getAdmins(
    dataloader: DataLoader<Channel["id"], User[]>,
    channelId: number
  ) {
    try {
      return (await dataloader.load(channelId)).map(UserService.formatUser);
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async getMembers(
    dataloader: DataLoader<Channel["id"], User[]>,
    channelId: number
  ) {
    try {
      return (await dataloader.load(channelId)).map(UserService.formatUser);
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async addAdmin(channelId: number, userId: number) {
    try {
      const ismember = await this.prismaService.channelMember.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId,
          },
        },
      });
    } catch {
      throw new NotFoundException("User is not a member");
    }

    await this.prismaService.channelMember.update({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
      data: {
        isAdministrator: true,
      },
    });

    const owner = this.getOwner(channelId);
    const members = this.getMembers(channelId);
    const users = [owner, members];
    // const users = usersChannel?.members.map((u) => u.userId);
    // if (usersChannel?.ownerId) users?.push(usersChannel?.ownerId);

    if (users) {
      this.socketService.emitInvalidateCache(
        InvalidCacheTarget.ADD_ADMIN,
        users,
        channelId
      );
    }
  }

  async removeAdmin(channelId: number, userId: number) {
    try {
      const isadmin = await this.prismaService.channelMember.findFirst({
        where: {
          userId,
          isAdministrator: true,
        },
      });
    } catch {
      throw new NotFoundException("User is not a member or an admin");
    }

    await this.prismaService.channelMember.update({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
      data: {
        isAdministrator: false,
      },
    });

    const usersChannel = await this.prismaService.channel.findUnique({
      select: { members: true, ownerId: true },
      where: { id: channelId },
    });

    // const users = usersChannel?.members.map((u) => u.userId);
    // if (usersChannel?.ownerId) users?.push(usersChannel?.ownerId);
    const users = this.getMembers(channelId);
    if (users) {
      this.socketService.emitInvalidateCache(
        InvalidCacheTarget.REMOVE_ADMIN,
        users,
        channelId
      );
    }
  }
}
