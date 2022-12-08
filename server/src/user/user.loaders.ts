import { Injectable, Type } from "@nestjs/common";
import { Achievement, DirectMessage, User } from "@prisma/client";
import DataLoader from "dataloader";
import { NestDataLoader } from "../dataloader";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserLoader implements NestDataLoader<number, User> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, User> {
    return new DataLoader<number, User>(async (keys) =>
      this.prismaService.user.findMany({
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
export class FriendedByLoader implements NestDataLoader<number, User[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, User[]> {
    return new DataLoader<number, User[]>(async (keys) =>
      (
        await this.prismaService.user.findMany({
          select: {
            friendedBy: true,
          },
          where: {
            id: {
              in: [...keys],
            },
          },
        })
      ).map((user) => user.friendedBy)
    );
  }
}

@Injectable()
export class FriendsLoader implements NestDataLoader<number, User[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, User[]> {
    return new DataLoader<number, User[]>(async (keys) =>
      (
        await this.prismaService.user.findMany({
          select: {
            friends: true,
          },
          where: {
            id: {
              in: [...keys],
            },
          },
        })
      ).map((user) => user.friends)
    );
  }
}

@Injectable()
export class BlockedByLoader implements NestDataLoader<number, User[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, User[]> {
    return new DataLoader<number, User[]>(async (keys) =>
      (
        await this.prismaService.user.findMany({
          select: {
            blockedBy: true,
          },
          where: {
            id: {
              in: [...keys],
            },
          },
        })
      ).map((user) => user.blockedBy)
    );
  }
}

@Injectable()
export class BlockingLoader implements NestDataLoader<number, User[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, User[]> {
    return new DataLoader<number, User[]>(async (keys) =>
      (
        await this.prismaService.user.findMany({
          select: {
            blocking: true,
          },
          where: {
            id: {
              in: [...keys],
            },
          },
        })
      ).map((user) => user.blocking)
    );
  }
}

@Injectable()
export class AchivementsLoader
  implements NestDataLoader<number, Achievement[]>
{
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, Achievement[]> {
    return new DataLoader<number, Achievement[]>(async (keys) =>
      (
        await this.prismaService.user.findMany({
          select: {
            achievements: true,
          },
          where: {
            id: {
              in: [...keys],
            },
          },
        })
      ).map((user) => user.achievements)
    );
  }
}

@Injectable()
export class DirectMessagesSentLoader
  implements
    NestDataLoader<
      [number, number],
      (DirectMessage & { author: User; recipient: User })[]
    >
{
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<
    [number, number],
    (DirectMessage & { author: User; recipient: User })[]
  > {
    return new DataLoader<
      [number, number],
      (DirectMessage & { author: User; recipient: User })[]
    >(async (keys) => {
      const initValue: { userId: number; friends: number[] }[] = [];
      const merged = keys.reduce((acc, curr) => {
        const [userId, friendId] = curr;
        const user = acc.find((user) => user.userId === userId);
        if (user) {
          user.friends.push(friendId);
        } else {
          acc.push({ userId, friends: [friendId] });
        }
        return acc;
      }, initValue);

      const m = await Promise.all(
        merged.map(async (e) => {
          const messages = await this.prismaService.directMessage.findMany({
            orderBy: { sentAt: "desc" },
            where: {
              authorId: e.userId,
              recipientId: {
                in: e.friends,
              },
            },
            include: {
              author: true,
              recipient: true,
            },
          });
          return messages.reduce(
            (acc, curr) => {
              const index = acc.index.indexOf(curr.recipientId);
              if (index === -1) {
                acc.index.push(acc.messages.push([curr]));
              } else {
                const i = acc.messages[index];
                i && i.push(curr);
              }
              return acc;
            },
            {
              index: new Array<number>(),
              messages: new Array<
                (DirectMessage & { author: User; recipient: User })[]
              >(),
            }
          );
        })
      );

      return m.reduce((acc, curr) => {
        acc.push(...curr.messages);
        return acc;
      }, new Array<(DirectMessage & { author: User; recipient: User })[]>());
    });
  }
}

@Injectable()
export class DirectMessagesReceivedLoader
  implements
    NestDataLoader<
      [number, number],
      (DirectMessage & { author: User; recipient: User })[]
    >
{
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<
    [number, number],
    (DirectMessage & { author: User; recipient: User })[]
  > {
    return new DataLoader<
      [number, number],
      (DirectMessage & { author: User; recipient: User })[]
    >(async (keys) => {
      const initValue: { userId: number; friends: number[] }[] = [];
      const merged = keys.reduce((acc, curr) => {
        const [userId, friendId] = curr;
        const user = acc.find((user) => user.userId === userId);
        if (user) {
          user.friends.push(friendId);
        } else {
          acc.push({ userId, friends: [friendId] });
        }
        return acc;
      }, initValue);

      const m = await Promise.all(
        merged.map(async (e) => {
          const messages = await this.prismaService.directMessage.findMany({
            orderBy: { sentAt: "desc" },
            where: {
              authorId: {
                in: e.friends,
              },
              recipientId: e.userId,
            },
            include: {
              author: true,
              recipient: true,
            },
          });
          return messages.reduce(
            (acc, curr) => {
              const index = acc.index.indexOf(curr.recipientId);
              if (index === -1) {
                acc.index.push(acc.messages.push([curr]));
              } else {
                const i = acc.messages[index];
                i && i.push(curr);
              }
              return acc;
            },
            {
              index: new Array<number>(),
              messages: new Array<
                (DirectMessage & { author: User; recipient: User })[]
              >(),
            }
          );
        })
      );

      return m.reduce((acc, curr) => {
        acc.push(...curr.messages);
        return acc;
      }, new Array<(DirectMessage & { author: User; recipient: User })[]>());
    });
  }
}
