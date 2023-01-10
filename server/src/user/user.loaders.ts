import { Injectable } from "@nestjs/common";
import { UserAchievement, DirectMessage, User } from "@prisma/client";
import DataLoader from "dataloader";
import { NestDataLoader } from "../dataloader";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserLoader implements NestDataLoader<number, User> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, User> {
    return new DataLoader<number, User>(async (keys) => {
      const users = await this.prismaService.user.findMany({
        where: {
          id: {
            in: [...keys],
          },
        },
      });
      const c = users.reduce((acc, curr) => {
        const index = keys.indexOf(curr.id);
        acc[index] = curr;
        return acc;
      }, new Array<User>());
      return c;
    });
  }
}

@Injectable()
export class FriendedByIdsLoader implements NestDataLoader<number, number[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, number[]> {
    return new DataLoader<number, number[]>(async (keys) => {
      const u = await this.prismaService.friendRequest.findMany({
        where: { senderId: { in: [...keys] } },
      });

      const result = u.reduce((acc, curr) => {
        const index = keys.indexOf(curr.senderId);
        if (!acc[index]) {
          acc[index] = new Array<number>();
        }
        acc[index]?.push(curr.receiverId);
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

@Injectable()
export class FriendIdsLoader implements NestDataLoader<number, number[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, number[]> {
    return new DataLoader<number, number[]>(async (keys) => {
      const u = await this.prismaService.friendRequest.findMany({
        where: { receiverId: { in: [...keys] } },
      });

      const result = u.reduce((acc, curr) => {
        const index = keys.indexOf(curr.receiverId);
        if (!acc[index]) {
          acc[index] = new Array<number>();
        }
        acc[index]?.push(curr.senderId);
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

@Injectable()
export class BlockedByIdsLoader implements NestDataLoader<number, number[]> {
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, number[]> {
    return new DataLoader<number, number[]>(async (keys) => {
      const u = await this.prismaService.userBlock.findMany({
        where: { blockerId: { in: [...keys] } },
      });

      const result = u.reduce((acc, curr) => {
        const index = keys.indexOf(curr.blockerId);
        if (!acc[index]) {
          acc[index] = new Array<number>();
        }
        acc[index]?.push(curr.blockeeId);
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

@Injectable()
export class BlockingIdsLoader implements NestDataLoader<number, number[]> {
  constructor(private prismaService: PrismaService) {}
  generateDataLoader(): DataLoader<number, number[]> {
    return new DataLoader<number, number[]>(async (keys) => {
      const u = await this.prismaService.userBlock.findMany({
        where: { blockeeId: { in: [...keys] } },
      });

      const result = u.reduce((acc, curr) => {
        const index = keys.indexOf(curr.blockeeId);
        if (!acc[index]) {
          acc[index] = new Array<number>();
        }
        acc[index]?.push(curr.blockerId);
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

@Injectable()
export class AchivementsLoader
  implements NestDataLoader<number, UserAchievement[]>
{
  constructor(private prismaService: PrismaService) {}

  generateDataLoader(): DataLoader<number, UserAchievement[]> {
    return new DataLoader<number, UserAchievement[]>(async (keys) => {
      const users = await this.prismaService.user.findMany({
        select: {
          id: true,
          achievements: true,
        },
        where: {
          id: {
            in: [...keys],
          },
        },
      });

      return users.reduce((acc, curr) => {
        const index = keys.indexOf(curr.id);
        acc[index] = curr.achievements;
        return acc;
      }, new Array<UserAchievement[]>());
    });
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
          OR: [
            {
              owner: { id: { in: [...keys] } },
            },
            {
              members: { some: { userId: { in: [...keys] } } },
            },
          ],
        },
      });

      const result = c.reduce((acc, curr) => {
        const index = keys.findIndex((e) => curr.ownerId === e);
        if (index !== -1) {
          if (!acc[index]) {
            acc[index] = new Array<number>();
          }
          acc[index]?.push(curr.id);
        } else {
          curr.members.forEach((m) => {
            const index = keys.findIndex((e) => m.userId === e);
            if (!acc[index]) {
              acc[index] = new Array<number>();
            }
            acc[index]?.push(curr.id);
          });
        }
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

      const messagesArray = await Promise.all(
        merged.map(
          async (e) =>
            await this.prismaService.directMessage.findMany({
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
            })
        )
      );

      const result = messagesArray.reduce((acc, curr) => {
        curr.map((m) => {
          const index = keys.findIndex(
            (t) => t[0] === m.authorId && t[1] === m.recipientId
          );
          if (!acc[index]) {
            acc[index] = new Array<
              DirectMessage & { author: User; recipient: User }
            >();
          }
          acc[index]?.push(m);
        });
        return acc;
      }, new Array<(DirectMessage & { author: User; recipient: User })[]>());

      for (let index = 0; index < keys.length; index++) {
        if (!result[index]) {
          result[index] = new Array<
            DirectMessage & { author: User; recipient: User }
          >();
        }
      }

      return result;
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

      const messagesArray = await Promise.all(
        merged.map(
          async (e) =>
            await this.prismaService.directMessage.findMany({
              orderBy: { sentAt: "desc" },
              where: {
                recipientId: e.userId,
                authorId: {
                  in: e.friends,
                },
              },
              include: {
                author: true,
                recipient: true,
              },
            })
        )
      );

      const result = messagesArray.reduce((acc, curr) => {
        curr.map((m) => {
          const index = keys.findIndex(
            (t) => t[0] === m.recipientId && t[1] === m.authorId
          );
          if (!acc[index]) {
            acc[index] = new Array<
              DirectMessage & { author: User; recipient: User }
            >();
          }
          acc[index]?.push(m);
        });
        return acc;
      }, new Array<(DirectMessage & { author: User; recipient: User })[]>());

      for (let index = 0; index < keys.length; index++) {
        if (!result[index]) {
          result[index] = new Array<
            DirectMessage & { author: User; recipient: User }
          >();
        }
      }

      return result;
    });
  }
}
