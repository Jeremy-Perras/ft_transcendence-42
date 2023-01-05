import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import bcrypt from "bcrypt";
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import { Prisma, PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { join } from "path";
import { AuthModule } from "../src/auth/auth.module";
import { GqlAuthenticatedGuard } from "../src/auth/authenticated.guard";
import { ChannelModule } from "../src/channel/channel.module";
import { DataLoaderInterceptor } from "../src/dataloader";
import { GameModule } from "../src/game/game.module";
import { SocketModule } from "../src/socket/socket.module";
import { UploadModule } from "../src/upload/upload.module";
import { UserModule } from "../src/user/user.module";
import supertest from "supertest";

const prismaChannelArgs = {
  select: {
    id: true,
    name: true,
    inviteOnly: true,
    password: true,
    ownerId: true,
    members: {
      select: {
        userId: true,
        role: true,
      },
    },
    channelMessages: {
      select: {
        id: true,
        sentAt: true,
        readBy: {
          select: {
            userId: true,
          },
        },
      },
    },
    restrictedMembers: {
      select: {
        restriction: true,
        userId: true,
        endAt: true,
        startAt: true,
      },
    },
  },
} satisfies Prisma.ChannelArgs;

expect.extend({
  toMatchChannel(
    received: unknown | unknown[],
    expected:
      | Prisma.ChannelGetPayload<typeof prismaChannelArgs>
      | Prisma.ChannelGetPayload<typeof prismaChannelArgs>[],
    currentUserId: number
  ) {
    const expectChannelObject = (
      e: Prisma.ChannelGetPayload<typeof prismaChannelArgs>
    ) => {
      const isMember =
        currentUserId == e.ownerId ||
        e.members.some((m) => m.userId === currentUserId);
      return expect.objectContaining({
        name: e.name,
        id: e.id,
        private: e.inviteOnly,
        passwordProtected: !!e.password,
        owner: expect.objectContaining({
          id: e.ownerId,
        }),
        admins: isMember
          ? expect.arrayContaining(
              e.members
                .filter((m) => m.role === "ADMIN")
                .map((m) => expect.objectContaining({ id: m.userId }))
            )
          : [],
        members: isMember
          ? expect.arrayContaining(
              e.members
                .filter((m) => m.role === "MEMBER")
                .map((m) => expect.objectContaining({ id: m.userId }))
            )
          : [],
        messages: isMember
          ? expect.arrayContaining(
              e.channelMessages
                .sort((a, b) => a.sentAt.valueOf() - b.sentAt.valueOf())
                .map((m) => ({
                  id: m.id,
                  readBy: m.readBy.map((r) => ({
                    id: r.userId,
                  })),
                }))
            )
          : [],
        banned: isMember
          ? expect.arrayContaining(
              e.restrictedMembers
                .filter((m) => m.restriction === "BAN")
                .filter((m) => (m.endAt ? m.endAt > new Date() : true))
                .map((m) => ({
                  user: { id: m.userId },
                  endAt: m.endAt?.valueOf() ?? null,
                }))
            )
          : [],
        muted: isMember
          ? expect.arrayContaining(
              e.restrictedMembers
                .filter((m) => m.restriction === "MUTE")
                .filter((m) => (m.endAt ? m.endAt > new Date() : true))
                .map((m) => ({
                  user: { id: m.userId },
                  endAt: m.endAt?.valueOf() ?? null,
                }))
            )
          : [],
      });
    };

    const expectChannelArray = (
      todos: Array<Prisma.ChannelGetPayload<typeof prismaChannelArgs>>
    ) => expect.arrayContaining(todos.map(expectChannelObject));

    const expectedResult = Array.isArray(expected)
      ? expectChannelArray(expected)
      : expectChannelObject(expected);

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
      toMatchChannel(expected: unknown | unknown[], currentUserId: number): R;
    }
  }
}

const prisma = new PrismaClient();
let currentUserId: number;

describe("queries", () => {
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

  it(`can search channel`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Channels($name: String!) {
          channels(name: $name) {
            private
            passwordProtected
            name
            id
            admins {
              id
            }
            banned {
              endAt
              user {
                id
              }
            }
            members {
              id
            }
            messages {
              id
              readBy {
                id
              }
            }
            muted {
              endAt

              user {
                id
              }
            }
            owner {
              id
            }
          }
        }`,
        variables: { name: "a" },
      });

    const channels = await prisma.channel.findMany({
      where: {
        name: {
          mode: "insensitive",
          contains: "a",
        },
      },
      ...prismaChannelArgs,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.channels).toMatchChannel(channels, currentUserId);
  });

  it(`can search non existing channel`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Channels($name: String!) {
          channels(name: $name) {
            id
          }
        }`,
        variables: { name: "aaaaaaaaaaaaaaaaa" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.channels).toStrictEqual([]);
  });

  it(`cannot use invalid channel id`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Channel($id: Int!) {
          channel(id: $id) {
            id
          }
        }`,
        variables: { id: -1 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Channel not found");
  });

  it(`can get channel`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Channel($id: Int!) {
          channel(id: $id) {
            private
            passwordProtected
            name
            id
            admins {
              id
            }
            banned {
              endAt
              user {
                id
              }
            }
            members {
              id
            }
            messages {
              id
              readBy {
                id
              }
            }
            muted {
              endAt

              user {
                id
              }
            }
            owner {
              id
            }
          }
        }`,
        variables: { id: 1 },
      });

    expect(response.statusCode).toBe(200);

    const channel = await prisma.channel.findUnique({
      where: {
        id: 1,
      },
      ...prismaChannelArgs,
    });

    expect(response.body.data.channel).toMatchChannel(channel, currentUserId);
  });

  it(`cannot get non existing channel`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Channel($id: Int!) {
          channel(id: $id) {
            id
          }
        }`,
        variables: { id: 10 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Channel not found");
  });

  it(`cannot access channel info as non member`, async () => {
    currentUserId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Channel($id: Int!) {
          channel(id: $id) {
            private
            passwordProtected
            name
            id
            admins {
              id
            }
            banned {
              endAt
              user {
                id
              }
            }
            members {
              id
            }
            messages {
              id
              readBy {
                id
              }
            }
            muted {
              endAt

              user {
                id
              }
            }
            owner {
              id
            }
          }
        }`,
        variables: { id: 3 },
      });

    expect(response.statusCode).toBe(200);

    const channel = await prisma.channel.findUnique({
      where: {
        id: 3,
      },
      ...prismaChannelArgs,
    });

    expect(response.body.data.channel).toMatchChannel(channel, currentUserId);
  });

  it(`can join public channel`, async () => {
    currentUserId = 81;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          joinChannel(id: $id)
        }`,
        variables: { id: 1 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.joinChannel).toBe(true);

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: 1,
          userId: currentUserId,
        },
      },
    });
    expect(member).not.toBeNull();
  });

  it(`cannot join public channel if banned`, async () => {
    currentUserId = 82;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          joinChannel(id: $id)
        }`,
        variables: { id: 1 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are banned from this channel"
    );

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: 1,
          userId: currentUserId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`cannot join private channel`, async () => {
    currentUserId = 82;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          joinChannel(id: $id)
        }`,
        variables: { id: 3 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("This channel is invite only");

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: 3,
          userId: currentUserId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`can join password channel`, async () => {
    currentUserId = 60;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
          joinChannel(id: $id, password: $password)
        }`,
        variables: { id: 2, password: "password" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.joinChannel).toBe(true);

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: 2,
          userId: currentUserId,
        },
      },
    });
    expect(member).not.toBeNull();
  });

  it(`cannot join password channel without password`, async () => {
    currentUserId = 61;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          joinChannel(id: $id)
        }`,
        variables: { id: 2 },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Password is incorrect");

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: 2,
          userId: currentUserId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`cannot join password channel with the wrong password`, async () => {
    currentUserId = 62;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
          joinChannel(id: $id, password: $password)
        }`,
        variables: { id: 2, password: "test" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Password is incorrect");

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: 2,
          userId: currentUserId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`can create a new channel`, async () => {
    currentUserId = 60;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($inviteOnly: Boolean!, $password: String, $name: String!) {
          createChannel(inviteOnly: $inviteOnly, password: $password, name: $name)
        }`,
        variables: { inviteOnly: false, password: null, name: "test" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.createChannel).toBe(true);

    const channel = await prisma.channel.findFirst({
      where: {
        name: "test",
      },
    });
    expect(channel).not.toBeNull();
    expect(channel).toMatchObject({
      inviteOnly: false,
      name: "test",
      ownerId: 60,
      password: null,
    });
  });

  it(`can create a new private password channel`, async () => {
    currentUserId = 60;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($inviteOnly: Boolean!, $password: String, $name: String!) {
          createChannel(inviteOnly: $inviteOnly, password: $password, name: $name)
        }`,
        variables: {
          inviteOnly: true,
          password: "hello",
          name: "test_password",
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.createChannel).toBe(true);

    const channel = await prisma.channel.findFirst({
      where: {
        name: "test_password",
      },
    });
    expect(channel).not.toBeNull();
    expect(channel).toMatchObject({
      inviteOnly: true,
      name: "test_password",
      ownerId: 60,
    });
    expect(channel?.password).not.toBeNull();
    expect(bcrypt.compareSync("hello", channel?.password ?? "")).toBe(true);
  });

  // it(`can leave channel`, async () => {});

  // it(`can leave channel as owner`, async () => {});

  // it(`can leave channel as owner and last member`, async () => {});

  // it(`cannot leave channel if not a member`, async () => {});

  // it(`can delete channel as owner`, async () => {});

  // it(`cannot delete channel if not owner`, async () => {});

  it(`can update password as owner`, async () => {
    currentUserId = 2;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
        updatePassword(id: $id, password: $password)
      }`,
        variables: {
          id: 2,
          password: "hello",
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.updatePassword).toBe(true);

    const channel = await prisma.channel.findUnique({
      where: {
        id: 2,
      },
    });
    expect(bcrypt.compareSync("hello", channel?.password ?? "")).toBe(true);
  });

  it(`cannot update password if member`, async () => {
    currentUserId = 11;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
        updatePassword(id: $id, password: $password)
      }`,
        variables: {
          id: 2,
          password: "hello",
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Forbidden resource");

    const channel = await prisma.channel.findUnique({
      where: {
        id: 2,
      },
    });
    expect(bcrypt.compareSync("hello", channel?.password ?? "")).toBe(true);
  });

  it(`cannot update password if not member`, async () => {
    currentUserId = 80;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
        updatePassword(id: $id, password: $password)
      }`,
        variables: {
          id: 2,
          password: "hello",
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Forbidden resource");

    const channel = await prisma.channel.findUnique({
      where: {
        id: 2,
      },
    });
    expect(bcrypt.compareSync("hello", channel?.password ?? "")).toBe(true);
  });

  it(`cannot update password if admin`, async () => {
    currentUserId = 3;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
        updatePassword(id: $id, password: $password)
      }`,
        variables: {
          id: 2,
          password: "hello",
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Forbidden resource");

    const channel = await prisma.channel.findUnique({
      where: {
        id: 2,
      },
    });
    expect(bcrypt.compareSync("hello", channel?.password ?? "")).toBe(true);
  });

  // it(`can add admin as owner`, async () => {});

  // it(`can remove admin as owner`, async () => {});

  // it(`cannot add admin if not owner`, async () => {});

  // it(`cannot remove admin if not owner`, async () => {});

  // it(`can invite user to channel if owner/admin`, async () => {});

  // it(`cannot invite user to channel if user is banned`, async () => {});

  // it(`cannot invite user to channel if user is member`, async () => {});

  // it(`can mute user if owner/admin`, async () => {});

  // it(`can mute admin user if owner`, async () => {});

  // it(`cannot mute if user is not member`, async () => {});

  // it(`cannot mute admin user if admin`, async () => {});

  // it(`cannot mute user if not owner/admin`, async () => {});

  // it(`can unmute user if owner/admin`, async () => {});

  // it(`can unmute admin user if owner`, async () => {});

  // it(`cannot unmute admin user if admin`, async () => {});

  // it(`cannot unmute user if not owner/admin`, async () => {});

  // it(`cannot umute user is not muted`, async () => {});

  // it(`can ban user if owner/admin`, async () => {});

  // it(`can ban admin user if owner`, async () => {});

  // it(`cannot ban if user is not member`, async () => {});

  // it(`cannot ban admin user if admin`, async () => {});

  // it(`cannot ban user if not owner/admin`, async () => {});

  // it(`can unban user if owner/admin`, async () => {});

  // it(`can unban admin user if owner`, async () => {});

  // it(`cannot unban admin user if admin`, async () => {});

  // it(`cannot unban user if not owner/admin`, async () => {});

  // it(`cannot unban user is not banned`, async () => {});

  // it(`can send message if member`, async () => {});

  // it(`cannot send message if not member`, async () => {});

  // it(`cannot send message muted`, async () => {});
});
