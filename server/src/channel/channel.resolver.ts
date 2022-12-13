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
import {
  Channel,
  ChannelMessage,
  ChannelRestrictedUser,
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
import { SocketService } from "../socket/socket.service";
import { GraphqlUser } from "../user/user.resolver";

export type GraphqlChannel = Omit<
  Channel,
  "owner" | "messages" | "admins" | "members" | "banned" | "muted"
>;

type GraphqlChannelMessage = Omit<ChannelMessage, "author" | "readBy">;

export type GraphqlChannelRestrictedUser = Omit<
  ChannelRestrictedUser,
  "user"
> & { user: GraphqlUser };

@Resolver(Channel)
@UseGuards(RolesGuard)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelResolver {
  constructor(
    private channelService: ChannelService,
    private socketService: SocketService
  ) {}

  @Query((returns) => Channel)
  async channel(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Args("id", { type: () => Int }) id: number
  ): Promise<GraphqlChannel> {
    return this.channelService.getChannelById(channelLoader, id);
  }

  @Query((returns) => [Channel])
  async channels(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Args("name", { type: () => String }) name: string
  ): Promise<GraphqlChannel[]> {
    return this.channelService.searchChannelsByName(channelLoader, name);
  }

  @ResolveField()
  async owner(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Root() channel: Channel
  ): Promise<GraphqlUser> {
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
  ): Promise<GraphqlUser[]> {
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
  ): Promise<GraphqlUser[]> {
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
  ): Promise<GraphqlChannelRestrictedUser[]> {
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
  ): Promise<GraphqlChannelRestrictedUser[]> {
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
    @Loader(ChannelMembersLoader)
    channelMembersLoader: DataLoader<Channel["id"], PrismaChannelMember[]>,
    @Loader(ChannelLoader)
    channelLoader: DataLoader<Channel["id"], PrismaChannel>,
    @Root() channel: Channel,
    @CurrentUser() currentUserId: number
  ): Promise<GraphqlChannelMessage[]> {
    const m = await this.channelService.getMessages(
      userChannelIdsLoader,
      channelMessagesLoader,
      blockingIdsLoader,
      channel.id,
      currentUserId
    );

    const c = await channelLoader.load(channel.id);
    const channelMembers = await channelMembersLoader.load(c.id);
    const memberAndOwnerIds = channelMembers.map((m) => m.userId);
    memberAndOwnerIds.push(c.ownerId);
    this.socketService.invalidateChannelMessagesCache(
      channel.id,
      memberAndOwnerIds
    );

    return m;
  }

  @UseGuards(ExistingChannelGuard)
  @Mutation((returns) => Boolean)
  async joinChannel(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("password", { type: () => String, nullable: true })
    password: string | null,
    @CurrentUser() currentUserId: number
  ) {
    await this.channelService.joinChannel(channelId, password, currentUserId);

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Member)
  @Mutation((returns) => Boolean)
  async leaveChannel(
    @Args("channelId", { type: () => Int }) channelId: number,
    @CurrentUser() currentUserId: number
  ) {
    await this.channelService.leaveChannel(channelId, currentUserId);

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
    await this.channelService.createChannel(
      inviteOnly,
      name,
      hash,
      currentUserId
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async deleteChannel(
    @Args("channelId", { type: () => Int }) channelId: number
  ) {
    await this.channelService.deleteChannel(channelId);

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
    await this.channelService.setUserRestriction(
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
    await this.channelService.setUserRestriction(
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
    await this.channelService.setUserRestriction(
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
    await this.channelService.setUserRestriction(
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
    password: string | null
  ) {
    const hash = password ? bcrypt.hashSync(password, 10) : null;
    await this.channelService.updatePassword(channelId, hash);

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
    await this.channelService.inviteUser(channelId, userId);

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
    await this.channelService.addAdmin(channelId, userId);

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async removeAdmin(
    @Args("channelId", { type: () => Int }) channelId: number,
    @Args("userId", { type: () => Int }) userId: number
  ) {
    await this.channelService.removeAdmin(channelId, userId);

    return true;
  }
}

@Resolver(ChannelMessage)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelMessageResolver {
  constructor(
    private prismaService: PrismaService,
    private socketService: SocketService
  ) {}

  @ResolveField()
  async author(
    @Loader(UserLoader) userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Root() channelMessage: ChannelMessage
  ): Promise<GraphqlUser> {
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
  ): Promise<GraphqlUser[]> {
    const userIds = await channelMessageReadIdsLoader.load(channelMessage.id);
    const users = await userLoader.loadMany(userIds);
    return users.reduce((acc, curr) => {
      if (curr && "id" in curr) {
        acc.push(UserService.formatGraphqlUser(curr));
      }
      return acc;
    }, new Array<GraphqlUser>());
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Member)
  @Mutation((returns) => Boolean)
  async sendChannelMessage(
    @Loader(ChannelMembersLoader)
    channelMembersLoader: DataLoader<
      PrismaChannel["id"],
      PrismaChannelMember[]
    >,
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
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

    const c = await channelLoader.load(channelId);
    const channelMembers = await channelMembersLoader.load(c.id);
    const memberAndOwnerIds = channelMembers.map((m) => m.userId);
    memberAndOwnerIds.push(c.ownerId);
    this.socketService.invalidateChannelMessagesCache(
      channelId,
      memberAndOwnerIds
    );

    return true;
  }
}
