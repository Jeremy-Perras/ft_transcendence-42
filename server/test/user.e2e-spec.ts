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
import { PrismaClient } from "@prisma/client";
import { SocketModule } from "../src/socket/socket.module";

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
        achievements: {
          select: {
            achievement: true,
          },
        },
        friendRequestsReceived: {
          where: {
            sender: {
              friendRequestsReceived: {
                none: {
                  senderId: currentUserId,
                },
              },
            },
          },
          select: {
            senderId: true,
          },
        },
        friendRequestsSent: {
          where: {
            receiver: {
              friendRequestsSent: {
                some: {
                  receiverId: currentUserId,
                },
              },
            },
          },
          select: {
            receiver: {
              select: {
                id: true,
                name: true,
                avatar: {
                  select: {
                    fileType: true,
                    image: true,
                  },
                },
                messageReceived: {
                  where: {
                    authorId: currentUserId,
                  },
                  select: {
                    authorId: true,
                    readAt: true,
                    content: true,
                    sentAt: true,
                  },
                  orderBy: {
                    sentAt: "desc",
                  },
                  take: 1,
                },
                messageSent: {
                  where: {
                    recipientId: currentUserId,
                  },
                  select: {
                    authorId: true,
                    readAt: true,
                    sentAt: true,
                    content: true,
                  },
                  orderBy: {
                    sentAt: "desc",
                  },
                  take: 1,
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
                  take: 1,
                  orderBy: {
                    sentAt: "desc",
                  },
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
              take: 1,
              orderBy: {
                sentAt: "desc",
              },
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
    });

    if (!user) throw new Error("!!"); // TODO: handle this

    expect(response.statusCode).toBe(200);

    const { user: self } = response.body.data;
    expect(self).toEqual(
      expect.objectContaining({
        id: user.id,
        name: user.name,
        rank: user.rank,
        avatar: `data:image/${user.avatar?.fileType.toLowerCase()};base64,${user.avatar?.image.toString(
          "base64"
        )}`,
        blocked: null,
        blocking: null,
        friendStatus: null,
        friends: expect.arrayContaining(
          user.friendRequestsSent.map((f) => ({ id: f.receiver.id }))
        ),
        pendingFriends: expect.arrayContaining(
          user.friendRequestsReceived.map((f) => ({
            id: f.senderId,
          }))
        ),
        achievements: expect.arrayContaining(
          user.achievements.map((a) => ({ name: a.achievement }))
        ),
        channels: expect.arrayContaining([
          ...user.ownedChannels.map((c) => ({ id: c.id })),
          ...user.channels.map((c) => ({ id: c.channel.id })),
        ]),
        chats: [
          ...user.channels.map((f) => {
            return {
              id: f.channel.id,
              type: "CHANNEL",
              name: f.channel.name,
              avatar: null,
              lastMessageContent:
                f.channel.channelMessages?.[0]?.content ?? null,
              lastMessageDate: f.channel.channelMessages?.[0]?.sentAt
                ? new Date(f.channel.channelMessages[0].sentAt).valueOf()
                : null,
              hasUnreadMessages: f.channel.channelMessages[0]
                ? f.channel.channelMessages[0].authorId === currentUserId
                  ? false
                  : f.channel.channelMessages[0].readBy.some(
                      (id) => id.userId === currentUserId
                    )
                : false,
              status: null,
            };
          }),
          ...user.ownedChannels.map((f) => {
            return {
              id: f.id,
              type: "CHANNEL",
              name: f.name,
              avatar: null,
              lastMessageContent: f.channelMessages?.[0]?.content ?? null,
              lastMessageDate: f.channelMessages?.[0]?.sentAt
                ? new Date(f.channelMessages[0].sentAt).valueOf()
                : null,
              hasUnreadMessages: f.channelMessages[0]
                ? f.channelMessages[0].authorId === currentUserId
                  ? false
                  : f.channelMessages[0].readBy.some(
                      (id) => id.userId === currentUserId
                    )
                : false,
              status: null,
            };
          }),
          ...user.friendRequestsSent.map((f) => {
            const lastMessageReceived = f.receiver.messageReceived[0];
            const lastMessageSent = f.receiver.messageSent[0];
            let lastMessage = lastMessageReceived ?? lastMessageSent ?? null;
            if (
              lastMessageReceived &&
              lastMessageSent &&
              lastMessageReceived.sentAt < lastMessageSent.sentAt
            ) {
              lastMessage = lastMessageSent;
            }
            return {
              id: f.receiver.id,
              type: "USER",
              name: f.receiver.name,
              avatar: `data:image/${f.receiver.avatar?.fileType.toLowerCase()};base64,${f.receiver.avatar?.image.toString(
                "base64"
              )}`,
              lastMessageContent: lastMessage?.content ?? null,
              lastMessageDate: lastMessage?.sentAt
                ? new Date(lastMessage.sentAt).valueOf()
                : null,
              hasUnreadMessages: lastMessage
                ? lastMessage.authorId === currentUserId
                  ? false
                  : !!lastMessage.readAt
                : false,
              status: "OFFLINE",
            };
          }),
        ].sort((x, y) => {
          const x_val = x.lastMessageDate ? x.lastMessageDate.valueOf() : -1;
          const y_val = y.lastMessageDate ? y.lastMessageDate.valueOf() : -1;
          return y_val - x_val;
        }),
        messages: [],
        status: "OFFLINE",
      })
    );
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
        achievements: {
          select: {
            achievement: true,
          },
        },
        friendRequestsReceived: {
          where: {
            sender: {
              id: currentUserId,
            },
          },
        },
        friendRequestsSent: {
          where: {
            receiver: {
              id: currentUserId,
            },
          },
        },
        usersBlocked: {
          where: {
            blockeeId: currentUserId,
          },
        },
        blockedByUsers: {
          where: {
            blockerId: currentUserId,
          },
        },
        messageReceived: {
          where: {
            authorId: currentUserId,
          },
          orderBy: {
            sentAt: "desc",
          },
        },
        messageSent: {
          where: {
            recipientId: currentUserId,
          },
          orderBy: {
            sentAt: "desc",
          },
        },
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
    });

    if (!user) throw new Error("!!"); // TODO: handle this

    expect(response.statusCode).toBe(200);

    const { user: self } = response.body.data;
    expect(self).toEqual(
      expect.objectContaining({
        id: user.id,
        name: user.name,
        rank: user.rank,
        avatar: `data:image/${user.avatar?.fileType.toLowerCase()};base64,${user.avatar?.image.toString(
          "base64"
        )}`,
        achievements: expect.arrayContaining(
          user.achievements.map((a) => ({ name: a.achievement }))
        ),
        blocked: user.blockedByUsers.length > 0,
        blocking: user.usersBlocked.length > 0,
        friendStatus:
          user.friendRequestsReceived.length > 0 &&
          user.friendRequestsSent.length > 0
            ? "FRIEND"
            : user.friendRequestsReceived.length > 0
            ? "INVITATION_SENT"
            : user.friendRequestsSent.length > 0
            ? "INVITATION_RECEIVED"
            : "NOT_FRIEND",
        messages: [...user.messageReceived, ...user.messageSent]
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
        friends: [],
        pendingFriends: [],
        channels: [],
        chats: [],
        status: "OFFLINE",
      })
    );
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
