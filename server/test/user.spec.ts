import supertest from "supertest";
import { Test } from "@nestjs/testing";
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
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
import { execSync } from "child_process";
import { EventEmitterModule } from "@nestjs/event-emitter";

const prismaUserArgs = {
  select: {
    id: true,
    name: true,
    rank: true,
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
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            rank: true,
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
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            rank: true,
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
                .sort((a, b) => a.sentAt.valueOf() - b.sentAt.valueOf())
                .map((m) => ({
                  id: m.id,
                  author: {
                    id: m.authorId,
                  },
                  recipient: {
                    id: m.recipientId,
                  },
                  content: m.content,
                  sentAt: m.sentAt.toISOString(),
                  readAt: m.readAt?.toISOString() ?? null,
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
                          hasUnread: !curr.readAt,
                          sent: curr.sentAt,
                        });
                      }
                    } else {
                      acc.set(id, {
                        author: curr.authorId,
                        recipient: curr.recipientId,
                        content: curr.content,
                        hasUnread: !curr.readAt,
                        sent: curr.sentAt,
                      });
                    }
                  }

                  return acc;
                }, new Map<number, { recipient: number; author: number; content: string; sent: Date; hasUnread: boolean }>());

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
                    lastMessageContent: lastMessage?.content ?? null,
                    lastMessageDate: lastMessage?.sentAt.toISOString() ?? null,
                    hasUnreadMessages: lastMessage
                      ? lastMessage.authorId === currentUserId
                        ? false
                        : !lastMessage.readBy.some(
                            (id) => id.userId === currentUserId
                          )
                      : false,
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
                      friend.lastMessageDate = new Date(
                        message.sent
                      ).toISOString();
                      friend.hasUnreadMessages =
                        message.author === currentUserId
                          ? false
                          : message.hasUnread;
                    }
                    return friend;
                  }),
                ];

                return merged.sort((x, y) => {
                  const x_val = new Date(x.lastMessageDate).valueOf()
                    ? new Date(x.lastMessageDate).valueOf()
                    : -1;
                  const y_val = new Date(y.lastMessageDate).valueOf()
                    ? new Date(y.lastMessageDate).valueOf()
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

describe("user", () => {
  let app: INestApplication;

  beforeAll(async () => {
    execSync("npm run dev:seed");

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: DataLoaderInterceptor,
        },
      ],
      imports: [
        EventEmitterModule.forRoot(),
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
            dateScalarMode: "isoDate",
          },
        }),
      ],
    })
      .overrideGuard(GqlAuthenticatedGuard)
      .useValue({ canActivate: (context: ExecutionContext) => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      })
    );
    app.use((req: any, res: any, next: any) => {
      req.user = currentUserId;
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`get self`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Test {
          user {
            id
            name
            rank
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

    expect(response.statusCode).toBe(200);
    expect(response.body.data.user).toMatchUser(user, currentUserId);
  });

  it(`get user 1 as 2`, async () => {
    currentUserId = 2;
    const userId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Test($id: Int!) {
          user(id: $id) {
            id
            name
            rank
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

    expect(response.statusCode).toBe(200);
    expect(response.body.data.user).toMatchUser(user, currentUserId);
  });

  it(`search users`, async () => {
    currentUserId = 1;
    const search = "a";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Test($name: String!) {
          users(name: $name) {
            id
            name
            rank
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

  it(`search users empty`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Test($name: String!) {
          users(name: $name) {
            id
            name
          }
        }`,
        variables: { name: "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.users).toEqual([]);
  });

  it(`user by id wrong input`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Test($id: Number!) {
          user(id: $Number) {
            id
          }
        }`,
        variables: { id: "1" },
      });

    expect(response.statusCode).toBe(400);
  });

  it(`users by name wrong input`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Test($name: String!) {
          users(name: $String) {
            id
          }
        }`,
        variables: { name: 1 },
      });

    expect(response.statusCode).toBe(400);
  });

  it(`can block other user`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          blockUser(userId: $userId)
        }`,
        variables: { userId: 20 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.blockUser).toBe(true);

    const block = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockeeId: {
          blockeeId: 20,
          blockerId: 1,
        },
      },
    });

    expect(block).not.toBeNull();
  });

  it(`can block friend`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          blockUser(userId: $userId)
        }`,
        variables: { userId: 2 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.blockUser).toBe(true);

    const block = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockeeId: {
          blockeeId: 20,
          blockerId: 1,
        },
      },
    });
    expect(block).not.toBeNull();

    const friendReq = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: 2,
          senderId: 1,
        },
      },
    });
    expect(friendReq).toBeNull();

    const friendInvite = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: 1,
          senderId: 2,
        },
      },
    });
    expect(friendInvite).toBeNull();
  });

  it(`cannot block itself`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          blockUser(userId: $userId)
        }`,
        variables: { userId: 1 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You cannot do this action to yourself"
    );

    const block = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockeeId: {
          blockeeId: 1,
          blockerId: 1,
        },
      },
    });
    expect(block).toBeNull();
  });

  it(`can unblock a user`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          unblockUser(userId: $userId)
        }`,
        variables: { userId: 6 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.unblockUser).toBe(true);

    const block = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockeeId: {
          blockeeId: 6,
          blockerId: 1,
        },
      },
    });
    expect(block).toBeNull();
  });

  it(`cannot unblock itself`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          blockUser(userId: $userId)
        }`,
        variables: { userId: 1 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You cannot do this action to yourself"
    );

    const block = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockeeId: {
          blockeeId: 1,
          blockerId: 1,
        },
      },
    });
    expect(block).toBeNull();
  });

  it(`can friend an other user`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          friendUser(userId: $userId)
        }`,
        variables: { userId: 10 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.friendUser).toBe(true);

    const friend = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: 10,
          senderId: 1,
        },
      },
    });
    expect(friend).not.toBeNull();
  });

  it(`cannot friend a blocked user`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          friendUser(userId: $userId)
        }`,
        variables: { userId: 7 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("You are blocking this user");

    const friend = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: 7,
          senderId: 1,
        },
      },
    });
    expect(friend).toBeNull();
  });

  it(`cannot friend a blocking user`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          friendUser(userId: $userId)
        }`,
        variables: { userId: 8 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are blocked by this user"
    );

    const friend = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: 8,
          senderId: 1,
        },
      },
    });
    expect(friend).toBeNull();
  });

  it(`cannot friend itself`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          friendUser(userId: $userId)
        }`,
        variables: { userId: 1 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You cannot do this action to yourself"
    );

    const friend = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: 1,
          senderId: 1,
        },
      },
    });
    expect(friend).toBeNull();
  });

  it(`can unfriend a friended user`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          unfriendUser(userId: $userId)
        }`,
        variables: { userId: 3 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.unfriendUser).toBe(true);

    const friendReq = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: 3,
          senderId: 1,
        },
      },
    });
    expect(friendReq).toBeNull();

    const friendInvite = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: 1,
          senderId: 3,
        },
      },
    });
    expect(friendInvite).toBeNull();
  });

  it(`cannot unfriend a non friended user`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          unfriendUser(userId: $userId)
        }`,
        variables: { userId: 4 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are not friends with this user"
    );

    // Check that the friend request still exists
    const friend = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: 4,
          senderId: 1,
        },
      },
    });
    expect(friend).not.toBeNull();
  });

  it(`cannot unfriend itself`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          friendUser(userId: $userId)
        }`,
        variables: { userId: 1 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You cannot do this action to yourself"
    );
  });

  it(`can cancel a friend invite`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          cancelInvitation(userId: $userId)
        }`,
        variables: { userId: 10 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.cancelInvitation).toBe(true);

    const friendReq = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: 10,
          senderId: 1,
        },
      },
    });
    expect(friendReq).toBeNull();
  });

  it(`can cancel a non existing friend invite`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          cancelInvitation(userId: $userId)
        }`,
        variables: { userId: 500 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.cancelInvitation).toBe(true);
  });

  it(`cannot cancel a friend invite to itself`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          cancelInvitation(userId: $userId)
        }`,
        variables: { userId: 1 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You cannot do this action to yourself"
    );
  });

  it(`can refuse a friend invite`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          refuseInvitation(userId: $userId)
        }`,
        variables: { userId: 5 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.refuseInvitation).toBe(true);

    const friendReq = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          receiverId: 1,
          senderId: 5,
        },
      },
    });
    expect(friendReq).toBeNull();
  });

  it(`can refuse a non existing friend invite`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          refuseInvitation(userId: $userId)
        }`,
        variables: { userId: 500 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.refuseInvitation).toBe(true);
  });

  it(`cannot refuse a friend invite to itself`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          refuseInvitation(userId: $userId)
        }`,
        variables: { userId: 1 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You cannot do this action to yourself"
    );
  });

  it(`can update username`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($name: String!) {
          updateUserName(name: $name)
        }`,
        variables: { name: "test" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.updateUserName).toBe(true);

    const user = await prisma.user.findUnique({
      where: {
        id: 1,
      },
    });
    expect(user?.name).toBe("test");
  });

  it(`cannot set empty username`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($name: String!) {
          updateUserName(name: $name)
        }`,
        variables: { name: "" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Bad Request Exception");

    const user = await prisma.user.findUnique({
      where: {
        id: 1,
      },
    });
    expect(user?.name).toBe("test");
  });

  it(`cannot set long username`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($name: String!) {
          updateUserName(name: $name)
        }`,
        variables: {
          name: "123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789123456789",
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Bad Request Exception");

    const user = await prisma.user.findUnique({
      where: {
        id: 1,
      },
    });
    expect(user?.name).toBe("test");
  });

  it(`cannot have same username as other user`, async () => {
    currentUserId = 2;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($name: String!) {
          updateUserName(name: $name)
        }`,
        variables: { name: "test" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Name already used");

    const user = await prisma.user.findUnique({
      where: {
        id: 2,
      },
    });
    expect(user?.name).not.toBe("test");
  });

  it(`can send message to friend`, async () => {
    currentUserId = 2;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!, $message: String!) {
          sendDirectMessage(userId: $userId, message: $message)
        }`,
        variables: { userId: 3, message: "hello" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.sendDirectMessage).toBe(true);

    const messages = await prisma.directMessage.findMany({
      where: {
        authorId: 2,
        recipientId: 3,
      },
    });
    expect(messages.length).toBe(1);
    expect(messages[0]?.content).toBe("hello");
  });

  it(`cannot send empty message`, async () => {
    currentUserId = 2;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!, $message: String!) {
          sendDirectMessage(userId: $userId, message: $message)
        }`,
        variables: { userId: 3, message: "" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Bad Request Exception");

    const messages = await prisma.directMessage.findMany({
      where: {
        authorId: 2,
        recipientId: 3,
      },
    });
    expect(messages.length).toBe(1);
    expect(messages[0]?.content).toBe("hello");
  });

  it(`cannot send long message`, async () => {
    currentUserId = 2;

    const genMessage = (num: number) => {
      let res = "";
      for (let i = 0; i < num; i++) {
        const random = Math.floor(Math.random() * 27);
        res += String.fromCharCode(97 + random);
      }
      return res;
    };

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!, $message: String!) {
          sendDirectMessage(userId: $userId, message: $message)
        }`,
        variables: { userId: 3, message: genMessage(70000) },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Bad Request Exception");

    const messages = await prisma.directMessage.findMany({
      where: {
        authorId: 2,
        recipientId: 3,
      },
    });
    expect(messages.length).toBe(1);
    expect(messages[0]?.content).toBe("hello");
  });

  it(`cannot send message to non friend`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!, $message: String!) {
          sendDirectMessage(userId: $userId, message: $message)
        }`,
        variables: { userId: 4, message: "hello" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are not friends with this user"
    );

    const messages = await prisma.directMessage.findMany({
      where: {
        authorId: 1,
        recipientId: 4,
      },
    });
    expect(messages.length).toBe(0);
  });

  it(`cannot send message to itself`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!, $message: String!) {
          sendDirectMessage(userId: $userId, message: $message)
        }`,
        variables: { userId: 1, message: "hello" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You cannot do this action to yourself"
    );

    const messages = await prisma.directMessage.findMany({
      where: {
        authorId: 1,
        recipientId: 1,
      },
    });
    expect(messages.length).toBe(0);
  });

  it(`cannot use invalid userid`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($userId: Int!) {
          blockUser(userId: $userId)
        }`,
        variables: { userId: -1 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Bad Request Exception");
  });
});
