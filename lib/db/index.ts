import { serverEnv } from '@/env/server';
import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';

export type Database = LibSQLDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  client?: Client;
  db?: Database;
};

export const client: Client =
  globalForDb.client ??
  createClient({
    url: serverEnv.TURSO_DATABASE_URL,
    authToken: serverEnv.TURSO_AUTH_TOKEN || undefined,
  });

export const db: Database =
  globalForDb.db ??
  drizzle(client, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client;
  globalForDb.db = db;
}

export * from './schema';
