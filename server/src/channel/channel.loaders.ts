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
    return new DataLoader<number, Channel>(async (keys) =>
      this.prismaService.channel.findMany({
        where: {
          id: {
            in: [...keys],
          },
        },
      })
    );
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

      return cm.reduce((acc, curr) => {
        const index = keys.indexOf(curr.channelId);
        acc[index]?.push(curr);
        return acc;
      }, new Array<ChannelMember[]>());
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
          endAt: {
            gte: new Date(),
          },
        },
      });
      return u.reduce((acc, curr) => {
        const index = keys.indexOf(curr.channelId);
        acc[index]?.push(curr);
        return acc;
      }, new Array<ChannelRestrictedUser[]>());
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
        orderBy: { sentAt: "desc" },
      });
      return m.reduce((acc, curr) => {
        const index = keys.indexOf(curr.channelId);
        acc[index]?.push(curr);
        return acc;
      }, new Array<ChannelMessage[]>());
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
      return m.reduce((acc, curr) => {
        const index = keys.indexOf(curr.messageId);
        acc[index]?.push(curr.userId);
        return acc;
      }, new Array<number[]>());
    });
  }
}
