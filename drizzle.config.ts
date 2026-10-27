import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const url =
  process.env.TURSO_DATABASE_URL ||
  (process.env.DATABASE_URL?.startsWith('libsql:') ||
  process.env.DATABASE_URL?.startsWith('file:')
    ? process.env.DATABASE_URL
    : 'file:local.db');

const authToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: authToken ? 'turso' : 'sqlite',
  dbCredentials: authToken
    ? {
        url,
        authToken,
      }
    : {
        url,
      },
});
