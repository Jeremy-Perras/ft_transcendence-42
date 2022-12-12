import { ForbiddenException, UseGuards } from "@nestjs/common";
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
import {
  Channel as PrismaChannel,
  User as PrismaUser,
  ChannelMessage as PrismaChannelMessage,
  ChannelMember as PrismaChannelMember,
  ChannelRestrictedUser as PrismaChannelRestrictedUser,
  ChannelRestriction,
} from "@prisma/client";
import { GqlAuthenticatedGuard } from "../auth/authenticated.guard";
import { CurrentUser } from "../auth/currentUser.decorator";
import { userType } from "../user/user.model";
import {
  Channel,
  ChannelMessage,
  channelMessageType,
  ChannelRestrictedUser,
  channelType,
} from "./channel.model";
import { Role, RoleGuard, RolesGuard } from "./channel.roles";
import { ExistingChannelGuard, OwnerGuard } from "./channel.guards";
import { Loader } from "../dataloader";
import {
  ChannelLoader,
  ChannelMembersLoader,
  ChannelMessageReadIdsLoader,
  ChannelMessagesLoader,
  ChannelRestrictedUserLoader,
} from "./channel.loaders";
import DataLoader from "dataloader";
import { ChannelService } from "./channel.service";
import {
  BlockingIdsLoader,
  UserChannelIdsLoader,
  UserLoader,
} from "../user/user.loaders";
import { UserService } from "../user/user.service";
import { PrismaService } from "../prisma/prisma.service";

