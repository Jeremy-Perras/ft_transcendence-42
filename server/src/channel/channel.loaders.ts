import { Injectable } from "@nestjs/common";
import {
  Channel,
  ChannelMember,
  ChannelMessage,
  ChannelRestrictedUser,
} from "@prisma/client";
import DataLoader from "dataloader";
import { NestDataLoader } from "../dataloader";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChannelLoader implements NestDataLoader<number, Channel> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, Channel> {
    return new DataLoader<number, Channel>(async (keys) => {
      const channel = await this.prismaService.channel.findMany({
        where: {
          id: {
            in: [...keys],
          },
        },
      });
      const result = channel.reduce((acc, curr) => {
        const index = keys.indexOf(curr.id);
        acc[index] = curr;
        return acc;
      }, new Array<Channel>());
      return result;
    });
  }
}

@Injectable()
export class ChannelMembersLoader
  implements NestDataLoader<number, ChannelMember[]>
{
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, ChannelMember[]> {
    return new DataLoader<number, ChannelMember[]>(async (keys) => {
      const cm = await this.prismaService.channelMember.findMany({
        where: {
          channelId: {
            in: [...keys],
          },
        },
      });

      const result = cm.reduce((acc, curr) => {
        const index = keys.indexOf(curr.channelId);
        if (!acc[index]) {
          acc[index] = new Array<ChannelMember>();
        }
        acc[index]?.push(curr);
        return acc;
      }, new Array<ChannelMember[]>());
      for (let index = 0; index < keys.length; index++) {
        if (!result[index]) {
          result[index] = new Array<ChannelMember>();
        }
      }
      return result;
    });
  }
}

@Injectable()
export class ChannelRestrictedUserLoader
  implements NestDataLoader<number, ChannelRestrictedUser[]>
{
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, ChannelRestrictedUser[]> {
    return new DataLoader<number, ChannelRestrictedUser[]>(async (keys) => {
      const u = await this.prismaService.channelRestrictedUser.findMany({
        where: {
          channelId: {
            in: [...keys],
          },
          OR: [
            {
              endAt: {
                gte: new Date(),
              },
            },
            { endAt: null },
          ],
        },
      });
      const result = u.reduce((acc, curr) => {
        const index = keys.indexOf(curr.channelId);
        if (!acc[index]) {
          acc[index] = new Array<ChannelRestrictedUser>();
        }
        acc[index]?.push(curr);
        return acc;
      }, new Array<ChannelRestrictedUser[]>());
      for (let index = 0; index < keys.length; index++) {
        if (!result[index]) {
          result[index] = new Array<ChannelRestrictedUser>();
        }
      }
      return result;
    });
  }
}

@Injectable()
export class ChannelMessagesLoader
  implements NestDataLoader<number, ChannelMessage[]>
{
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, ChannelMessage[]> {
    return new DataLoader<number, ChannelMessage[]>(async (keys) => {
      const m = await this.prismaService.channelMessage.findMany({
        where: {
          channelId: { in: [...keys] },
        },
        orderBy: { sentAt: "asc" },
      });
      const result = m.reduce((acc, curr) => {
        const index = keys.indexOf(curr.channelId);
        if (!acc[index]) {
          acc[index] = new Array<ChannelMessage>();
        }
        acc[index]?.push(curr);
        return acc;
      }, new Array<ChannelMessage[]>());
      for (let index = 0; index < keys.length; index++) {
        if (!result[index]) {
          result[index] = new Array<ChannelMessage>();
        }
      }
      return result;
    });
  }
}

@Injectable()
export class ChannelMessageReadIdsLoader
  implements NestDataLoader<number, number[]>
{
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, number[]> {
    return new DataLoader<number, number[]>(async (keys) => {
      const m = await this.prismaService.channelMessageRead.findMany({
        where: {
          messageId: { in: [...keys] },
        },
      });
      const result = m.reduce((acc, curr) => {
        const index = keys.indexOf(curr.messageId);
        if (!acc[index]) {
          acc[index] = new Array<number>();
        }
        acc[index]?.push(curr.userId);
        return acc;
      }, new Array<number[]>());
      for (let index = 0; index < keys.length; index++) {
        if (!result[index]) {
          result[index] = new Array<number>();
        }
      }
      return result;
    });
  }
}
