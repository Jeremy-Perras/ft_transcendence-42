import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  Channel,
  User,
  ChannelMember,
  ChannelMessage,
  ChannelRole,
  ChannelRestrictedUser,
  ChannelRestriction,
} from "@prisma/client";
import DataLoader from "dataloader";
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "../user/user.service";
import bcrypt from "bcrypt";
import { GraphqlUser } from "../user/user.resolver";
import { GraphqlChannelRestrictedUser } from "./channel.resolver";

@Injectable()
export class ChannelService {
  constructor(private prismaService: PrismaService) {}

  private readonly logger = new Logger(ChannelService.name);

  static formatChannel(channel: Channel) {
    return {
      id: channel.id,
      name: channel.name,
      passwordProtected: !!channel.password,
      private: channel.inviteOnly,
    };
  }

  async getChannelById(
    channelLoader: DataLoader<Channel["id"], Channel>,
    id: number
  ) {
    try {
      return ChannelService.formatChannel(await channelLoader.load(id));
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async searchChannelsByName(
    channelLoader: DataLoader<Channel["id"], Channel>,
    name: string
  ) {
    const channels = await this.prismaService.channel.findMany({
      where: {
        name: {
          mode: "insensitive",
          contains: name,
        },
      },
    });
    return channels.map((channel) => {
      channelLoader.prime(channel.id, channel);
      return ChannelService.formatChannel(channel);
    });
  }

  async getOwner(
    channelLoader: DataLoader<Channel["id"], Channel>,
    userLoader: DataLoader<User["id"], User>,
    channelId: number
  ) {
    try {
      const channel = await channelLoader.load(channelId);
      return UserService.formatGraphqlUser(
        await userLoader.load(channel.ownerId)
      );
    } catch {
      throw new NotFoundException("Channel not found");
    }
  }

  async getAdmins(
    channelMembersLoader: DataLoader<Channel["id"], ChannelMember[]>,
    userLoader: DataLoader<User["id"], User>,
    channelId: number
  ) {
    try {
      const channelMembers = await channelMembersLoader.load(channelId);
      const adminIds = channelMembers.reduce((acc, curr) => {
        if (curr.role === ChannelRole.ADMIN) acc.push(curr.userId);
        return acc;
      }, new Array<number>());

      const admins = await userLoader.loadMany(adminIds);

      return admins.reduce((acc, curr) => {
        if (curr && "id" in curr && adminIds.some((id) => id === curr.id)) {
          //TODO : Remove the last condition when userloader repared
          acc.push(UserService.formatGraphqlUser(curr));
        }
        return acc;
      }, new Array<GraphqlUser>());
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async getMembers(
    channelMembersLoader: DataLoader<Channel["id"], ChannelMember[]>,
    userLoader: DataLoader<User["id"], User>,
    channelId: number
  ) {
    try {
      const channelMembers = await channelMembersLoader.load(channelId);
      const membersIds = channelMembers.reduce((acc, curr) => {
        if (curr.role === ChannelRole.MEMBER) acc.push(curr.userId);
        return acc;
      }, new Array<number>());
      const members = await userLoader.loadMany(membersIds);
      return members.reduce((acc, curr) => {
        if (curr && "id" in curr) {
          acc.push(UserService.formatGraphqlUser(curr));
        }
        return acc;
      }, new Array<GraphqlUser>());
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async getRestrictedMembers(
    channelRestrictedUserLoader: DataLoader<
      Channel["id"],
      ChannelRestrictedUser[]
    >,
    userLoader: DataLoader<User["id"], User>,
    channelId: number,
    type: ChannelRestriction
  ) {
    try {
      const restrictedUsers = await channelRestrictedUserLoader.load(channelId);
      const restrictedMembersId = restrictedUsers.reduce((acc, curr) => {
        if (curr.restriction === type) {
          acc.push(curr.userId);
        }
        return acc;
      }, new Array<number>());
      const users = await userLoader.loadMany(restrictedMembersId);
      return users.reduce((acc, curr) => {
        if (curr && "id" in curr) {
          const restricted: GraphqlChannelRestrictedUser = {
            user: UserService.formatGraphqlUser(curr),
          };
          const restrictedUserIndex = restrictedUsers.findIndex(
            (m) => curr.id === m.userId
          );
          if (restrictedUserIndex >= 0) {
            const restrictedUser = restrictedUsers[restrictedUserIndex];
            if (restrictedUser) {
              restricted.endAt = restrictedUser.endAt ?? undefined;
              restrictedUsers.slice(restrictedUserIndex, 0);
              acc.push(restricted);
            }
          }
        }
        return acc;
      }, new Array<GraphqlChannelRestrictedUser>());
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async getMessages(
    userChannelIdsLoader: DataLoader<User["id"], number[]>,
    channelMessageLoader: DataLoader<Channel["id"], ChannelMessage[]>,
    blockingIdsLoader: DataLoader<User["id"], number[]>,
    channelId: number,
    currentUserId: number
  ) {
    try {
      const userChannels = await userChannelIdsLoader.load(currentUserId);
      if (userChannels.some((c) => c === channelId)) {
        const messages = await channelMessageLoader.load(channelId);

        await this.prismaService.channelMessageRead.createMany({
          data: messages.map((message) => ({
            messageId: message.id,
            userId: currentUserId,
          })),
          skipDuplicates: true,
        });
        const blockedIds = await blockingIdsLoader.load(currentUserId);
        return messages.map((message) => ({
          id: message.id,
          content: blockedIds.some((i) => i === message.authorId)
            ? null
            : message.content,
          sentAt: message.sentAt,
          authorId: message.authorId,
        }));
      }
      return [];
    } catch {
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
        restrictedMembers: {
          where: {
            userId: currentUserId,
            restriction: ChannelRestriction.BAN,
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

    if (channel.restrictedMembers.length > 0) {
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
              joinedAt: "asc",
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

            const ismuted =
              await this.prismaService.channelRestrictedUser.findFirst({
                where: {
                  restriction: ChannelRestriction.MUTE,
                  channelId,
                  userId: newOwner.userId,
                },
              });
            if (ismuted) {
              await this.prismaService.channelRestrictedUser.delete({
                where: {
                  channelId_userId_restriction: {
                    channelId,
                    userId: newOwner.userId,
                    restriction: ChannelRestriction.MUTE,
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

  async setUserRestriction(
    channelId: number,
    userId: number,
    restrictUntil: Date | null,
    type: ChannelRestriction
  ) {
    try {
      const isRestricted =
        await this.prismaService.channelRestrictedUser.findUnique({
          where: {
            channelId_userId_restriction: {
              channelId,
              userId,
              restriction: type,
            },
          },
        });

      if (isRestricted) {
        await this.prismaService.channelRestrictedUser.update({
          where: {
            channelId_userId_restriction: {
              channelId,
              userId,
              restriction: type,
            },
          },
          data: {
            endAt: restrictUntil,
          },
        });
      } else {
        await this.prismaService.channelRestrictedUser.create({
          data: { endAt: restrictUntil, channelId, userId, restriction: type },
        });
        if (
          type === ChannelRestriction.BAN &&
          (restrictUntil === null || restrictUntil > new Date())
        ) {
          try {
            await this.prismaService.channelMember.delete({
              where: {
                channelId_userId: {
                  channelId,
                  userId,
                },
              },
            });
          } catch (error) {
            this.logger.warn(error);
          }
        }
      }
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async updatePassword(channelId: number, hash: string | null) {
    await this.prismaService.channel.update({
      where: { id: channelId },
      data: { password: hash },
    });
  }

  async inviteUser(channelId: number, userId: number) {
    try {
      const isbanned =
        await this.prismaService.channelRestrictedUser.findUnique({
          where: {
            channelId_userId_restriction: {
              channelId,
              userId,
              restriction: ChannelRestriction.BAN,
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
      const ismember = await this.prismaService.channelMember.findUniqueOrThrow(
        {
          where: {
            channelId_userId: {
              channelId,
              userId,
            },
          },
        }
      );
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
        role: ChannelRole.ADMIN,
      },
    });
  }

  async removeAdmin(channelId: number, userId: number) {
    try {
      const isadmin = await this.prismaService.channelMember.findFirstOrThrow({
        where: {
          userId,
          role: ChannelRole.ADMIN,
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
        role: ChannelRole.MEMBER,
      },
    });
  }
}
