import {
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
import bcrypt from "bcrypt";
import {
  Args,
  Int,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql";
import { Prisma } from "@prisma/client";
import { GqlAuthenticatedGuard } from "../auth/authenticated.guard";
import { CurrentUser } from "../auth/currentUser.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { userType } from "../user/user.model";
import {
  Channel,
  ChannelMessage,
  ChannelMessageRead,
  channelMessageReadType,
  channelMessageType,
  channelType,
  restrictedMemberType,
} from "./channel.model";
import { Role, RoleGuard, RolesGuard } from "./channel.roles";
import { ExistingChannelGuard, OwnerGuard } from "./channel.guards";

@Resolver(Channel)
@UseGuards(RolesGuard)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelResolver {
  constructor(private prisma: PrismaService) {}

  @Query((returns) => Channel)
  async channel(
    @Args("id", { type: () => Int }) id: number
  ): Promise<channelType> {
    const channel = await this.prisma.channel.findUnique({
      select: {
        id: true,
        name: true,
        inviteOnly: true,
        password: true,
      },
      where: { id: id },
    });
    if (!channel) {
      throw new NotFoundException("Channel not found");
    }
    return {
      id: channel.id,
      name: channel.name,
      passwordProtected: !!channel.password,
      private: channel.inviteOnly,
    };
  }

  @Query((returns) => [Channel])
  async channels(
    @Args("name", {
      type: () => String,
      nullable: true,
      defaultValue: undefined,
    })
    name?: string | null,
    @Args("ownerId", {
      type: () => Int,
      nullable: true,
      defaultValue: undefined,
    })
    ownerId?: number | null,
    @Args("adminId", {
      type: () => Int,
      nullable: true,
      defaultValue: undefined,
    })
    adminId?: number | null,
    @Args("memberId", {
      type: () => Int,
      nullable: true,
      defaultValue: undefined,
    })
    memberId?: number | null
  ): Promise<channelType[]> {
    const where: Prisma.ChannelWhereInput = {
      name: {
        contains: name !== null ? name : undefined,
      },
      ownerId: ownerId !== null ? ownerId : undefined,
    };
    if (adminId !== null && typeof adminId !== "undefined")
      where.members = {
        some: {
          AND: {
            userId: adminId,
            isAdministrator: true,
          },
        },
      };
    if (memberId !== null && typeof memberId !== "undefined")
      where.members = {
        some: { userId: memberId },
      };
    const channels = await this.prisma.channel.findMany({
      select: { id: true, name: true, inviteOnly: true, password: true },
      where,
    });
    return channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      private: channel.inviteOnly,
      passwordProtected: !!channel.password,
    }));
  }

  @ResolveField()
  async owner(@Root() channel: Channel): Promise<userType> {
    const owner = await this.prisma.channel
      .findUnique({
        where: {
          id: channel.id,
        },
      })
      .owner();

    if (!owner) {
      throw new NotFoundException("Channel not found");
    }

    return {
      id: owner.id,
      name: owner.name,
      avatar: owner.avatar,
      rank: owner.rank,
    };
  }

  @ResolveField()
  async admins(@Root() channel: Channel): Promise<userType[]> {
    const admins = await this.prisma.channelMember.findMany({
      select: { user: true },
      where: {
        AND: {
          channelId: channel.id,
          isAdministrator: true,
        },
      },
    });
    return admins
      ? admins.map((admin) => ({
          id: admin.user.id,
          name: admin.user.name,
          avatar: admin.user.avatar,
          rank: admin.user.rank,
        }))
      : [];
  }

  @ResolveField()
  async members(@Root() channel: Channel): Promise<userType[]> {
    const members = await this.prisma.channelMember.findMany({
      select: { user: true },
      where: {
        channelId: channel.id,
      },
    });
    return members
      ? members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          avatar: member.user.avatar,
          rank: member.user.rank,
        }))
      : [];
  }

  @ResolveField()
  async muted(@Root() channel: Channel): Promise<restrictedMemberType[]> {
    const members = await this.prisma.mutedMember.findMany({
      select: { user: true, endAt: true },
      where: {
        channelId: channel.id,
      },
    });
    return members
      ? members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          avatar: member.user.avatar,
          rank: member.user.rank,
          endAt: member.endAt,
        }))
      : [];
  }

  @ResolveField()
  async banned(@Root() channel: Channel): Promise<restrictedMemberType[]> {
    const members = await this.prisma.bannedMember.findMany({
      select: { user: true, endAt: true },
      where: {
        channelId: channel.id,
      },
    });
    return members
      ? members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          avatar: member.user.avatar,
          rank: member.user.rank,
          endAt: member.endAt,
        }))
      : [];
  }

  @ResolveField()
  async messages(
    @Root() channel: Channel,
    @CurrentUser() currentUserId: number
  ): Promise<channelMessageType[]> {
    const c = await this.prisma.channel.findFirst({
      select: {
        channelMessages: {
          orderBy: [
            {
              sentAt: "asc",
            },
          ],
          select: {
            id: true,
            content: true,
            sentAt: true,
            readBy: true,
            author: true,
          },
        },
      },
      where: {
        id: channel.id,
        OR: [
          {
            ownerId: currentUserId,
          },
          {
            members: {
              some: {
                userId: currentUserId,
              },
            },
          },
        ],
      },
    });
    return c
      ? c.channelMessages.map((message) => ({
          id: message.id,
          content: message.content,
          sentAt: message.sentAt,
          author: message.author,
        }))
      : [];
  }

  @UseGuards(ExistingChannelGuard)
  @Mutation((returns) => Boolean)
  async joinChannel(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("password", { type: () => String, nullable: true })
    password: string | null,
    @CurrentUser() currentUserId: number
  ) {
    const channel = await this.prisma.channel.findUnique({
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

    await this.prisma.channelMember.create({
      data: {
        userId: currentUserId,
        channelId,
      },
    });
    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Member)
  @Mutation((returns) => Boolean)
  async leaveChannel(
    @Args("channelId", { type: () => Int }) channelId: number,
    @CurrentUser() currentUserId: number
  ) {
    const channel = await this.prisma.channel.findUnique({
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

    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    if (channel.ownerId === currentUserId) {
      if (channel.members.length === 0) {
        await this.prisma.channel.delete({
          where: {
            id: channelId,
          },
        });
      } else if (channel.members[0]) {
        const newOwner = channel.members[0];
        await this.prisma.channel.update({
          data: {
            ownerId: newOwner.userId,
          },
          where: {
            id: channelId,
          },
        });
        await this.prisma.channelMember.delete({
          where: {
            channelId_userId: {
              channelId,
              userId: newOwner.userId,
            },
          },
        });
        const ismuted = await this.prisma.mutedMember.findFirst({
          where: {
            channelId,
            userId: newOwner.userId,
          },
        });
        if (ismuted) {
          await this.prisma.mutedMember.delete({
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
      await this.prisma.channelMember.delete({
        where: {
          channelId_userId: {
            channelId,
            userId: currentUserId,
          },
        },
      });
    }

    return true;
  }

  @Mutation((returns) => Boolean)
  async createChannel(
    @Args("inviteOnly", { type: () => Boolean }) inviteOnly: boolean,
    @Args("password", { type: () => String, nullable: true })
    password: string | null,
    @Args("name", { type: () => String }) name: string,
    @CurrentUser() currentUserId: number
  ) {
    const hash = password ? bcrypt.hashSync(password, 10) : null;

    await this.prisma.channel.create({
      data: {
        inviteOnly: inviteOnly,
        name: name,
        password: hash,
        ownerId: currentUserId,
      },
    });

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async deleteChannel(
    @Args("channelId", { type: () => Int }) channelId: number
  ) {
    await this.prisma.channel.delete({
      where: { id: channelId },
    });

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async muteUser(
    @Args("userId", { type: () => Int }) userId: number,
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("muteUntil", { type: () => Date, nullable: true })
    muteUntil: Date | null
  ) {
    const ismuted = await this.prisma.mutedMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    if (ismuted) {
      await this.prisma.mutedMember.update({
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
      await this.prisma.mutedMember.create({
        data: { endAt: muteUntil, channelId, userId },
      });
    }

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async banUser(
    @Args("userId", { type: () => Int }) userId: number,
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("banUntil", { type: () => Date, nullable: true })
    banUntil: Date | null
  ) {
    const isbanned = await this.prisma.bannedMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    if (isbanned) {
      await this.prisma.bannedMember.update({
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
      await this.prisma.bannedMember.create({
        data: { endAt: banUntil, channelId, userId },
      });
      await this.prisma.channelMember.delete({
        where: {
          channelId_userId: {
            channelId,
            userId,
          },
        },
      });
    }

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async unmuteUser(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    const ismuted = await this.prisma.mutedMember.findUnique({
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

    await this.prisma.mutedMember.delete({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async unbanUser(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    const isbanned = await this.prisma.bannedMember.findUnique({
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

    await this.prisma.bannedMember.delete({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async removeUser(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    const ismember = await this.prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    if (!ismember) {
      throw new NotFoundException("User is not a member");
    }

    await this.prisma.channelMember.delete({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async updatePassword(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("password", { type: () => String, nullable: true })
    password: string | null
  ) {
    const hash = password ? bcrypt.hashSync(password, 10) : null;

    await this.prisma.channel.update({
      where: { id: channelId },
      data: { password: hash },
    });
    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async inviteUser(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    const isbanned = await this.prisma.bannedMember.findUnique({
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

    await this.prisma.channelMember.create({
      data: { channelId, userId },
    });

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async addAdmin(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    const ismember = await this.prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    if (!ismember) {
      throw new NotFoundException("User is not a member");
    }

    await this.prisma.channelMember.update({
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

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async removeAdmin(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    const isadmin = await this.prisma.channelMember.findFirst({
      where: {
        userId,
        isAdministrator: true,
      },
    });

    if (!isadmin) {
      throw new NotFoundException("User is not a member or an admin");
    }

    await this.prisma.channelMember.update({
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

    return true;
  }
}

@Resolver(ChannelMessage)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelMessageResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField()
  async author(@Root() channelMessage: ChannelMessage): Promise<userType> {
    const message = await this.prisma.channelMessage.findUnique({
      select: { author: true },
      where: {
        id: channelMessage.id,
      },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    return {
      id: message.author.id,
      name: message.author.name,
      rank: message.author.rank,
      avatar: message.author.avatar,
    };
  }

  @ResolveField()
  async readBy(
    @Root() channelMessage: ChannelMessage
  ): Promise<channelMessageReadType[]> {
    const reads = await this.prisma.channelMessageRead.findMany({
      select: {
        readAt: true,
        channelMessageId: true,
        user: true,
      },
      where: {
        channelMessageId: channelMessage.id,
      },
    });

    return reads
      ? reads.map((r) => ({
          readAt: r.readAt,
          messageID: r.channelMessageId,
          user: {
            id: r.user.id,
            name: r.user.name,
            rank: r.user.rank,
            avatar: r.user.avatar,
          },
        }))
      : [];
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Member)
  @Mutation((returns) => Boolean)
  async sendChannelMessage(
    @Args("message", { type: () => String }) message: string,
    @Args("channelId", { type: () => Int }) channelId: number,
    @CurrentUser() currentUserId: number
  ) {
    const ismuted = await this.prisma.mutedMember.findFirst({
      where: {
        userId: currentUserId,
        channelId: channelId,
        endAt: {
          gte: new Date(),
        },
      },
    });

    if (ismuted) {
      throw new ForbiddenException("You are muted");
    }

    await this.prisma.channelMessage.create({
      data: {
        content: message,
        sentAt: new Date(),
        authorId: currentUserId,
        channelId,
      },
    });
    return true;
  }
}

@Resolver(ChannelMessageRead)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelMessageReadResolver {
  constructor(private prisma: PrismaService) {}

  @RoleGuard(Role.Member)
  @Mutation((returns) => Boolean)
  async createChannelMessageRead(
    @Args("messageId", { type: () => Int }) messageId: number,
    @CurrentUser() currentUserId: number
  ) {
    const message = await this.prisma.channelMessage.findUnique({
      select: { readBy: true },
      where: {
        id: messageId,
      },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }
    await this.prisma.channelMessageRead.create({
      data: {
        channelMessageId: messageId,
        userId: currentUserId,
        readAt: new Date(),
      },
    });
    return true;
  }
}
