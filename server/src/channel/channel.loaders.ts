import { Injectable, Type } from "@nestjs/common";
import { Achievement, Channel, User } from "@prisma/client";
import DataLoader from "dataloader";
import { channel } from "diagnostics_channel";
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
export class OwnerByLoader implements NestDataLoader<number, User> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, User> {
    return new DataLoader<number, User>(async (keys) => {
      return (
        await this.prismaService.channel.findMany({
          select: { owner: true },
          where: {
            id: {
              in: [...keys],
            },
          },
        })
      ).map((channel) => channel.owner);
    });
  }
}

@Injectable()
export class AdminsByLoader implements NestDataLoader<number, User> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, User> {
    return new DataLoader<number, User>(async (keys) =>
      (
        await this.prismaService.channelMember.findMany({
          select: { user: true },
          where: {
            AND: {
              channelId: { in: [...keys] },
              isAdministrator: true, //TODO check is not broken
            },
          },
        })
      ).map((channel) => channel.user)
    );
  }
}
