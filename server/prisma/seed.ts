import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { createWriteStream } from "fs";
import { resolve } from "path";
import { get } from "https";

const prisma = new PrismaClient();

async function main() {
  // game modes
  await prisma.gameMode.create({
    data: {
      name: "Classic",
    },
  });
  await prisma.gameMode.create({
    data: {
      name: "Speed",
    },
  });
  await prisma.gameMode.create({
    data: {
      name: "Random",
    },
  });

  // users
  for (let i = 1; i <= 100; i++) {
    const avatar = faker.image.avatar();
    get(avatar, (res) => {
      const path = resolve(__dirname, "../uploads/avatars", `${i}.jpg`);
      res.pipe(createWriteStream(path));
    });
    await prisma.user.create({
      data: {
        id: i,
        name: faker.name.fullName(),
        avatar: `${i}.jpg`,
        rank: Math.floor(Math.random() * 100),
        achievements: {
          create: [
            {
              icon: "/achievements/LooseMedal.svg",
              name: "Ten defeats serie",
            },
            {
              icon: "/achievements/FirstVictory.svg",
              name: "One victory",
            },
          ],
        },
      },
    });
  }

  // friends
  await prisma.user.update({
    where: {
      id: 1,
    },
    data: {
      friends: {
        connect: [{ id: 2 }, { id: 3 }, { id: 4 }],
      },
    },
  });
  await prisma.user.update({
    where: {
      id: 2,
    },
    data: {
      friends: {
        connect: [{ id: 1 }, { id: 3 }, { id: 4 }],
      },
    },
  });
  await prisma.user.update({
    where: {
      id: 3,
    },
    data: {
      friends: {
        connect: [{ id: 2 }, { id: 4 }],
      },
    },
  });

  // blocks
  await prisma.user.update({
    where: {
      id: 3,
    },
    data: {
      blocking: {
        connect: [{ id: 1 }, { id: 2 }, { id: 4 }],
      },
    },
  });
  await prisma.user.update({
    where: {
      id: 7,
    },
    data: {
      blocking: {
        connect: [{ id: 5 }],
      },
    },
  });

  // public channels
  await prisma.channel.create({
    data: {
      name: faker.lorem.word(),
      inviteOnly: false,
      ownerId: 1,
    },
  });

  // private channels
  await prisma.channel.create({
    data: {
      name: faker.name.jobType(),
      inviteOnly: true,
      ownerId: 2,
    },
  });

  // password protected channels
  await prisma.channel.create({
    data: {
      inviteOnly: false,
      name: faker.name.jobType(),
      password: "password",
      ownerId: 3,
    },
  });

  // channel admins
  await prisma.channel.update({
    where: {
      id: 1,
    },
    data: {
      members: {
        create: [
          {
            isAdministrator: true,
            userId: 2,
          },
          {
            isAdministrator: true,
            userId: 3,
          },
        ],
      },
    },
  });
  await prisma.channel.update({
    where: {
      id: 2,
    },
    data: {
      members: {
        create: [
          {
            isAdministrator: true,
            userId: 1,
          },
          {
            isAdministrator: true,
            userId: 4,
          },
        ],
      },
    },
  });
  await prisma.channel.update({
    where: {
      id: 3,
    },
    data: {
      members: {
        create: [
          {
            isAdministrator: true,
            userId: 4,
          },
          {
            isAdministrator: true,
            userId: 5,
          },
        ],
      },
    },
  });

  // channel members
  for (let i = 10; i < 99; i++) {
    await prisma.channel.update({
      where: {
        id: 1,
      },
      data: {
        members: {
          create: [
            {
              userId: i,
            },
          ],
        },
      },
    });
  }
  await prisma.channel.update({
    where: {
      id: 2,
    },
    data: {
      members: {
        create: [
          {
            userId: 5,
          },
          {
            userId: 6,
          },
          {
            userId: 7,
          },
        ],
      },
    },
  });
  await prisma.channel.update({
    where: {
      id: 3,
    },
    data: {
      members: {
        create: [
          {
            userId: 7,
          },
          {
            userId: 8,
          },
          {
            userId: 9,
          },
        ],
      },
    },
  });

  //muted channel members
  await prisma.mutedMember.create({
    data: { channelId: 1, userId: 6, endAt: new Date() },
  });
  await prisma.mutedMember.create({
    data: { channelId: 2, userId: 7 },
  });

  //banned channel members
  await prisma.bannedMember.create({
    data: { channelId: 1, userId: 8, endAt: new Date() },
  });
  await prisma.bannedMember.create({
    data: { channelId: 2, userId: 9 },
  });

  // channel messages
  for (let i = 0; i < 100; i++) {
    const p1 = Math.floor(Math.random() * 10) + 1;

    const m = await prisma.channelMessage.create({
      data: {
        author: {
          connect: {
            id: p1,
          },
        },
        channel: {
          connect: {
            id: Math.floor(Math.random() * 3) + 1,
          },
        },
        content: faker.lorem.text(),
        sentAt: faker.date.recent(),
      },
    });
    for (let ii = 1; ii <= 50; ii++) {
      if (ii != p1) {
        await prisma.channelMessage.update({
          where: {
            id: m.id,
          },
          data: {
            readBy: {
              create: {
                userId: ii,
                readAt: faker.date.recent(),
              },
            },
          },
        });
      }
    }
  }

  // direct message
  for (let i = 0; i < 100; i++) {
    const p1 = Math.floor(Math.random() * 10) + 1;
    let p2 = Math.floor(Math.random() * 10) + 1;
    if (p1 === p2) p2 = p1 === 10 ? 1 : p1 + 1;

    await prisma.directMessage.create({
      data: {
        author: {
          connect: {
            id: p1,
          },
        },
        recipient: {
          connect: {
            id: p2,
          },
        },
        content: faker.lorem.text(),
        sentAt: faker.date.recent(),
        readAt: p1 % 2 === 0 ? faker.date.soon() : null,
      },
    });
  }

  // games
  for (let i = 1; i <= 10; i++) {
    const p1 = Math.floor(Math.random() * 10) + 1;
    let p2 = Math.floor(Math.random() * 10) + 1;
    if (p1 === p2) p2 = p1 === 10 ? 1 : p1 + 1;

    await prisma.game.create({
      data: {
        mode: {
          connect: {
            id: Math.floor(Math.random() * 3) + 1,
          },
        },
        startedAt: faker.date.recent(),
        finishedAt: faker.date.soon(),
        player1: {
          connect: {
            id: p1,
          },
        },
        player2: {
          connect: {
            id: p2,
          },
        },
        player1Score: Math.floor(Math.random() * 100),
        player2Score: Math.floor(Math.random() * 100),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