@Resolver(Channel)
@UseGuards(RolesGuard)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelResolver {
  constructor(private channelService: ChannelService) {}

  @Query((returns) => Channel)
  async channel(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Args("id", { type: () => Int }) id: number
  ): Promise<channelType> {
    return this.channelService.getChannelById(channelLoader, id);
  }

  @Query((returns) => [Channel])
  async channels(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Args("name", { type: () => String }) name: string
  ): Promise<channelType[]> {
    return this.channelService.searchChannelsByName(channelLoader, name);
  }

  @ResolveField()
  async owner(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Root() channel: Channel
  ): Promise<userType> {
    return this.channelService.getOwner(channelLoader, userLoader, channel.id);
  }

  @ResolveField()
  async admins(
    @Loader(ChannelMembersLoader)
    channelMembersLoader: DataLoader<
      PrismaChannel["id"],
      PrismaChannelMember[]
    >,
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Root() channel: Channel
  ): Promise<userType[]> {
    return this.channelService.getAdmins(
      channelMembersLoader,
      userLoader,
      channel.id
    );
  }

  @ResolveField()
  async members(
    @Loader(ChannelMembersLoader)
    channelMembersLoader: DataLoader<
      PrismaChannel["id"],
      PrismaChannelMember[]
    >,
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Root() channel: Channel
  ): Promise<userType[]> {
    return this.channelService.getMembers(
      channelMembersLoader,
      userLoader,
      channel.id
    );
  }

  @ResolveField()
  async muted(
    @Root() channel: Channel,
    @Loader(ChannelRestrictedUserLoader)
    channelMutedMembersLoader: DataLoader<
      PrismaChannel["id"],
      PrismaChannelRestrictedUser[]
    >,
    @Loader(UserLoader) userLoader: DataLoader<PrismaUser["id"], PrismaUser>
  ): Promise<ChannelRestrictedUser[]> {
    return this.channelService.getRestrictedMembers(
      channelMutedMembersLoader,
      userLoader,
      channel.id,
      ChannelRestriction.MUTE
    );
  }

  @ResolveField()
  async banned(
    @Root() channel: Channel,
    @Loader(ChannelRestrictedUserLoader)
    channelBannedMembersLoader: DataLoader<
      PrismaChannel["id"],
      PrismaChannelRestrictedUser[]
    >,
    @Loader(UserLoader) userLoader: DataLoader<PrismaUser["id"], PrismaUser>
  ): Promise<ChannelRestrictedUser[]> {
    return this.channelService.getRestrictedMembers(
      channelBannedMembersLoader,
      userLoader,
      channel.id,
      ChannelRestriction.BAN
    );
  }

  @ResolveField()
  async messages(
    @Loader(UserChannelIdsLoader)
    userChannelIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Loader(ChannelMessagesLoader)
    channelMessagesLoader: DataLoader<
      PrismaChannel["id"],
      PrismaChannelMessage[]
    >,
    @Loader(BlockingIdsLoader)
    blockingIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Root() channel: Channel,
    @CurrentUser() currentUserId: number
  ): Promise<channelMessageType[]> {
    return this.channelService.getMessages(
      userChannelIdsLoader,
      channelMessagesLoader,
      blockingIdsLoader,
      channel.id,
      currentUserId
    );
  }

  @UseGuards(ExistingChannelGuard)
  @Mutation((returns) => Boolean)
  async joinChannel(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("password", { type: () => String, nullable: true })
    password: string | null,
    @CurrentUser() currentUserId: number
  ) {
    this.channelService.joinChannel(channelId, password, currentUserId);

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Member)
  @Mutation((returns) => Boolean)
  async leaveChannel(
    @Args("channelId", { type: () => Int }) channelId: number,
    @CurrentUser() currentUserId: number
  ) {
    this.channelService.leaveChannel(channelId, currentUserId);

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
    this.channelService.createChannel(inviteOnly, name, hash, currentUserId);

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async deleteChannel(
    @Args("channelId", { type: () => Int }) channelId: number
  ) {
    this.channelService.deleteChannel(channelId);

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
    this.channelService.setUserRestriction(
      channelId,
      userId,
      muteUntil,
      ChannelRestriction.MUTE
    );

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
    this.channelService.setUserRestriction(
      channelId,
      userId,
      banUntil,
      ChannelRestriction.BAN
    );
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
    this.channelService.setUserRestriction(
      channelId,
      userId,
      new Date(),
      ChannelRestriction.MUTE
    );
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
    this.channelService.setUserRestriction(
      channelId,
      userId,
      new Date(),
      ChannelRestriction.BAN
    );
    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async updatePassword(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("password", { type: () => String, nullable: true })
    password: string | null,
    @CurrentUser() currentUserId: number
  ) {
    const hash = password ? bcrypt.hashSync(password, 10) : null;
    this.channelService.updatePassword(currentUserId, hash);

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
    this.channelService.inviteUser(channelId, userId);

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
    this.channelService.addAdmin(channelId, userId);

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async removeAdmin(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    this.channelService.removeAdmin(channelId, userId);

    return true;
  }
}

@Resolver(ChannelMessage)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelMessageResolver {
  constructor(private prismaService: PrismaService) {}

  @ResolveField()
  async author(
    @Loader(UserLoader) userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Root() channelMessage: ChannelMessage
  ): Promise<userType> {
    return await userLoader.load(channelMessage.authorId);
  }

  @ResolveField()
  async readBy(
    @Loader(UserLoader) userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Loader(ChannelMessageReadIdsLoader)
    channelMessageReadIdsLoader: DataLoader<
      PrismaChannelMessage["id"],
      number[]
    >,
    @Root() channelMessage: ChannelMessage
  ): Promise<userType[]> {
    const userIds = await channelMessageReadIdsLoader.load(channelMessage.id);
    const users = await userLoader.loadMany(userIds);
    return users.reduce((acc, curr) => {
      if (curr && "id" in curr) {
        acc.push(UserService.formatUser(curr));
      }
      return acc;
    }, new Array<userType>());
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Member)
  @Mutation((returns) => Boolean) // TODO
  async sendChannelMessage(
    @Args("message", { type: () => String }) message: string,
    @Args("channelId", { type: () => Int }) channelId: number,
    @CurrentUser() currentUserId: number
  ) {
    const ismuted = await this.prismaService.channelRestrictedUser.findFirst({
      where: {
        userId: currentUserId,
        channelId: channelId,
        endAt: {
          gte: new Date(),
        },
        restriction: ChannelRestriction.MUTE,
      },
    });

    if (ismuted) {
      throw new ForbiddenException("You are muted");
    }

    const usersChannel = await this.prismaService.channel.findUnique({
      select: { members: true, ownerId: true },
      where: { id: channelId },
    });

    const users = usersChannel?.members.map((u) => u.userId);
    if (usersChannel?.ownerId) users?.push(usersChannel?.ownerId);

    await this.prismaService.channelMessage.create({
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
