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
  BlockedByIdsLoader,
  UserChannelIdsLoader,
  UserLoader,
} from "../user/user.loaders";
import { UserService } from "../user/user.service";
import { PrismaService } from "../prisma/prisma.service";
import { GraphqlUser } from "../user/user.resolver";
import { SocketGateway } from "../socket/socket.gateway";
import {
  ChannelPasswordArgs,
  CreateChannelArgs,
  GetChannelArgs,
  RestrictUserArgs,
  SearchChannelsArgs,
  SendChannelMessageArgs,
  TargetUserArgs,
} from "./channel.args";
import UserSession from "../auth/userSession.model";

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
@UseGuards(GqlAuthenticatedGuard)
export class ChannelResolver {
  constructor(private channelService: ChannelService) {}

  @Query((returns) => Channel)
  async channel(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Args("id", { type: () => Int }) id: number
  ): Promise<GraphqlChannel> {
    return await this.channelService.getChannelById(channelLoader, id);
  }

  @Query((returns) => [Channel])
  async channels(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Args() { name }: SearchChannelsArgs
  ): Promise<GraphqlChannel[]> {
    return await this.channelService.searchChannelsByName(channelLoader, name);
  }

  @ResolveField()
  async owner(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @Root() channel: Channel
  ): Promise<GraphqlUser> {
    return await this.channelService.getOwner(
      channelLoader,
      userLoader,
      channel.id
    );
  }

  @ResolveField()
  async admins(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Loader(ChannelMembersLoader)
    channelMembersLoader: DataLoader<
      PrismaChannel["id"],
      PrismaChannelMember[]
    >,
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @CurrentUser() currentUser: UserSession,
    @Root() channel: Channel
  ): Promise<GraphqlUser[]> {
    return await this.channelService.getAdmins(
      currentUser.id,
      channelLoader,
      channelMembersLoader,
      userLoader,
      channel.id
    );
  }

  @ResolveField()
  async members(
    @Loader(ChannelLoader)
    channelLoader: DataLoader<PrismaChannel["id"], PrismaChannel>,
    @Loader(ChannelMembersLoader)
    channelMembersLoader: DataLoader<
      PrismaChannel["id"],
      PrismaChannelMember[]
    >,
    @Loader(UserLoader)
    userLoader: DataLoader<PrismaUser["id"], PrismaUser>,
    @CurrentUser() currentUser: UserSession,
    @Root() channel: Channel
  ): Promise<GraphqlUser[]> {
    return await this.channelService.getMembers(
      currentUser.id,
      channelLoader,
      channelMembersLoader,
      userLoader,
      channel.id
    );
  }

  @ResolveField()
  async muted(
    @Loader(UserChannelIdsLoader)
    userChannelIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @CurrentUser() currentUser: UserSession,
    @Root() channel: Channel,
    @Loader(ChannelRestrictedUserLoader)
    channelMutedMembersLoader: DataLoader<
      PrismaChannel["id"],
      PrismaChannelRestrictedUser[]
    >,
    @Loader(UserLoader) userLoader: DataLoader<PrismaUser["id"], PrismaUser>
  ): Promise<GraphqlChannelRestrictedUser[]> {
    return await this.channelService.getRestrictedMembers(
      userChannelIdsLoader,
      currentUser.id,
      channelMutedMembersLoader,
      userLoader,
      channel.id,
      ChannelRestriction.MUTE
    );
  }

