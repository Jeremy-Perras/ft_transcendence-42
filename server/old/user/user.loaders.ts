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
export class FriendedByIdsLoader implements NestDataLoader<number, number[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, number[]> {
    return new DataLoader<number, number[]>(async (keys) => {
      const u = await this.prismaService.userFriends.findMany({
        where: { inviteeId: { in: [...keys] } },
      });
      return u.reduce((acc, curr) => {
        const index = keys.indexOf(curr.inviteeId);
        acc[index]?.push(curr.inviterId);
        return acc;
      }, new Array<number[]>());
    });
  }
}

@Injectable()
export class FriendIdsLoader implements NestDataLoader<number, number[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, number[]> {
    return new DataLoader<number, number[]>(async (keys) => {
      const u = await this.prismaService.userFriends.findMany({
        where: { inviterId: { in: [...keys] } },
      });
      return u.reduce((acc, curr) => {
        const index = keys.indexOf(curr.inviterId);
        acc[index]?.push(curr.inviteeId);
        return acc;
      }, new Array<number[]>());
    });
  }
}

@Injectable()
export class BlockedByIdsLoader implements NestDataLoader<number, number[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, number[]> {
    return new DataLoader<number, number[]>(async (keys) => {
      const u = await this.prismaService.userBlocking.findMany({
        where: { blockeeId: { in: [...keys] } },
      });
      return u.reduce((acc, curr) => {
        const index = keys.indexOf(curr.blockeeId);
        acc[index]?.push(curr.blockerId);
        return acc;
      }, new Array<number[]>());
    });
  }
}

@Injectable()
export class BlockingIdsLoader implements NestDataLoader<number, number[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, number[]> {
    return new DataLoader<number, number[]>(async (keys) => {
      const u = await this.prismaService.userBlocking.findMany({
        where: { blockerId: { in: [...keys] } },
      });
      return u.reduce((acc, curr) => {
        const index = keys.indexOf(curr.blockerId);
        acc[index]?.push(curr.blockeeId);
        return acc;
      }, new Array<number[]>());
    });
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
export class UserChannelIdsLoader implements NestDataLoader<number, number[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, number[]> {
    return new DataLoader<number, number[]>(async (keys) => {
      const c = await this.prismaService.channel.findMany({
        select: {
          id: true,
          members: {
            select: {
              userId: true,
            },
          },
          ownerId: true,
        },
        where: {
          owner: { id: { in: [...keys] } },
          members: { some: { userId: { in: [...keys] } } },
        },
      });
      return c.reduce((acc, curr) => {
        const index = keys.find((e) => curr.ownerId === e);
        if (index) {
          acc[index]?.push(curr.id);
        }
        curr.members.forEach((m) => {
          const index = keys.find((e) => m.userId === e);
          if (index) {
            acc[index]?.push(curr.id);
          }
        });
        return acc;
      }, new Array<number[]>());
    });
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
              const i = acc.messages[index];
              i && i.push(curr);
              return acc;
            },
            {
              index: keys.map((k) => k[1]),
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
              const i = acc.messages[index];
              i && i.push(curr);
              return acc;
            },
            {
              index: keys.map((k) => k[1]),
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
