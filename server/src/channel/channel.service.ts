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
import bcrypt from "bcrypt";
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

  async joinChannel(
    channelId: number,
    password: string | null,
    currentUserId: number
  ) {
    const channel = await this.prismaService.channel.findUnique({
      select: {
        inviteOnly: true,
        password: true,
        ownerId: true,
        members: {
          where: {
            userId: currentUserId,
          },
        },
        banned: {
          where: {
            userId: currentUserId,
          },
        },
      },
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    if (channel.members.length > 0 || channel.ownerId === currentUserId) {
      throw new ForbiddenException("User is already a member");
    }

    if (channel.banned.length > 0) {
      throw new ForbiddenException("User is banned");
    }

    if (channel.inviteOnly) {
      throw new ForbiddenException("Channel is invite only");
    }

    if (
      channel.password &&
      (!password || !bcrypt.compareSync(password, channel.password))
    ) {
      throw new ForbiddenException("Password is incorrect");
    }

    await this.prismaService.channelMember.create({
      data: {
        userId: currentUserId,
        channelId,
      },
    });
  }

  async leaveChannel(channelId: number, currentUserId: number) {
    try {
      const channel = await this.prismaService.channel.findUnique({
        select: {
          ownerId: true,
          members: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        where: {
          id: channelId,
        },
      });
      if (channel) {
        if (channel.ownerId === currentUserId) {
          if (channel.members.length === 0) {
            await this.prismaService.channel.delete({
              where: {
                id: channelId,
              },
            });
          } else if (channel.members[0]) {
            const newOwner = channel.members[0];
            await this.prismaService.channel.update({
              data: {
                ownerId: newOwner.userId,
              },
              where: {
                id: channelId,
              },
            });
            await this.prismaService.channelMember.delete({
              where: {
                channelId_userId: {
                  channelId,
                  userId: newOwner.userId,
                },
              },
            });
            const ismuted = await this.prismaService.mutedMember.findFirst({
              where: {
                channelId,
                userId: newOwner.userId,
              },
            });
            if (ismuted) {
              await this.prismaService.mutedMember.delete({
                where: {
                  channelId_userId: {
                    channelId,
                    userId: newOwner.userId,
                  },
                },
              });
            }
          }
        } else {
          await this.prismaService.channelMember.delete({
            where: {
              channelId_userId: {
                channelId,
                userId: currentUserId,
              },
            },
          });
        }
      }
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async createChannel(
    inviteOnly: boolean,
    name: string,
    hash: string | null,
    currentUserId: number
  ) {
    try {
      await this.prismaService.channel.create({
        data: {
          inviteOnly: inviteOnly,
          name: name,
          password: hash,
          ownerId: currentUserId,
        },
      });
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async deleteChannel(channelId: number) {
    try {
      await this.prismaService.channel.delete({
        where: { id: channelId },
      });
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async muteUser(channelId: number, userId: number, muteUntil: Date | null) {
    try {
      const ismuted = await this.prismaService.mutedMember.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId,
          },
        },
      });

      if (ismuted) {
        await this.prismaService.mutedMember.update({
          where: {
            channelId_userId: {
              channelId,
              userId,
            },
          },
          data: {
            endAt: muteUntil,
          },
        });
      } else {
        await this.prismaService.mutedMember.create({
          data: { endAt: muteUntil, channelId, userId },
        });
      }
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async banUser(channelId: number, userId: number, banUntil: Date | null) {
    try {
      const isbanned = await this.prismaService.bannedMember.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId,
          },
        },
      });

      if (isbanned) {
        await this.prismaService.bannedMember.update({
          where: {
            channelId_userId: {
              channelId,
              userId,
            },
          },
          data: {
            endAt: banUntil,
          },
        });
      } else {
        await this.prismaService.bannedMember.create({
          data: { endAt: banUntil, channelId, userId },
        });
        await this.prismaService.channelMember.delete({
          where: {
            channelId_userId: {
              channelId,
              userId,
            },
          },
        });
      }
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async unmuteUser(channelId: number, userId: number) {
    try {
      const ismuted = await this.prismaService.mutedMember.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId,
          },
        },
      });

      if (!ismuted) {
        throw new NotFoundException("User is not muted");
      }
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
    await this.prismaService.mutedMember.delete({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
  }

  async unbanUser(channelId: number, userId: number) {
    try {
      const isbanned = await this.prismaService.bannedMember.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId,
          },
        },
      });
      if (!isbanned) {
        throw new NotFoundException("User is not banned");
      }
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
    await this.prismaService.bannedMember.delete({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
  }

  async updatePassword(channelId: number, hash: string) {
    await this.prismaService.channel.update({
      where: { id: channelId },
      data: { password: hash },
    });
  }

  async inviteUser(channelId: number, userId: number) {
    try {
      const isbanned = await this.prismaService.bannedMember.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId,
          },
        },
      });

      if (isbanned) {
        throw new ForbiddenException("User is banned");
      }

      await this.prismaService.channelMember.create({
        data: { channelId, userId },
      });
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
  }

  async getMembersFromChannelId(channelId: number) {
    const c = await this.prismaService.channel.findUnique({
      select: {
        ownerId: true,
        banned: { select: { userId: true } },
        members: {
          select: {
            userId: true,
          },
        },
      },
      where: {
        id: channelId,
      },
    });
    return c
      ? [
          ...c.members.map((m) => m.userId),
          ...c.banned.map((b) => b.userId),
          c.ownerId,
        ]
      : null;
  }

  async emitChannelCacheInvalidation(
    channelId: number,
    InvalidCacheTarget: InvalidCacheTarget,
    members: number[] | null
  ) {
    if (!members) {
      const c = await this.getMembersFromChannelId(channelId);
      if (c) {
        this.socketService.emitInvalidateCache(
          InvalidCacheTarget,
          c,
          channelId
        );
      }
    } else {
      if (members) {
        this.socketService.emitInvalidateCache(
          InvalidCacheTarget,
          members,
          channelId
        );
      }
    }
  }
}
