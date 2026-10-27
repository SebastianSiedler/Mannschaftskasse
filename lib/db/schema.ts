import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Result = {
  NICHT_ANGETRETEN: 'NICHT_ANGETRETEN',
  GEWONNEN: 'GEWONNEN',
  VERLOREN: 'VERLOREN',
  UNENTSCHIEDEN: 'UNENTSCHIEDEN',
  AUSSTEHEND: 'AUSSTEHEND',
  NICHT_ANGETRETEN_GEGNER: 'NICHT_ANGETRETEN_GEGNER',
} as const;
export type Result = (typeof Result)[keyof typeof Result];

export const users = sqliteTable('User', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  role: text('role', { enum: ['USER', 'ADMIN'] })
    .notNull()
    .default('USER')
    .$type<Role>(),
});

export const accounts = sqliteTable(
  'Account',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    refresh_token_expires_in: integer('refresh_token_expires_in'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
    oauth_token_secret: text('oauth_token_secret'),
    oauth_token: text('oauth_token'),
  },
  (table) => [
    uniqueIndex('Account_provider_providerAccountId_key').on(
      table.provider,
      table.providerAccountId,
    ),
    index('Account_userId_idx').on(table.userId),
  ],
);

export const sessions = sqliteTable(
  'Session',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    sessionToken: text('sessionToken').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('Session_userId_idx').on(table.userId)],
);

export const verificationTokens = sqliteTable(
  'VerificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

export const teams = sqliteTable(
  'Team',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    bfvTeamPermanentId: text('bfvTeamPermanentId').notNull().unique(),
    bfvClubId: text('bfvClubId').notNull(),
    name: text('name').notNull(),
  },
  (table) => [
    index('Team_bfvClubId_bfvTeamPermanentId_name_idx').on(
      table.bfvClubId,
      table.bfvTeamPermanentId,
      table.name,
    ),
  ],
);

export const saisons = sqliteTable('Saison', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  bfvCompoundID: text('bfvCompoundID').notNull().unique(),
  name: text('name').notNull(),
  latest: integer('latest', { mode: 'boolean' }).notNull().default(false),
  bfvData: text('bfvData', { mode: 'json' }).$type<unknown>(),
  currentSpielId: text('currentSpielId').unique(),
});

export const spiele = sqliteTable(
  'Spiel',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    saisonId: text('saisonId')
      .notNull()
      .references(() => saisons.id, { onDelete: 'cascade' }),
    bfvMatchId: text('bfvMatchId').notNull().unique(),
    kickoffDate: integer('kickoffDate', { mode: 'timestamp_ms' }).notNull(),
    result: text('result'),
    resultType: text('resultType', {
      enum: [
        'NICHT_ANGETRETEN',
        'GEWONNEN',
        'VERLOREN',
        'UNENTSCHIEDEN',
        'AUSSTEHEND',
        'NICHT_ANGETRETEN_GEGNER',
      ],
    })
      .notNull()
      .$type<Result>(),
    opponentTeamId: text('opponentTeamId')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('Spiel_opponentTeamId_idx').on(table.opponentTeamId),
    index('Spiel_saisonId_idx').on(table.saisonId),
  ],
);

export const spieler = sqliteTable(
  'Spieler',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    names: text('names', { mode: 'json' }).$type<string[]>().notNull(),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
  },
  (table) => [index('Spieler_active_idx').on(table.active)],
);

export const spielereinsaetze = sqliteTable(
  'Spielereinsatz',
  {
    tore: integer('tore').notNull().default(0),
    bezahlt: integer('bezahlt', { mode: 'boolean' }).notNull().default(false),
    gelbeKarte: integer('gelbeKarte').notNull().default(0),
    roteKarte: integer('roteKarte').notNull().default(0),
    spielerId: text('spielerId')
      .notNull()
      .references(() => spieler.id, { onDelete: 'cascade' }),
    spielId: text('spielId')
      .notNull()
      .references(() => spiele.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.spielerId, table.spielId] }),
    index('Spielereinsatz_spielId_idx').on(table.spielId),
    index('Spielereinsatz_spielerId_idx').on(table.spielerId),
  ],
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  spiele: many(spiele),
}));

export const saisonsRelations = relations(saisons, ({ one, many }) => ({
  spiel: many(spiele, { relationName: 'saisonSpiele' }),
  currentSpiel: one(spiele, {
    fields: [saisons.currentSpielId],
    references: [spiele.id],
    relationName: 'currentSpiel',
  }),
}));

export const spieleRelations = relations(spiele, ({ one, many }) => ({
  saison: one(saisons, {
    fields: [spiele.saisonId],
    references: [saisons.id],
    relationName: 'saisonSpiele',
  }),
  opponent: one(teams, {
    fields: [spiele.opponentTeamId],
    references: [teams.id],
  }),
  spielereinsaetze: many(spielereinsaetze),
  Saison: many(saisons, { relationName: 'currentSpiel' }),
}));

export const spielerRelations = relations(spieler, ({ many }) => ({
  spielereinsaetze: many(spielereinsaetze),
}));

export const spielereinsaetzeRelations = relations(
  spielereinsaetze,
  ({ one }) => ({
    spieler: one(spieler, {
      fields: [spielereinsaetze.spielerId],
      references: [spieler.id],
    }),
    Spiel: one(spiele, {
      fields: [spielereinsaetze.spielId],
      references: [spiele.id],
    }),
  }),
);

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Saison = typeof saisons.$inferSelect;
export type Spiel = typeof spiele.$inferSelect;
export type Spieler = typeof spieler.$inferSelect;
export type Spielereinsatz = typeof spielereinsaetze.$inferSelect;
export type Team = typeof teams.$inferSelect;
