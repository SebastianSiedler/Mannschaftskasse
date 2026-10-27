import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { spieler } from './schema';

const url =
  process.env.TURSO_DATABASE_URL ||
  (process.env.DATABASE_URL?.startsWith('libsql:') ||
  process.env.DATABASE_URL?.startsWith('file:')
    ? process.env.DATABASE_URL
    : 'file:local.db');

const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const db = drizzle(client);

const main = async () => {
  await db.insert(spieler).values([
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
  ]);
  console.log('Seed completed successfully.');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
