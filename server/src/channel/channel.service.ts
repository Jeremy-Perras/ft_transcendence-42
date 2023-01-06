import {
  ForbiddenException,
  Injectable,
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
    currentUserId: number,
    channelLoader: DataLoader<Channel["id"], Channel>,
    channelMembersLoader: DataLoader<Channel["id"], ChannelMember[]>,
    userLoader: DataLoader<User["id"], User>,
    channelId: number
  ) {
    try {
      const channel = await channelLoader.load(channelId);
      const channelMembers = await channelMembersLoader.load(channelId);
      if (
        channel.ownerId === currentUserId ||
        channelMembers.some((member) => member.userId === currentUserId)
      ) {
        const adminIds = channelMembers.reduce((acc, curr) => {
          if (curr.role === ChannelRole.ADMIN) acc.push(curr.userId);
          return acc;
        }, new Array<number>());

        const admins = await userLoader.loadMany(adminIds);

        return admins.reduce((acc, curr) => {
          if (curr && "id" in curr) {
            acc.push(UserService.formatGraphqlUser(curr));
          }
          return acc;
        }, new Array<GraphqlUser>());
      }
      return [];
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async getMembers(
    currentUserId: number,
    channelLoader: DataLoader<Channel["id"], Channel>,
    channelMembersLoader: DataLoader<Channel["id"], ChannelMember[]>,
    userLoader: DataLoader<User["id"], User>,
    channelId: number
  ) {
    try {
      const channel = await channelLoader.load(channelId);
      const channelMembers = await channelMembersLoader.load(channelId);
      if (
        channel.ownerId === currentUserId ||
        channelMembers.some(
          (member) =>
            member.userId === currentUserId && member.role === ChannelRole.ADMIN
        )
      ) {
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
      }
      return [];
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async getRestrictedMembers(
    userChannelIdsLoader: DataLoader<User["id"], number[]>,
    currentUserId: number,
    channelRestrictedUserLoader: DataLoader<
      Channel["id"],
      ChannelRestrictedUser[]
    >,
    userLoader: DataLoader<User["id"], User>,
    channelId: number,
    type: ChannelRestriction
  ) {
    try {
      const userChannels = await userChannelIdsLoader.load(currentUserId);
      if (userChannels.some((c) => c === channelId)) {
        const restrictedUsers = await channelRestrictedUserLoader.load(
          channelId
        );
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
      }
      return [];
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
    try {
      const channel = await this.prismaService.channel.findUniqueOrThrow({
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

      if (channel.members.length > 0 || channel.ownerId === currentUserId) {
        throw new ForbiddenException("You are already a member");
      }

      if (channel.restrictedMembers.length > 0) {
        throw new ForbiddenException("You are banned from this channel");
      }

      if (channel.inviteOnly) {
        throw new ForbiddenException("This channel is invite only");
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
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new NotFoundException("Channel not found");
    }
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
        } else if (channel.members.some((m) => m.userId === currentUserId)) {
          await this.prismaService.channelMember.delete({
            where: {
              channelId_userId: {
                channelId,
                userId: currentUserId,
              },
            },
          });
        } else {
          throw new ForbiddenException("You are not a member of this channel");
        }
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
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
      throw new ForbiddenException("This channel cannot be created");
    }
  }

  async deleteChannel(channelId: number, currentUserId: number) {
    try {
      await this.prismaService.channel.findFirstOrThrow({
        where: {
          id: channelId,
          ownerId: currentUserId,
        },
      });
    } catch (error) {
      throw new ForbiddenException("You are not the owner of this channel");
    }

    try {
      await this.prismaService.channel.delete({
        where: { id: channelId },
      });
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async setUserRestriction(
    currentUserId: number,
    channelId: number,
    userId: number,
    restrictUntil: Date | null,
    type: ChannelRestriction
  ) {
    try {
      const channel = await this.prismaService.channel.findUnique({
        where: {
          id: channelId,
        },
        select: {
          ownerId: true,
          members: {
            where: {
              OR: [
                {
                  userId: userId,
                },
                {
                  userId: currentUserId,
                },
              ],
            },
            select: {
              userId: true,
              role: true,
            },
          },
        },
      });
      const role =
        channel?.ownerId === currentUserId
          ? "OWNER"
          : channel?.members.find((m) => m.userId === currentUserId)?.role ??
            null;
      const targetRole =
        channel?.ownerId === userId
          ? "OWNER"
          : channel?.members.find((m) => m.userId === userId)?.role ?? null;

      if (
        !(role === "OWNER" || role === "ADMIN") ||
        targetRole === "OWNER" ||
        (targetRole === "ADMIN" && role !== "OWNER")
      )
        throw new ForbiddenException(
          "You do not have the permission to do this"
        );

      await this.prismaService.channelRestrictedUser.upsert({
        where: {
          channelId_userId_restriction: {
            channelId,
            userId,
            restriction: type,
          },
        },
        create: {
          channelId,
          restriction: type,
          userId,
          endAt: restrictUntil,
        },
        update: {
          endAt: restrictUntil,
        },
      });

      if (type === ChannelRestriction.BAN && targetRole) {
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
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new NotFoundException("Channel not found");
    }
  }

  async updatePassword(
    channelId: number,
    hash: string | null,
    currentUserId: number
  ) {
    try {
      await this.prismaService.channel.findFirstOrThrow({
        where: {
          id: channelId,
          ownerId: currentUserId,
        },
      });
    } catch (error) {
      throw new ForbiddenException("You are not the owner of this channel");
    }

    try {
      await this.prismaService.channel.update({
        where: { id: channelId },
        data: { password: hash },
      });
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async inviteUser(channelId: number, userId: number) {
    const isMember = await this.prismaService.channel.findFirst({
      where: {
        id: channelId,
        OR: [
          {
            ownerId: userId,
          },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    });
    if (isMember) throw new ForbiddenException("User is already a member");

    const isBanned = await this.prismaService.channelRestrictedUser.findFirst({
      where: {
        channelId,
        userId,
        restriction: ChannelRestriction.BAN,
        OR: [
          {
            endAt: {
              gt: new Date(),
            },
          },
          {
            endAt: null,
          },
        ],
      },
    });
    if (isBanned) throw new ForbiddenException("User is banned");

    try {
      await this.prismaService.channelMember.create({
        data: { channelId, userId },
      });
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async addAdmin(channelId: number, userId: number, currentUserId: number) {
    try {
      await this.prismaService.channel.findFirstOrThrow({
        where: {
          id: channelId,
          ownerId: currentUserId,
        },
      });
    } catch (error) {
      throw new ForbiddenException("You are not the owner of this channel");
    }

    try {
      await this.prismaService.channelMember.findFirstOrThrow({
        where: {
          userId,
          role: ChannelRole.MEMBER,
        },
      });
    } catch {
      throw new NotFoundException("User is not a member");
    }

    try {
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
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }

  async removeAdmin(channelId: number, userId: number, currentUserId: number) {
    try {
      await this.prismaService.channel.findFirstOrThrow({
        where: {
          id: channelId,
          ownerId: currentUserId,
        },
      });
    } catch (error) {
      throw new ForbiddenException("You are not the owner of this channel");
    }

    try {
      await this.prismaService.channelMember.findFirstOrThrow({
        where: {
          userId,
          role: ChannelRole.ADMIN,
        },
      });
    } catch {
      throw new NotFoundException("User is not an admin");
    }

    try {
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
    } catch (error) {
      throw new NotFoundException("Channel not found");
    }
  }
}
