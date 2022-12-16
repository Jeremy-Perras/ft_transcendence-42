import supertest from "supertest";
import { Test } from "@nestjs/testing";
import { ExecutionContext, INestApplication } from "@nestjs/common";
import { UserModule } from "../src/user/user.module";
import { ChannelModule } from "../src/channel/channel.module";
import { GameModule } from "../src/game/game.module";
import { UploadModule } from "../src/upload/upload.module";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { DataLoaderInterceptor } from "../src/dataloader";
import { AuthModule } from "../src/auth/auth.module";
import { GqlAuthenticatedGuard } from "../src/auth/authenticated.guard";
import { Prisma, PrismaClient } from "@prisma/client";
import { SocketModule } from "../src/socket/socket.module";

const prismaUserArgs = {
  select: {
    id: true,
    name: true,
    rank: true,
    avatar: {
      select: {
        fileType: true,
        image: true,
      },
    },
    usersBlocked: true,
    blockedByUsers: true,
    achievements: {
      select: {
        achievement: true,
      },
    },
    friendRequestsReceived: {
      select: {
        senderId: true,
        receiverId: true,
        sender: {
          select: {
            id: true,
            name: true,
            rank: true,
            avatar: {
              select: {
                fileType: true,
                image: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            rank: true,
            avatar: {
              select: {
                fileType: true,
                image: true,
              },
            },
          },
        },
      },
    },
    friendRequestsSent: {
      select: {
        senderId: true,
        receiverId: true,
        sender: {
          select: {
            id: true,
            name: true,
            rank: true,
            avatar: {
              select: {
                fileType: true,
                image: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            rank: true,
            avatar: {
              select: {
                fileType: true,
                image: true,
              },
            },
          },
        },
      },
    },
    channels: {
      select: {
        channel: {
          select: {
            id: true,
            name: true,
            channelMessages: {
              select: {
                authorId: true,
                content: true,
                sentAt: true,
                readBy: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    ownedChannels: {
      select: {
        id: true,
        name: true,
        channelMessages: {
          select: {
            authorId: true,
            content: true,
            sentAt: true,
            readBy: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    },
    messageReceived: true,
    messageSent: true,
    gamesAsPlayer1: {
      select: {
        id: true,
      },
    },
    gamesAsPlayer2: {
      select: {
        id: true,
      },
    },
  },
} satisfies Prisma.UserArgs;

expect.extend({
  toMatchUser(
    received: unknown | unknown[],
    expected:
      | Prisma.UserGetPayload<typeof prismaUserArgs>
      | Prisma.UserGetPayload<typeof prismaUserArgs>[],
    currentUserId: number
  ) {
    const expectUserObject = (
      e: Prisma.UserGetPayload<typeof prismaUserArgs>
    ) =>
      expect.objectContaining({
        id: e.id,

        status: "OFFLINE",

        name: e.name,

        rank: e.rank,

        avatar: `data:image/${e.avatar?.fileType.toLowerCase()};base64,${e.avatar?.image.toString(
          "base64"
        )}`,

        blocking:
          e.id === currentUserId
            ? null
            : e.usersBlocked.some((u) => u.blockeeId === currentUserId),

        blocked:
          e.id === currentUserId
            ? null
            : e.blockedByUsers.some((u) => u.blockerId === currentUserId),

        friendStatus:
          e.id === currentUserId
            ? null
            : (() => {
                const isSent = e.friendRequestsReceived.some(
                  (f) => f.senderId === currentUserId
                );
                const isReceived = e.friendRequestsSent.some(
                  (f) => f.receiverId === currentUserId
                );
                return isSent && isReceived
                  ? "FRIEND"
                  : isSent
                  ? "INVITATION_SENT"
                  : isReceived
                  ? "INVITATION_RECEIVED"
                  : "NOT_FRIEND";
              })(),

        friends:
          e.id === currentUserId
            ? expect.arrayContaining(
                e.friendRequestsSent
                  .filter((f) =>
                    e.friendRequestsReceived.some(
                      (r) => f.receiverId === r.senderId
                    )
                  )
                  .map((f) => ({
                    id: f.receiverId,
                  }))
              )
            : [],

        pendingFriends:
          e.id === currentUserId
            ? expect.arrayContaining(
                e.friendRequestsReceived
                  .filter(
                    (f) =>
                      !e.friendRequestsSent.some(
                        (r) => f.senderId === r.receiverId
                      )
                  )
                  .map((f) => ({
                    id: f.senderId,
                  }))
              )
            : [],

        achievements: expect.arrayContaining(
          e.achievements.map((a) => ({ name: a.achievement }))
        ),

        channels:
          e.id === currentUserId
            ? expect.arrayContaining([
                ...e.ownedChannels.map((c) => ({ id: c.id })),
                ...e.channels.map((c) => ({ id: c.channel.id })),
              ])
            : [],

        messages:
          e.id === currentUserId
            ? []
            : [...e.messageReceived, ...e.messageSent]
                .filter(
                  (m) =>
                    m.authorId === currentUserId ||
                    m.recipientId === currentUserId
                )
                .sort((a, b) => b.sentAt.valueOf() - a.sentAt.valueOf())
                .map((m) => ({
                  id: m.id,
                  author: {
                    id: m.authorId,
                  },
                  recipient: {
                    id: m.recipientId,
                  },
                  content: m.content,
                  sentAt: m.sentAt.valueOf(),
                  readAt: m.readAt?.valueOf() ?? null,
                })),

        chats:
          e.id === currentUserId
            ? (() => {
                const friends = e.friendRequestsSent
                  .filter((f) =>
                    e.friendRequestsReceived.some(
                      (r) => f.receiverId === r.senderId
                    )
                  )
                  .map((f) => ({
                    id: f.receiverId,
                    name: f.receiver.name,
                    avatar: `data:image/${f.receiver.avatar?.fileType.toLowerCase()};base64,${f.receiver.avatar?.image.toString(
                      "base64"
                    )}`,
                  }));

                const lastMessages = [
                  ...e.messageReceived,
                  ...e.messageSent,
                ].reduce((acc, curr) => {
                  const id =
                    curr.authorId === currentUserId
                      ? curr.recipientId
                      : curr.authorId;

                  if (friends.some((f) => f.id === id)) {
                    const lastMessage = acc.get(id);
                    if (lastMessage) {
                      if (lastMessage.sent < curr.sentAt) {
                        acc.set(id, {
                          author: curr.authorId,
                          recipient: curr.recipientId,
                          content: curr.content,
                          read: !!curr.readAt,
                          sent: curr.sentAt,
                        });
                      }
                    } else {
                      acc.set(id, {
                        author: curr.authorId,
                        recipient: curr.recipientId,
                        content: curr.content,
                        read: !!curr.readAt,
                        sent: curr.sentAt,
                      });
                    }
                  }

                  return acc;
                }, new Map<number, { recipient: number; author: number; content: string; sent: Date; read: boolean }>());

                const formatChannel = (
                  channel: Prisma.ChannelGetPayload<{
                    select: {
                      id: true;
                      name: true;
                      channelMessages: {
                        select: {
                          authorId: true;
                          content: true;
                          sentAt: true;
                          readBy: {
                            select: {
                              userId: true;
                            };
                          };
                        };
                      };
                    };
                  }>
                ) => {
                  const lastMessage =
                    channel.channelMessages.length > 0
                      ? channel.channelMessages[0]
                      : undefined;
                  return {
                    id: channel.id,
                    type: "CHANNEL",
                    name: channel.name,
                    avatar: null,
                    lastMessageContent: lastMessage?.content ?? null,
                    lastMessageDate: lastMessage?.sentAt.valueOf() ?? null,
                    hasUnreadMessages:
                      lastMessage?.readBy.some(
                        (id) => id.userId === currentUserId
                      ) ?? false,
                    status: null,
                  };
                };

                const merged = [
                  ...e.channels.map((f) => formatChannel(f.channel)),
                  ...e.ownedChannels.map(formatChannel),
                  ...friends.map((f) => {
                    const friend: any = {
                      ...f,
                      type: "USER",
                      status: "OFFLINE",
                      lastMessageContent: null,
                      lastMessageDate: null,
                      hasUnreadMessages: false,
                    };
                    const message = lastMessages.get(f.id);
                    if (message) {
                      friend.lastMessageContent = message.content;
                      friend.lastMessageDate = new Date(message.sent).valueOf();
                      friend.hasUnreadMessages =
                        message.author === currentUserId ? false : message.read;
                    }
                    return friend;
                  }),
                ];

                return merged.sort((x, y) => {
                  const x_val = x.lastMessageDate
                    ? x.lastMessageDate.valueOf()
                    : -1;
                  const y_val = y.lastMessageDate
                    ? y.lastMessageDate.valueOf()
                    : -1;
                  return y_val - x_val;
                });
              })()
            : [],
      });

    const expectUserArray = (
      todos: Array<Prisma.UserGetPayload<typeof prismaUserArgs>>
    ) => expect.arrayContaining(todos.map(expectUserObject));

    const expectedResult = Array.isArray(expected)
      ? expectUserArray(expected)
      : expectUserObject(expected);

    const pass = this.equals(received, expectedResult);

    if (pass) {
      return {
        message: () =>
          `Expected: ${this.utils.printExpected(
            expectedResult
          )}\nReceived: ${this.utils.printReceived(received)}`,
        pass: true,
      };
    }
    return {
      message: () =>
        `Expected: ${this.utils.printExpected(
          expectedResult
        )}\nReceived: ${this.utils.printReceived(
          received
        )}\n\n${this.utils.diff(expectedResult, received)}`,
      pass: false,
    };
  },
});
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchUser(expected: unknown | unknown[], currentUserId: number): R;
    }
  }
}

const prisma = new PrismaClient();
let currentUserId: number;

describe("User", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: DataLoaderInterceptor,
        },
      ],
      imports: [
        SocketModule,
        AuthModule,
        UserModule,
        GameModule,
        ChannelModule,
        UploadModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), "test/schema.gql"),
          buildSchemaOptions: {
            dateScalarMode: "timestamp",
          },
        }),
      ],
    })
      .overrideGuard(GqlAuthenticatedGuard)
      .useValue({ canActivate: (context: ExecutionContext) => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, res: any, next: any) => {
      req.user = currentUserId;
      next();
    });
    await app.init();
  });

  it(`get self`, async () => {
    currentUserId = 1;

    // TODO : add game
    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Test {
          user {
            id
            name
            rank
            avatar
            blocked
            blocking
            friendStatus
            status
            friends {
              id
            }
            pendingFriends {
              id
            }
            achievements {
              name
            }
            messages {
              id
              author {
                id
              }
              recipient {
                id
              }
              content
              sentAt
              readAt
            }
            chats {
              id
              type
              avatar
              name
              lastMessageContent
              lastMessageDate
              hasUnreadMessages
              status
            }
            channels {
              id
            }
          }
        }`,
      });

    const user = await prisma.user.findUnique({
      where: {
        id: currentUserId,
      },
      ...prismaUserArgs,
    });

    if (!user) throw new Error("!!"); // TODO: handle this

    expect(response.statusCode).toBe(200);
    expect(response.body.data.user).toMatchUser(user, currentUserId);
  });

  it(`get user 1 as 2`, async () => {
    currentUserId = 2;
    const userId = 1;

    // TODO : add game
    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Test($id: Int!) {
          user(id: $id) {
            id
            name
            rank
            avatar
            blocked
            blocking
            friendStatus
            status
            friends {
              id
            }
            pendingFriends {
              id
            }
            achievements {
              name
            }
            messages {
              id
              author {
                id
              }
              recipient {
                id
              }
              content
              sentAt
              readAt
            }
            chats {
              id
              type
              avatar
              name
              lastMessageContent
              lastMessageDate
              hasUnreadMessages
              status
            }
            channels {
              id
            }
          }
        }`,
        variables: { id: userId },
      });

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      ...prismaUserArgs,
    });

    if (!user) throw new Error("!!"); // TODO: handle this

    expect(response.statusCode).toBe(200);
    expect(response.body.data.user).toMatchUser(user, currentUserId);
  });

  it(`search users`, async () => {
    currentUserId = 1;
    const search = "a";

    // TODO : add game
    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Test($name: String!) {
          users(name: $name) {
            id
            name
            rank
            avatar
            blocked
            blocking
            friendStatus
            status
            friends {
              id
            }
            pendingFriends {
              id
            }
            achievements {
              name
            }
            messages {
              id
              author {
                id
              }
              recipient {
                id
              }
              content
              sentAt
              readAt
            }
            chats {
              id
              type
              avatar
              name
              lastMessageContent
              lastMessageDate
              hasUnreadMessages
              status
            }
            channels {
              id
            }
          }
        }`,
        variables: { name: search },
      });

    const users = await prisma.user.findMany({
      where: {
        name: {
          mode: "insensitive",
          contains: search,
        },
      },
      ...prismaUserArgs,
    });

    if (!users) throw new Error("!!"); // TODO: handle this

    expect(response.statusCode).toBe(200);
    expect(response.body.data.users).toMatchUser(users, currentUserId);
  });

  it(`user not found`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query ExampleQuery($id: Int!) {
          user(id: $id) {
            id
            name
          }
        }`,
        variables: { id: 200 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("User not found");
  });

  it(`wrong input`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query ExampleQuery($id: String!) {
          user(id: $String) {
            id
            name
          }
        }`,
        variables: { id: "1" },
      });

    expect(response.statusCode).toBe(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
