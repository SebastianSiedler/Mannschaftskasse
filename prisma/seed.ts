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
        name: 'Sebastian',
        active: true,
      },
      {
        name: 'Christopher',
        active: true,
      },
      {
        name: 'Daniel',
        active: true,
      },
      {
        name: 'René',
        active: true,
      },
      {
        name: 'Johannes',
        active: true,
      },
      {
        name: 'Noah',
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
