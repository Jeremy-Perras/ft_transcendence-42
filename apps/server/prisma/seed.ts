import { PrismaClient } from "@prisma/client";
import { GameModes } from "@shared/game";

const prisma = new PrismaClient();

async function main() {
  GameModes.forEach(async (mode) => {
    await prisma.gameMode.create({
      data: {
        name: mode.name,
      },
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
