import { faker } from "@faker-js/faker";
import {
  PrismaClient,
  Achievement,
  ChannelRole,
  ChannelRestriction,
  GameMode,
  ImageFileType,
} from "@prisma/client";
import { hashSync } from "bcrypt";
import { createCanvas } from "canvas";

const generateAvatar = (userId: number) => {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // user id
  const x = canvas.width / 2;
  const y = canvas.height / 2;
  ctx.fillStyle = "white";
  ctx.font = "100px sans";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(userId.toString(), x, y);

  return canvas.toBuffer("image/png");
};

const prisma = new PrismaClient();
const now = new Date();

try {
  (async () => {
    console.log("CREATE USERS");
    await prisma.user.createMany({
      // create 100 users (1 - 100)
      data: [...Array(100)].map((_, i) => ({
        id: i + 1,
        name: `${faker.name.fullName()} - ${i + 1}`,
        rank: i % 11,
      })),
    });

    console.log("ADD AVATARS");
    await prisma.avatar.createMany({
      // generate avatar for each user
      data: [...Array(100)].map((_, i) => ({
        userId: i + 1,
        image: generateAvatar(i + 1),
        fileType: ImageFileType.PNG,
      })),
    });

    await console.log("ADD ACHIEVEMENTS");
    await prisma.userAchievement.createMany({
      data: [
        // give user 1 all achievements
        ...Object.keys(Achievement).map((achievement) => ({
          achievement: achievement as Achievement,
          userId: 1,
        })),
        // give each achievement to a different user (starting at user 2)
        ...Object.keys(Achievement).map((achievement, i) => ({
          achievement: achievement as Achievement,
          userId: i + 2,
        })),
      ],
    });

    await console.log("CREATE FRIENDSHIPS");
    await prisma.friendRequest.createMany({
      data: [
        // user 1 and 2 are friends
        {
          senderId: 1,
          receiverId: 2,
        },
        {
          senderId: 2,
          receiverId: 1,
        },
        // user 1 and 3 are friends
        {
          senderId: 1,
          receiverId: 3,
        },
        {
          senderId: 3,
          receiverId: 1,
        },
        // user 1 has sent a friend request to user 4
        {
          senderId: 1,
          receiverId: 4,
        },
        // user 1 has received a friend request from user 5
        {
          senderId: 5,
          receiverId: 1,
        },
        // user 2 is friends with users 3 to 20
        ...[...Array(18)].map((_, i) => ({
          senderId: 2,
          receiverId: i + 3,
        })),
        ...[...Array(18)].map((_, i) => ({
          senderId: i + 3,
          receiverId: 2,
        })),
        // user 3 has received a friend request from user 4 to 20
        ...[...Array(17)].map((_, i) => ({
          senderId: i + 4,
          receiverId: 3,
        })),
      ],
    });

    console.log("CREATE BLOCKED USERS");
    await prisma.userBlock.createMany({
      data: [
        // user 1 and 6 are blocking each other
        {
          blockerId: 1,
          blockeeId: 6,
        },
        {
          blockerId: 6,
          blockeeId: 1,
        },
        // user 1 is blocking user 7
        {
          blockerId: 1,
          blockeeId: 7,
        },
        // user 1 blocked by user 8
        {
          blockerId: 8,
          blockeeId: 1,
        },
      ],
    });

    console.log("CREATE DIRECT MESSAGES");
    await prisma.directMessage.createMany({
      // user 1 and 2 have sent each other 100 direct messages
      data: [
        ...[...Array(100)].map((_, i) => ({
          authorId: 1,
          recipientId: 2,
          sentAt: new Date(now.valueOf() + i * 60000),
          content: faker.lorem.text(),
        })),
        ...[...Array(100)].map((_, i) => ({
          authorId: 2,
          recipientId: 1,
          sentAt: new Date(now.valueOf() + i * 60000),
          content: faker.lorem.text(),
        })),
      ],
    });

    console.log("CREATE CHANNELS");
    await prisma.channel.createMany({
      data: [
        // channel 1 is public & owned by user 1
        {
          name: "Public Channel",
          ownerId: 1,
        },
        // channel 2 is password protected & owned by user 2
        {
          name: "Password Channel",
          ownerId: 2,
          password: hashSync("password", 10),
        },
        // channel 3 is private & owned by user 3
        {
          name: "Password Channel",
          ownerId: 3,
          inviteOnly: true,
        },
      ],
    });

    console.log("ADD CHANNEL ADMINS");
    await prisma.channelMember.createMany({
      data: [
        // user 1 is an admin of channel 3
        {
          channelId: 3,
          userId: 1,
          role: ChannelRole.ADMIN,
        },
        // user 2 to 10 are admins of channel 1
        ...[...Array(9)].map((_, i) => ({
          channelId: 1,
          userId: i + 2,
          role: ChannelRole.ADMIN,
        })),
        // user 3 to 10 are admins of channel 2
        ...[...Array(8)].map((_, i) => ({
          channelId: 2,
          userId: i + 3,
          role: ChannelRole.ADMIN,
        })),
      ],
    });

    console.log("ADD CHANNEL MEMBERS");
    await prisma.channelMember.createMany({
      data: [
        // users 11 to 80 are members of channel 1
        ...[...Array(70)].map((_, i) => ({
          channelId: 1,
          userId: i + 11,
        })),
        // users 11 to 20 are members of channel 2
        ...[...Array(10)].map((_, i) => ({
          channelId: 2,
          userId: i + 11,
        })),
        // users 11 to 20 are members of channel 3
        ...[...Array(10)].map((_, i) => ({
          channelId: 3,
          userId: i + 11,
        })),
      ],
    });

    console.log("ADD CHANNEL RESTRICTED USERS");
    await prisma.channelRestrictedUser.createMany({
      data: [
        // user 1 is muted in channel 3
        {
          channelId: 3,
          userId: 1,
          restriction: ChannelRestriction.MUTE,
        },
        // user 1 used to be banned in channel 2
        {
          channelId: 2,
          userId: 1,
          restriction: ChannelRestriction.MUTE,
          endAt: new Date(),
        },
        // user 2 is muted in channel 1 for 7 days
        {
          channelId: 1,
          userId: 2,
          restriction: ChannelRestriction.MUTE,
          endAt: new Date(now.valueOf() + 7 * 24 * 60 * 60 * 1000),
        },
        // user 30 to 50 are muted in channel 1
        ...[...Array(21)].map((_, i) => ({
          channelId: 1,
          userId: i + 30,
          restriction: ChannelRestriction.MUTE,
        })),
        // user 60 to 80 are banned in channel 1
        ...[...Array(21)].map((_, i) => ({
          channelId: 1,
          userId: i + 60,
          restriction: ChannelRestriction.BAN,
        })),
        // user 30 to 50 are banned in channel 2
        ...[...Array(21)].map((_, i) => ({
          channelId: 2,
          userId: i + 30,
          restriction: ChannelRestriction.BAN,
        })),
      ],
    });

    console.log("CREATE CHANNEL MESSAGES");
    await prisma.channelMessage.createMany({
      // user 1 to 10 have sent 100 messages in channel 1
      data: [...Array(10)]
        .map((_, i) =>
          [...Array(100)].map((_, j) => ({
            channelId: 1,
            authorId: i + 1,
            content: faker.lorem.text(),
            sentAt: new Date(now.valueOf() + (i + j) * 60000),
          }))
        )
        .flat(1),
    });

    console.log("CREATE GAMES");
    GameMode.RANDOM;
    await prisma.game.createMany({
      data: [
        // user 1 played 1 CLASSIC game with user 2 to 10
        ...[...Array(9)].map((_, i) => ({
          mode: GameMode.CLASSIC,
          player1Id: 1,
          player2Id: i + 2,
          player1Score: Math.floor(Math.random() * 50),
          player2Score: Math.floor(Math.random() * 50),
        })),
        // user 1 played 1 SPEED game with user 2 to 10
        ...[...Array(9)].map((_, i) => ({
          mode: GameMode.SPEED,
          player1Id: i + 2,
          player2Id: 1,
          player1Score: Math.floor(Math.random() * 50),
          player2Score: Math.floor(Math.random() * 50),
        })),
        // user 1 played 1 RANDOM game with user 2 to 10
        ...[...Array(9)].map((_, i) => ({
          mode: GameMode.RANDOM,
          player1Id: 1,
          player2Id: i + 2,
          player1Score: Math.floor(Math.random() * 50),
          player2Score: Math.floor(Math.random() * 50),
        })),
      ],
    });

    await prisma.$disconnect();
  })();
} catch (error) {
  console.error(error);
  prisma.$disconnect().finally(() => process.exit(1));
}
