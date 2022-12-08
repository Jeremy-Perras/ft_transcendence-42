import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Achievement, DirectMessage, Channel, User } from "@prisma/client";
import DataLoader from "dataloader";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChannelService {
  constructor(private prismaService: PrismaService) {}

  private static formatChannel(channel: Channel) {
    return {
      id: channel.id,
      name: channel.name,
      passwordProtected: !!channel.password,
      private: channel.inviteOnly,
    };
  }
  private static formatUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      rank: user.rank,
    };
  }

  async getChannelBy(
    dataloader: DataLoader<Channel["id"], Channel>,
    id: number
  ) {
    try {
      return ChannelService.formatChannel(await dataloader.load(id));
    } catch (error) {
      throw new NotFoundException("User not found");
    }
  }
  async getOwner(dataloader: DataLoader<Channel["id"], User[]>, id: number) {
    const owner = await dataloader.load(id);
    return owner.map(ChannelService.formatUser);
  }

  async getAdmins(dataloader: DataLoader<Channel["id"], User[]>, id: number) {
    const owner = await dataloader.load(id);
    return owner.map(ChannelService.formatUser);
  }
}
