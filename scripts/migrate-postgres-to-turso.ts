import 'dotenv/config';
import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { Client as PgClient } from 'pg';
import * as schema from '../lib/db/schema';

const postgresUrl =
  process.env.POSTGRES_URL ||
  process.env.DIRECT_URL ||
  (process.env.DATABASE_URL?.startsWith('postgres')
    ? process.env.DATABASE_URL
    : undefined);

const tursoUrl = process.env.TURSO_DATABASE_URL || 'file:local.db';
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || undefined;

async function ensureSqliteSchema(
  tursoClient: ReturnType<typeof createClient>,
) {
  await tursoClient.executeMultiple(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text,
      "email" text UNIQUE,
      "emailVerified" integer,
      "image" text,
      "role" text DEFAULT 'USER' NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "Account" (
      "id" text PRIMARY KEY NOT NULL,
      "userId" text NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "type" text NOT NULL,
      "provider" text NOT NULL,
      "providerAccountId" text NOT NULL,
      "refresh_token" text,
      "refresh_token_expires_in" integer,
      "access_token" text,
      "expires_at" integer,
      "token_type" text,
      "scope" text,
      "id_token" text,
      "session_state" text,
      "oauth_token_secret" text,
      "oauth_token" text
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account" ("provider", "providerAccountId");
    CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account" ("userId");

    CREATE TABLE IF NOT EXISTS "Session" (
      "id" text PRIMARY KEY NOT NULL,
      "sessionToken" text NOT NULL UNIQUE,
      "userId" text NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "expires" integer NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session" ("userId");

    CREATE TABLE IF NOT EXISTS "VerificationToken" (
      "identifier" text NOT NULL,
      "token" text NOT NULL UNIQUE,
      "expires" integer NOT NULL,
      PRIMARY KEY("identifier", "token")
    );

    CREATE TABLE IF NOT EXISTS "Team" (
      "id" text PRIMARY KEY NOT NULL,
      "bfvTeamPermanentId" text NOT NULL UNIQUE,
      "bfvClubId" text NOT NULL,
      "name" text NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "Team_bfvClubId_bfvTeamPermanentId_name_idx" ON "Team" ("bfvClubId", "bfvTeamPermanentId", "name");

    CREATE TABLE IF NOT EXISTS "Saison" (
      "id" text PRIMARY KEY NOT NULL,
      "bfvCompoundID" text NOT NULL UNIQUE,
      "name" text NOT NULL,
      "latest" integer DEFAULT 0 NOT NULL,
      "bfvData" text,
      "currentSpielId" text UNIQUE
    );

    CREATE TABLE IF NOT EXISTS "Spiel" (
      "id" text PRIMARY KEY NOT NULL,
      "saisonId" text NOT NULL REFERENCES "Saison"("id") ON DELETE CASCADE,
      "bfvMatchId" text NOT NULL UNIQUE,
      "kickoffDate" integer NOT NULL,
      "result" text,
      "resultType" text NOT NULL,
      "opponentTeamId" text NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "Spiel_opponentTeamId_idx" ON "Spiel" ("opponentTeamId");
    CREATE INDEX IF NOT EXISTS "Spiel_saisonId_idx" ON "Spiel" ("saisonId");

    CREATE TABLE IF NOT EXISTS "Spieler" (
      "id" text PRIMARY KEY NOT NULL,
      "names" text NOT NULL,
      "active" integer DEFAULT 1 NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "Spieler_active_idx" ON "Spieler" ("active");

    CREATE TABLE IF NOT EXISTS "Spielereinsatz" (
      "tore" integer DEFAULT 0 NOT NULL,
      "bezahlt" integer DEFAULT 0 NOT NULL,
      "gelbeKarte" integer DEFAULT 0 NOT NULL,
      "roteKarte" integer DEFAULT 0 NOT NULL,
      "spielerId" text NOT NULL REFERENCES "Spieler"("id") ON DELETE CASCADE,
      "spielId" text NOT NULL REFERENCES "Spiel"("id") ON DELETE CASCADE,
      PRIMARY KEY("spielerId", "spielId")
    );
    CREATE INDEX IF NOT EXISTS "Spielereinsatz_spielId_idx" ON "Spielereinsatz" ("spielId");
    CREATE INDEX IF NOT EXISTS "Spielereinsatz_spielerId_idx" ON "Spielereinsatz" ("spielerId");
  `);
}

async function migrate() {
  if (!postgresUrl) {
    throw new Error(
      'Missing Postgres connection URL. Set POSTGRES_URL, DIRECT_URL, or DATABASE_URL (starting with postgres://) in .env',
    );
  }

  console.log(`Connecting to Postgres source...`);
  const pg = new PgClient({
    connectionString: postgresUrl,
    ssl: postgresUrl.includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  });
  await pg.connect();

  console.log(`Connecting to Turso/SQLite target (${tursoUrl})...`);
  const tursoClient = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });
  const db = drizzle(tursoClient, { schema });

  try {
    console.log('Ensuring SQLite schema exists on target...');
    await ensureSqliteSchema(tursoClient);

    // 1. Users
    const { rows: pgUsers } = await pg.query('SELECT * FROM "User"');
    if (pgUsers.length > 0) {
      for (const u of pgUsers) {
        await db
          .insert(schema.users)
          .values({
            id: u.id,
            name: u.name,
            email: u.email,
            emailVerified: u.emailVerified ? new Date(u.emailVerified) : null,
            image: u.image,
            role: u.role,
          })
          .onConflictDoUpdate({
            target: schema.users.id,
            set: {
              name: u.name,
              email: u.email,
              emailVerified: u.emailVerified ? new Date(u.emailVerified) : null,
              image: u.image,
              role: u.role,
            },
          });
      }
    }
    console.log(`Migrated ${pgUsers.length} User(s).`);

    // 2. Accounts
    const { rows: pgAccounts } = await pg.query('SELECT * FROM "Account"');
    if (pgAccounts.length > 0) {
      for (const a of pgAccounts) {
        await db
          .insert(schema.accounts)
          .values({
            id: a.id,
            userId: a.userId,
            type: a.type,
            provider: a.provider,
            providerAccountId: a.providerAccountId,
            refresh_token: a.refresh_token,
            refresh_token_expires_in: a.refresh_token_expires_in,
            access_token: a.access_token,
            expires_at: a.expires_at,
            token_type: a.token_type,
            scope: a.scope,
            id_token: a.id_token,
            session_state: a.session_state,
            oauth_token_secret: a.oauth_token_secret,
            oauth_token: a.oauth_token,
          })
          .onConflictDoNothing();
      }
    }
    console.log(`Migrated ${pgAccounts.length} Account(s).`);

    // 3. Sessions
    const { rows: pgSessions } = await pg.query('SELECT * FROM "Session"');
    if (pgSessions.length > 0) {
      for (const s of pgSessions) {
        await db
          .insert(schema.sessions)
          .values({
            id: s.id,
            sessionToken: s.sessionToken,
            userId: s.userId,
            expires: new Date(s.expires),
          })
          .onConflictDoNothing();
      }
    }
    console.log(`Migrated ${pgSessions.length} Session(s).`);

    // 4. Teams
    const { rows: pgTeams } = await pg.query('SELECT * FROM "Team"');
    if (pgTeams.length > 0) {
      for (const t of pgTeams) {
        await db
          .insert(schema.teams)
          .values({
            id: t.id,
            bfvTeamPermanentId: t.bfvTeamPermanentId,
            bfvClubId: t.bfvClubId,
            name: t.name,
          })
          .onConflictDoUpdate({
            target: schema.teams.id,
            set: {
              bfvTeamPermanentId: t.bfvTeamPermanentId,
              bfvClubId: t.bfvClubId,
              name: t.name,
            },
          });
      }
    }
    console.log(`Migrated ${pgTeams.length} Team(s).`);

    // 5. Spieler
    const { rows: pgSpieler } = await pg.query('SELECT * FROM "Spieler"');
    if (pgSpieler.length > 0) {
      for (const sp of pgSpieler) {
        await db
          .insert(schema.spieler)
          .values({
            id: sp.id,
            names: Array.isArray(sp.names) ? sp.names : [],
            active: Boolean(sp.active),
          })
          .onConflictDoUpdate({
            target: schema.spieler.id,
            set: {
              names: Array.isArray(sp.names) ? sp.names : [],
              active: Boolean(sp.active),
            },
          });
      }
    }
    console.log(`Migrated ${pgSpieler.length} Spieler.`);

    // 6. Saisons (insert without currentSpielId first, then update after Spiele are inserted)
    const { rows: pgSaisons } = await pg.query('SELECT * FROM "Saison"');
    if (pgSaisons.length > 0) {
      for (const s of pgSaisons) {
        await db
          .insert(schema.saisons)
          .values({
            id: s.id,
            bfvCompoundID: s.bfvCompoundID,
            name: s.name,
            latest: Boolean(s.latest),
            bfvData: s.bfvData ?? null,
            currentSpielId: null,
          })
          .onConflictDoUpdate({
            target: schema.saisons.id,
            set: {
              bfvCompoundID: s.bfvCompoundID,
              name: s.name,
              latest: Boolean(s.latest),
              bfvData: s.bfvData ?? null,
            },
          });
      }
    }
    console.log(`Migrated ${pgSaisons.length} Saison(s).`);

    // 7. Spiele
    const { rows: pgSpiele } = await pg.query('SELECT * FROM "Spiel"');
    if (pgSpiele.length > 0) {
      for (const m of pgSpiele) {
        await db
          .insert(schema.spiele)
          .values({
            id: m.id,
            saisonId: m.saisonId,
            bfvMatchId: m.bfvMatchId,
            kickoffDate: new Date(m.kickoffDate),
            result: m.result,
            resultType: m.resultType,
            opponentTeamId: m.opponentTeamId,
          })
          .onConflictDoUpdate({
            target: schema.spiele.id,
            set: {
              saisonId: m.saisonId,
              bfvMatchId: m.bfvMatchId,
              kickoffDate: new Date(m.kickoffDate),
              result: m.result,
              resultType: m.resultType,
              opponentTeamId: m.opponentTeamId,
            },
          });
      }
    }
    console.log(`Migrated ${pgSpiele.length} Spiel(e).`);

    // Restore Saison.currentSpielId
    for (const s of pgSaisons) {
      if (s.currentSpielId) {
        await db
          .update(schema.saisons)
          .set({ currentSpielId: s.currentSpielId })
          .where(eq(schema.saisons.id, s.id));
      }
    }

    // 8. Spielereinsaetze
    const { rows: pgEinsaetze } = await pg.query(
      'SELECT * FROM "Spielereinsatz"',
    );
    if (pgEinsaetze.length > 0) {
      for (const e of pgEinsaetze) {
        await db
          .insert(schema.spielereinsaetze)
          .values({
            tore: Number(e.tore),
            bezahlt: Boolean(e.bezahlt),
            gelbeKarte: Number(e.gelbeKarte),
            roteKarte: Number(e.roteKarte),
            spielerId: e.spielerId,
            spielId: e.spielId,
          })
          .onConflictDoUpdate({
            target: [
              schema.spielereinsaetze.spielerId,
              schema.spielereinsaetze.spielId,
            ],
            set: {
              tore: Number(e.tore),
              bezahlt: Boolean(e.bezahlt),
              gelbeKarte: Number(e.gelbeKarte),
              roteKarte: Number(e.roteKarte),
            },
          });
      }
    }
    console.log(`Migrated ${pgEinsaetze.length} Spielereinsatz record(s).`);

    console.log('Migration from Postgres to Turso SQLite completed!');
  } finally {
    await pg.end();
    tursoClient.close();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
