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
                  endAt: m.endAt?.toISOString() ?? null,
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
                  endAt: m.endAt?.toISOString() ?? null,
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

describe("channel", () => {
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
    const channelId = -1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Channel($id: Int!) {
          channel(id: $id) {
            id
          }
        }`,
        variables: { id: channelId },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Channel not found");
  });

  it(`can get channel`, async () => {
    currentUserId = 1;
    const channelId = 1;

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
        variables: { id: channelId },
      });

    expect(response.statusCode).toBe(200);

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      ...prismaChannelArgs,
    });

    expect(response.body.data.channel).toMatchChannel(channel, currentUserId);
  });

  it(`cannot get non existing channel`, async () => {
    currentUserId = 1;
    const channelId = 10;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query Channel($id: Int!) {
          channel(id: $id) {
            id
          }
        }`,
        variables: { id: channelId },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Channel not found");
  });

  it(`cannot access channel info as non member`, async () => {
    currentUserId = 1;
    const channelId = 3;

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
        variables: { id: channelId },
      });

    expect(response.statusCode).toBe(200);

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      ...prismaChannelArgs,
    });

    expect(response.body.data.channel).toMatchChannel(channel, currentUserId);
  });

  it(`can join public channel`, async () => {
    currentUserId = 81;
    const channelId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          joinChannel(id: $id)
        }`,
        variables: { id: channelId },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.joinChannel).toBe(true);

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channelId,
          userId: currentUserId,
        },
      },
    });
    expect(member).not.toBeNull();
  });

  it(`cannot join public channel if banned`, async () => {
    currentUserId = 82;
    const channelId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          joinChannel(id: $id)
        }`,
        variables: { id: channelId },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are banned from this channel"
    );

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channelId,
          userId: currentUserId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`cannot join private channel`, async () => {
    currentUserId = 82;
    const channelId = 3;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          joinChannel(id: $id)
        }`,
        variables: { id: channelId },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("This channel is invite only");

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channelId,
          userId: currentUserId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`can join password channel`, async () => {
    currentUserId = 60;
    const channelId = 2;
    const password = "password";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
          joinChannel(id: $id, password: $password)
        }`,
        variables: { id: channelId, password },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.joinChannel).toBe(true);

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channelId,
          userId: currentUserId,
        },
      },
    });
    expect(member).not.toBeNull();
  });

  it(`cannot join password channel without password`, async () => {
    currentUserId = 61;
    const channelId = 2;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          joinChannel(id: $id)
        }`,
        variables: { id: channelId },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Password is incorrect");

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channelId,
          userId: currentUserId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`cannot join password channel with the wrong password`, async () => {
    currentUserId = 62;
    const channelId = 2;
    const password = "test";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
          joinChannel(id: $id, password: $password)
        }`,
        variables: { id: channelId, password },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Password is incorrect");

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channelId,
          userId: currentUserId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`can create a new channel`, async () => {
    currentUserId = 60;
    const name = "test";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($inviteOnly: Boolean!, $password: String, $name: String!) {
          createChannel(inviteOnly: $inviteOnly, password: $password, name: $name)
        }`,
        variables: { inviteOnly: false, password: null, name },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.createChannel).toBe(true);

    const channel = await prisma.channel.findFirst({
      where: {
        name,
      },
    });
    expect(channel).not.toBeNull();
    expect(channel).toMatchObject({
      inviteOnly: false,
      name,
      ownerId: currentUserId,
      password: null,
    });
  });

  it(`can create a new private password channel`, async () => {
    currentUserId = 60;
    const name = "test_password";
    const password = "hello";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($inviteOnly: Boolean!, $password: String, $name: String!) {
          createChannel(inviteOnly: $inviteOnly, password: $password, name: $name)
        }`,
        variables: {
          inviteOnly: true,
          password,
          name,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.createChannel).toBe(true);

    const channel = await prisma.channel.findFirst({
      where: {
        name,
      },
    });
    expect(channel).not.toBeNull();
    expect(channel).toMatchObject({
      inviteOnly: true,
      name,
      ownerId: 60,
    });
    expect(channel?.password).not.toBeNull();
    expect(bcrypt.compareSync(password, channel?.password ?? "")).toBe(true);
  });

  it(`can leave channel`, async () => {
    currentUserId = 3;
    const channelId = 2;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          leaveChannel(id: $id)
        }`,
        variables: {
          id: channelId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.leaveChannel).toBe(true);

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channelId,
          userId: currentUserId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`can leave channel as owner`, async () => {
    currentUserId = 3;
    const channelId = 3;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          leaveChannel(id: $id)
        }`,
        variables: {
          id: channelId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.leaveChannel).toBe(true);

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: channelId,
          userId: currentUserId,
        },
      },
    });
    expect(member).toBeNull();

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    expect(channel?.ownerId).toBe(1);
  });

  it(`can leave channel as owner and last member`, async () => {
    currentUserId = 60;
    const channelId = 4;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          leaveChannel(id: $id)
        }`,
        variables: {
          id: channelId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.leaveChannel).toBe(true);

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
      },
    });
    expect(channel).toBeNull();
  });

  it(`cannot leave channel if not a member`, async () => {
    currentUserId = 90;
    const channelId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          leaveChannel(id: $id)
        }`,
        variables: {
          id: channelId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are not a member of this channel"
    );
  });

  it(`can delete channel as owner`, async () => {
    currentUserId = 1;
    const channelId = 3;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          deleteChannel(id: $id)
        }`,
        variables: {
          id: channelId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.deleteChannel).toBe(true);

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
      },
    });
    expect(channel).toBeNull();

    const user1 = await prisma.user.findUnique({
      where: {
        id: 1,
      },
      select: {
        ownedChannels: true,
      },
    });
    expect(user1?.ownedChannels.length).toBe(1);

    const user11 = await prisma.user.findUnique({
      where: {
        id: 11,
      },
      select: {
        channels: true,
      },
    });
    expect(user11?.channels.length).toBe(2);
  });

  it(`cannot delete channel if not owner`, async () => {
    currentUserId = 1;
    const channelId = 2;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!) {
          deleteChannel(id: $id)
        }`,
        variables: {
          id: channelId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are not the owner of this channel"
    );

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
      },
    });
    expect(channel).not.toBeNull();
  });

  it(`can update password as owner`, async () => {
    currentUserId = 2;
    const channelId = 2;
    const password = "hello";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
        updatePassword(id: $id, password: $password)
      }`,
        variables: {
          id: channelId,
          password,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.updatePassword).toBe(true);

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    expect(bcrypt.compareSync(password, channel?.password ?? "")).toBe(true);
  });

  it(`cannot update password if member`, async () => {
    currentUserId = 11;
    const channelId = 2;
    const password = "test";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
        updatePassword(id: $id, password: $password)
      }`,
        variables: {
          id: channelId,
          password,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are not the owner of this channel"
    );

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    expect(bcrypt.compareSync(password, channel?.password ?? "")).toBe(false);
  });

  it(`cannot update password if not member`, async () => {
    currentUserId = 80;
    const channelId = 2;
    const password = "test";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
        updatePassword(id: $id, password: $password)
      }`,
        variables: {
          id: channelId,
          password,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are not the owner of this channel"
    );

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    expect(bcrypt.compareSync(password, channel?.password ?? "")).toBe(false);
  });

  it(`cannot update password if admin`, async () => {
    currentUserId = 3;
    const channelId = 2;
    const password = "test";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $password: String!) {
        updatePassword(id: $id, password: $password)
      }`,
        variables: {
          id: channelId,
          password: password,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are not the owner of this channel"
    );

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    expect(bcrypt.compareSync(password, channel?.password ?? "")).toBe(false);
  });

  it(`can add admin as owner`, async () => {
    currentUserId = 1;
    const channelId = 1;
    const userId = 30;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        addAdmin(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.addAdmin).toBe(true);

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
    expect(member?.role).toBe("ADMIN");
  });

  it(`can remove admin as owner`, async () => {
    currentUserId = 1;
    const channelId = 1;
    const userId = 30;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        removeAdmin(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.removeAdmin).toBe(true);

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
    expect(member?.role).toBe("MEMBER");
  });

  it(`cannot remove unexisting admin as owner`, async () => {
    currentUserId = 1;
    const channelId = 1;
    const userId = 85;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        removeAdmin(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("User is not an admin");

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`cannot add admin if not owner`, async () => {
    currentUserId = 2;
    const channelId = 1;
    const userId = 27;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        addAdmin(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are not the owner of this channel"
    );

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
    expect(member?.role).toBe("MEMBER");
  });

  it(`cannot remove admin if not owner`, async () => {
    currentUserId = 2;
    const channelId = 1;
    const userId = 3;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        removeAdmin(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are not the owner of this channel"
    );

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
    expect(member?.role).toBe("ADMIN");
  });

  it(`can invite user to channel if owner`, async () => {
    currentUserId = 2;
    const channelId = 2;
    const userId = 90;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        inviteUser(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.inviteUser).toBe(true);

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
    expect(member).not.toBeNull();
  });

  it(`can invite user to channel`, async () => {
    currentUserId = 11;
    const channelId = 2;
    const userId = 91;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        inviteUser(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.inviteUser).toBe(true);

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
    expect(member).not.toBeNull();
  });

  it(`cannot invite user to channel if is owner`, async () => {
    currentUserId = 11;
    const channelId = 1;
    const userId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        inviteUser(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("User is already a member");

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`cannot invite user to channel if is already member`, async () => {
    currentUserId = 11;
    const channelId = 1;
    const userId = 16;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        inviteUser(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("User is already a member");

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
    expect(member).not.toBeNull();
  });

  it(`cannot invite user to channel if user is banned`, async () => {
    currentUserId = 1;
    const channelId = 1;
    const userId = 84;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        inviteUser(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("User is banned");

    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });
    expect(member).toBeNull();
  });

  it(`can mute member if admin`, async () => {
    currentUserId = 4;
    const channelId = 2;
    const userId = 11;
    const date = new Date();

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!, $restrictUntil: DateTime) {
        muteUser(id: $id, userId: $userId, restrictUntil: $restrictUntil)
      }`,
        variables: {
          id: channelId,
          userId,
          restrictUntil: date,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.muteUser).toBe(true);

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId,
          restriction: "MUTE",
          userId,
        },
      },
    });
    expect(restriction).not.toBeNull();
    expect(restriction?.endAt?.valueOf()).toBe(date.valueOf());
  });

  it(`can mute admin if owner`, async () => {
    currentUserId = 2;
    const channelId = 2;
    const userId = 4;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!, $restrictUntil: DateTime) {
        muteUser(id: $id, userId: $userId, restrictUntil: $restrictUntil)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.muteUser).toBe(true);

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId,
          restriction: "MUTE",
          userId,
        },
      },
    });
    expect(restriction).not.toBeNull();
    expect(restriction?.endAt).toBeNull();
  });

  it(`can update mute`, async () => {
    currentUserId = 5;
    const channelId = 2;
    const userId = 11;
    const date = new Date();

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!, $restrictUntil: DateTime) {
        muteUser(id: $id, userId: $userId, restrictUntil: $restrictUntil)
      }`,
        variables: {
          id: channelId,
          userId,
          restrictUntil: date,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.muteUser).toBe(true);

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId,
          restriction: "MUTE",
          userId,
        },
      },
    });
    expect(restriction).not.toBeNull();
    expect(restriction?.endAt?.valueOf()).toBe(date.valueOf());
  });

  it(`cannot mute owner`, async () => {
    currentUserId = 2;
    const channelId = 2;
    const userId = 2;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!, $restrictUntil: DateTime) {
        muteUser(id: $id, userId: $userId, restrictUntil: $restrictUntil)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have the permission to do that"
    );

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId,
          restriction: "MUTE",
          userId,
        },
      },
    });
    expect(restriction).toBeNull();
  });

  it(`cannot mute admin if admin`, async () => {
    currentUserId = 5;
    const channelId = 2;
    const userId = 6;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!, $restrictUntil: DateTime) {
        muteUser(id: $id, userId: $userId, restrictUntil: $restrictUntil)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have the permission to do that"
    );

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId,
          restriction: "MUTE",
          userId,
        },
      },
    });
    expect(restriction).toBeNull();
  });

  it(`cannot mute member if member`, async () => {
    currentUserId = 13;
    const channelId = 2;
    const userId = 14;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!, $restrictUntil: DateTime) {
        muteUser(id: $id, userId: $userId, restrictUntil: $restrictUntil)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have the permission to do that"
    );

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId,
          restriction: "MUTE",
          userId,
        },
      },
    });
    expect(restriction).toBeNull();
  });

  it(`cannot mute member if not member`, async () => {
    currentUserId = 1;
    const channelId = 2;
    const userId = 14;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!, $restrictUntil: DateTime) {
        muteUser(id: $id, userId: $userId, restrictUntil: $restrictUntil)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You do not have the permission to do that"
    );

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId,
          restriction: "MUTE",
          userId,
        },
      },
    });
    expect(restriction).toBeNull();
  });

  it(`can unmute`, async () => {
    currentUserId = 2;
    const channelId = 2;
    const userId = 4;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        unmuteUser(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.unmuteUser).toBe(true);

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId,
          restriction: "MUTE",
          userId,
        },
      },
    });
    expect(restriction).not.toBeNull();
    expect(restriction?.endAt).not.toBeNull();
  });

  it(`can ban member`, async () => {
    currentUserId = 5;
    const channelId = 2;
    const userId = 16;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!, $restrictUntil: DateTime) {
        banUser(id: $id, userId: $userId, restrictUntil: $restrictUntil)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.banUser).toBe(true);

    const member = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
      },
    });
    expect(member).toBeNull();

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId: 2,
          restriction: "BAN",
          userId: 16,
        },
      },
    });
    expect(restriction).not.toBeNull();
    expect(restriction?.endAt).toBeNull();
  });

  it(`can ban non member`, async () => {
    currentUserId = 5;
    const channelId = 2;
    const userId = 24;
    const date = new Date();

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!, $restrictUntil: DateTime) {
        banUser(id: $id, userId: $userId, restrictUntil: $restrictUntil)
      }`,
        variables: {
          id: channelId,
          userId,
          restrictUntil: date,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.banUser).toBe(true);

    const member = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
      },
    });
    expect(member).toBeNull();

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId,
          restriction: "BAN",
          userId,
        },
      },
    });
    expect(restriction).not.toBeNull();
    expect(restriction?.endAt?.valueOf()).toBe(date.valueOf());
  });

  it(`can update ban`, async () => {
    currentUserId = 5;
    const channelId = 2;
    const userId = 43;
    const date = new Date();

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!, $restrictUntil: DateTime) {
        banUser(id: $id, userId: $userId, restrictUntil: $restrictUntil)
      }`,
        variables: {
          id: channelId,
          userId,
          restrictUntil: date,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.banUser).toBe(true);

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId,
          restriction: "BAN",
          userId,
        },
      },
    });
    expect(restriction).not.toBeNull();
    expect(restriction?.endAt?.valueOf()).toBe(date.valueOf());
  });

  it(`can unban`, async () => {
    currentUserId = 5;
    const channelId = 2;
    const userId = 37;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $userId: Int!) {
        unbanUser(id: $id, userId: $userId)
      }`,
        variables: {
          id: channelId,
          userId,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.unbanUser).toBe(true);

    const restriction = await prisma.channelRestrictedUser.findUnique({
      where: {
        channelId_userId_restriction: {
          channelId,
          restriction: "BAN",
          userId,
        },
      },
    });
    expect(restriction).not.toBeNull();
    expect(restriction?.endAt).not.toBeNull();
  });

  it(`can send message if member`, async () => {
    currentUserId = 11;
    const channelId = 1;
    const message = "hello";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $message: String!) {
        sendChannelMessage(id: $id, message: $message)
      }`,
        variables: {
          id: channelId,
          message,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.sendChannelMessage).toBe(true);

    const m = await prisma.channelMessage.findFirst({
      where: {
        channelId,
        authorId: currentUserId,
      },
      orderBy: {
        sentAt: "desc",
      },
    });
    expect(m).not.toBeNull();
    expect(m?.content).toBe(message);
  });

  it(`cannot send message if not member`, async () => {
    currentUserId = 70;
    const channelId = 2;
    const message = "hello";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $message: String!) {
        sendChannelMessage(id: $id, message: $message)
      }`,
        variables: {
          id: channelId,
          message,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are not a member of this channel"
    );

    const m = await prisma.channelMessage.findFirst({
      where: {
        channelId,
        authorId: currentUserId,
      },
    });
    expect(m).toBeNull();
  });

  it(`cannot send message muted`, async () => {
    currentUserId = 32;
    const channelId = 1;
    const message = "hello";

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $message: String!) {
        sendChannelMessage(id: $id, message: $message)
      }`,
        variables: {
          id: channelId,
          message,
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe(
      "You are muted in this channel"
    );

    const m = await prisma.channelMessage.findFirst({
      where: {
        channelId,
        authorId: currentUserId,
      },
    });
    expect(m).toBeNull();
  });

  it(`cannot send long message`, async () => {
    currentUserId = 12;
    const channelId = 1;

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
        query: `mutation Mutation($id: Int!, $message: String!) {
        sendChannelMessage(id: $id, message: $message)
      }`,
        variables: {
          id: channelId,
          message: genMessage(70000),
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Bad Request Exception");

    const message = await prisma.channelMessage.findFirst({
      where: {
        channelId: channelId,
        authorId: currentUserId,
      },
    });
    expect(message).toBeNull();
  });

  it(`cannot send empty message`, async () => {
    currentUserId = 12;
    const channelId = 1;

    const response = await supertest(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `mutation Mutation($id: Int!, $message: String!) {
        sendChannelMessage(id: $id, message: $message)
      }`,
        variables: {
          id: channelId,
          message: "",
        },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.errors[0].message).toBe("Bad Request Exception");

    const message = await prisma.channelMessage.findFirst({
      where: {
        channelId: channelId,
        authorId: currentUserId,
      },
    });
    expect(message).toBeNull();
  });
});
