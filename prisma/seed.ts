/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const main = async () => {
  await prisma.spieler.createMany({
    data: [
      {
        names: ['Sebastian'],
        active: true,
      },
      {
        names: ['Christopher'],
        active: true,
      },
      {
        names: ['Daniel'],
        active: true,
      },
      {
        names: ['René'],
        active: true,
      },
      {
        names: ['Johannes'],
        active: true,
      },
      {
        names: ['Noah'],
        active: true,
      },
    ],
  });
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
