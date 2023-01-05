import { ForbiddenException, UseGuards } from "@nestjs/common";
import bcrypt from "bcrypt";
import {
  Args,
  ArgsType,
  Field,
  Int,
  Mutation,
  PickType,
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
import { IsByteLength, Length, Min } from "class-validator";

export type GraphqlChannel = Omit<
  Channel,
  "owner" | "messages" | "admins" | "members" | "banned" | "muted"
>;

type GraphqlChannelMessage = Omit<ChannelMessage, "author" | "readBy">;

export type GraphqlChannelRestrictedUser = Omit<
  ChannelRestrictedUser,
  "user"
> & { user: GraphqlUser };

@ArgsType()
class ChannelArgs {
  @Field((type) => Int)
  @Min(0)
  id: number;

  @Field((type) => String)
  @Length(1, 50)
  name: string;

  @Field((type) => String, { nullable: true })
  @Length(1, 255)
  password: string | null;

  @Field((type) => Boolean)
  inviteOnly: boolean;
}

@ArgsType()
class GetChannelArgs extends PickType(ChannelArgs, ["id"] as const) {}

@ArgsType()
class SearchChannelsArgs extends PickType(ChannelArgs, ["name"] as const) {}

@ArgsType()
class ChannelPasswordArgs extends PickType(ChannelArgs, [
  "id",
  "password",
] as const) {}

@ArgsType()
class TargetUserArgs extends PickType(ChannelArgs, ["id"] as const) {
  @Field((type) => Int)
  @Min(0)
  userId: number;
}

@ArgsType()
class CreateChannelArgs extends PickType(ChannelArgs, [
  "name",
  "inviteOnly",
  "password",
] as const) {}

@ArgsType()
class RestrictUserArgs extends PickType(ChannelArgs, ["id"] as const) {
  @Field((type) => Int)
  @Min(0)
  userId: number;

  @Field((type) => Date, { nullable: true })
  restrictedUntil: Date | null;
}

@ArgsType()
class SendChannelMessageArgs extends GetChannelArgs {
  @Field((type) => String)
  @IsByteLength(1, 65535)
  message: string;
}

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
    @CurrentUser() currentUserId: number,
    @Root() channel: Channel
  ): Promise<GraphqlUser[]> {
    return await this.channelService.getAdmins(
      currentUserId,
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
    @CurrentUser() currentUserId: number,
    @Root() channel: Channel
  ): Promise<GraphqlUser[]> {
    return await this.channelService.getMembers(
      currentUserId,
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
    @CurrentUser() currentUserId: number,
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
      currentUserId,
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
    @CurrentUser() currentUserId: number,
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
      currentUserId,
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
  ): Promise<GraphqlChannelMessage[]> {
    const m = await this.channelService.getMessages(
      userChannelIdsLoader,
      channelMessagesLoader,
      blockingIdsLoader,
      channel.id,
      currentUserId
    );

    return m;
  }

  @UseGuards(ExistingChannelGuard)
  @Mutation((returns) => Boolean)
  async joinChannel(
    @Args() { id, password }: ChannelPasswordArgs,
    @CurrentUser() currentUserId: number
  ) {
    await this.channelService.joinChannel(id, password, currentUserId);

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Member)
  @Mutation((returns) => Boolean)
  async leaveChannel(
    @Args() { id }: GetChannelArgs,
    @CurrentUser() currentUserId: number
  ) {
    await this.channelService.leaveChannel(id, currentUserId);

    return true;
  }

  @Mutation((returns) => Boolean)
  async createChannel(
    @Args() { inviteOnly, name, password }: CreateChannelArgs,
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
  async deleteChannel(@Args() { id }: GetChannelArgs) {
    await this.channelService.deleteChannel(id);

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async muteUser(@Args() { id, userId, restrictedUntil }: RestrictUserArgs) {
    await this.channelService.setUserRestriction(
      id,
      userId,
      restrictedUntil,
      ChannelRestriction.MUTE
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async banUser(@Args() { id, userId, restrictedUntil }: RestrictUserArgs) {
    await this.channelService.setUserRestriction(
      id,
      userId,
      restrictedUntil,
      ChannelRestriction.BAN
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin)
  @Mutation((returns) => Boolean)
  async unmuteUser(@Args() { id, userId }: TargetUserArgs) {
    await this.channelService.setUserRestriction(
      id,
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
  async unbanUser(@Args() { id, userId }: TargetUserArgs) {
    await this.channelService.setUserRestriction(
      id,
      userId,
      new Date(),
      ChannelRestriction.BAN
    );

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async updatePassword(@Args() { id, password }: ChannelPasswordArgs) {
    const hash = password ? bcrypt.hashSync(password, 10) : null;
    await this.channelService.updatePassword(id, hash);

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Admin) // TODO: ??
  @Mutation((returns) => Boolean)
  async inviteUser(@Args() { id, userId }: TargetUserArgs) {
    await this.channelService.inviteUser(id, userId);

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @UseGuards(OwnerGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async addAdmin(@Args() { id, userId }: TargetUserArgs) {
    await this.channelService.addAdmin(id, userId);

    return true;
  }

  @UseGuards(ExistingChannelGuard)
  @RoleGuard(Role.Owner)
  @Mutation((returns) => Boolean)
  async removeAdmin(@Args() { id, userId }: TargetUserArgs) {
    await this.channelService.removeAdmin(id, userId);

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
    @Args() { id, message }: SendChannelMessageArgs,
    @CurrentUser() currentUserId: number
  ) {
    const ismuted = await this.prismaService.channelRestrictedUser.findFirst({
      where: {
        userId: currentUserId,
        channelId: id,
        endAt: {
          gte: new Date(),
        },
        restriction: ChannelRestriction.MUTE,
      },
    });

    if (ismuted) {
      throw new ForbiddenException("You are muted");
    }

    await this.prismaService.channelMessage.create({
      data: {
        content: message,
        sentAt: new Date(),
        authorId: currentUserId,
        channelId: id,
      },
    });

    const c = await channelLoader.load(id);
    const channelMembers = await channelMembersLoader.load(c.id);
    const memberAndOwnerIds = channelMembers.map((m) => m.userId);
    memberAndOwnerIds.push(c.ownerId);
    this.socketService.invalidateChannelMessagesCache(id, memberAndOwnerIds);

    return true;
  }
}
