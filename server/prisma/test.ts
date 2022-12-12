import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs";

const prisma = new PrismaClient();

(async () => {
  const users = await prisma.user.findMany({});

  users.forEach(async (user) => {
    const buff = user.avatar;
    console.log(`data:image/png;base64,${buff.toString("base64")}`);
    console.log("------------------------");
  });
})();