  @ResolveField()
  async banned(
    @Loader(UserChannelIdsLoader)
    userChannelIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @CurrentUser() currentUser: UserSession,
    @Root() channel: Channel,
    @Loader(ChannelRestrictedUserLoader)
    channelBannedMembersLoader: DataLoader<
      PrismaChannel["id"],
      PrismaChannelRestrictedUser[]
    >,
    @Loader(UserLoader) userLoader: DataLoader<PrismaUser["id"], PrismaUser>
  ): Promise<GraphqlChannelRestrictedUser[]> {
    return await this.channelService.getRestrictedMembers(
      userChannelIdsLoader,
      currentUser.id,
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
    @Loader(BlockedByIdsLoader)
    blockedByIdsLoader: DataLoader<PrismaUser["id"], number[]>,
    @Root() channel: Channel,
    @CurrentUser() currentUser: UserSession
  ): Promise<GraphqlChannelMessage[]> {
    const m = await this.channelService.getMessages(
      userChannelIdsLoader,
      channelMessagesLoader,
      blockedByIdsLoader,
      channel.id,
      currentUser.id
    );

    return m;
  }

  @Mutation((returns) => Boolean)
  async joinChannel(
    @Args() { id, password }: ChannelPasswordArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    await this.channelService.joinChannel(id, password, currentUser.id);

    return true;
  }

  @Mutation((returns) => Boolean)
  async leaveChannel(
    @Args() { id }: GetChannelArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    await this.channelService.leaveChannel(id, currentUser.id);

    return true;
  }

  @Mutation((returns) => Boolean)
  async createChannel(
    @Args() { inviteOnly, name, password }: CreateChannelArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    const hash = password ? bcrypt.hashSync(password, 10) : null;
    await this.channelService.createChannel(
      inviteOnly,
      name,
      hash,
      currentUser.id
    );

    return true;
  }

  @Mutation((returns) => Boolean)
  async deleteChannel(
    @Args() { id }: GetChannelArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    await this.channelService.deleteChannel(id, currentUser.id);

    return true;
  }

  @Mutation((returns) => Boolean)
  async muteUser(
    @Args() { id, userId, restrictUntil }: RestrictUserArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    await this.channelService.setUserRestriction(
      currentUser.id,
      id,
      userId,
      restrictUntil,
      ChannelRestriction.MUTE
    );

    return true;
  }

  @Mutation((returns) => Boolean)
  async banUser(
    @Args() { id, userId, restrictUntil }: RestrictUserArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    await this.channelService.setUserRestriction(
      currentUser.id,
      id,
      userId,
      restrictUntil,
      ChannelRestriction.BAN
    );

    return true;
  }

  @Mutation((returns) => Boolean)
  async unmuteUser(
    @Args() { id, userId }: TargetUserArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    await this.channelService.setUserRestriction(
      currentUser.id,
      id,
      userId,
      new Date(),
      ChannelRestriction.MUTE
    );

    return true;
  }

  @Mutation((returns) => Boolean)
  async unbanUser(
    @Args() { id, userId }: TargetUserArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    await this.channelService.setUserRestriction(
      currentUser.id,
      id,
      userId,
      new Date(),
      ChannelRestriction.BAN
    );

    return true;
  }

  @Mutation((returns) => Boolean)
  async updatePassword(
    @Args() { id, password }: ChannelPasswordArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    const hash = password ? bcrypt.hashSync(password, 10) : null;
    await this.channelService.updatePassword(id, hash, currentUser.id);

    return true;
  }

  @Mutation((returns) => Boolean)
  async inviteUser(@Args() { id, userId }: TargetUserArgs) {
    await this.channelService.inviteUser(id, userId);

    return true;
  }

  @Mutation((returns) => Boolean)
  async addAdmin(
    @Args() { id, userId }: TargetUserArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    await this.channelService.addAdmin(id, userId, currentUser.id);

    return true;
  }

  @Mutation((returns) => Boolean)
  async removeAdmin(
    @Args() { id, userId }: TargetUserArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    await this.channelService.removeAdmin(id, userId, currentUser.id);

    return true;
  }
}

@Resolver(ChannelMessage)
@UseGuards(GqlAuthenticatedGuard)
export class ChannelMessageResolver {
  constructor(
    private prismaService: PrismaService,
    private socketGateway: SocketGateway
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

  @Mutation((returns) => Boolean)
  async sendChannelMessage(
    @Args() { id, message }: SendChannelMessageArgs,
    @CurrentUser() currentUser: UserSession
  ) {
    try {
      const channel = await this.prismaService.channel.findUnique({
        where: {
          id,
        },
        select: {
          ownerId: true,
          members: {
            select: {
              userId: true,
            },
          },
          restrictedMembers: {
            select: {
              userId: true,
            },
            where: {
              restriction: ChannelRestriction.MUTE,
            },
          },
        },
      });

      if (
        channel?.ownerId !== currentUser.id &&
        !channel?.members.some((member) => member.userId === currentUser.id)
      ) {
        throw new ForbiddenException("You are not a member of this channel");
      }

      const isMuted = await this.prismaService.channelRestrictedUser.findFirst({
        where: {
          userId: currentUser.id,
          channelId: id,
          OR: [
            {
              endAt: {
                gte: new Date(),
              },
            },
            {
              endAt: null,
            },
          ],
          restriction: ChannelRestriction.MUTE,
        },
      });
      if (isMuted)
        throw new ForbiddenException("You are muted in this channel");

      await this.prismaService.channelMessage.create({
        data: {
          content: message,
          sentAt: new Date(),
          authorId: currentUser.id,
          channelId: id,
        },
      });

      channel.members.forEach((member) => {
        this.socketGateway.sendToUser(
          member.userId,
          "invalidateChannelMessageCache",
          undefined
        );
      });
      this.socketGateway.sendToUser(
        channel.ownerId,
        "invalidateChannelMessageCache",
        undefined
      );

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new NotFoundException("Channel not found");
    }
  }
}
