import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { db, spieler, spielereinsaetze } from '@/lib/db';
import { matchPlayerList } from './playerImport';

export const updateEinsatzSchema = z.object({
  spielId: z.string(),
  spielerId: z.string(),
  tore: z.number().min(0).optional(),
  gelbeKarte: z.number().min(0).optional(),
  roteKarte: z.number().min(0).optional(),
  bezahlt: z.boolean().optional(),
});

export const listEinsatzFn = createServerFn({ method: 'GET' })
  .validator(z.object({ spielId: z.string() }))
  .handler(async ({ data: input }) => {
    await requireAuth();
    const einsaetze = await db.query.spielereinsaetze.findMany({
      where: eq(spielereinsaetze.spielId, input.spielId),
      with: {
        spieler: true,
      },
      orderBy: [asc(spielereinsaetze.bezahlt)],
    });

    return einsaetze.sort((a, b) => {
      if (a.bezahlt !== b.bezahlt) {
        return Number(a.bezahlt) - Number(b.bezahlt);
      }
      return (a.spieler.names[0] ?? '').localeCompare(
        b.spieler.names[0] ?? '',
        'de',
      );
    });
  });

export const getEinsatzDetailFn = createServerFn({ method: 'GET' })
  .validator(z.object({ spielId: z.string(), spielerId: z.string() }))
  .handler(async ({ data: input }) => {
    await requireAuth();
    const einsatz = await db.query.spielereinsaetze.findFirst({
      where: and(
        eq(spielereinsaetze.spielId, input.spielId),
        eq(spielereinsaetze.spielerId, input.spielerId),
      ),
      with: {
        spieler: true,
      },
    });

    if (!einsatz) {
      throw new Error('Spielereinsatz nicht gefunden');
    }

    return einsatz;
  });

export const listAvailablePlayersFn = createServerFn({ method: 'GET' })
  .validator(z.object({ spielId: z.string() }))
  .handler(async ({ data: input }) => {
    await requireAuth();
    const activePlayers = await db.query.spieler.findMany({
      where: eq(spieler.active, true),
      with: {
        spielereinsaetze: {
          where: eq(spielereinsaetze.spielId, input.spielId),
        },
      },
    });

    return activePlayers
      .filter((p) => p.spielereinsaetze.length === 0)
      .map(({ id, names, active }) => ({ id, names, active }))
      .sort((a, b) => (a.names[0] ?? '').localeCompare(b.names[0] ?? '', 'de'));
  });

export const addByPlayerListFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      names: z.string().array().min(1),
      spielId: z.string(),
    }),
  )
  .handler(async ({ data: input }) => {
    await requireAdmin();

    const all_players = await db.query.spieler.findMany();
    const { matchedPlayers, unknownNames } = matchPlayerList(
      input.names,
      all_players,
    );

    if (matchedPlayers.length > 0) {
      await db
        .insert(spielereinsaetze)
        .values(
          matchedPlayers.map((player) => ({
            tore: 0,
            bezahlt: false,
            gelbeKarte: 0,
            roteKarte: 0,
            spielId: input.spielId,
            spielerId: player.id,
          })),
        )
        .onConflictDoNothing({
          target: [spielereinsaetze.spielerId, spielereinsaetze.spielId],
        });
    }

    return {
      unknown_players: unknownNames,
    };
  });

export const addEinsatzFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      spielId: z.string(),
      spielerId: z.string(),
      tore: z.number().min(0).default(0),
      gelbeKarte: z.number().default(0),
      roteKarte: z.number().default(0),
      bezahlt: z.boolean().default(false),
    }),
  )
  .handler(async ({ data: input }) => {
    await requireAdmin();
    const [created] = await db
      .insert(spielereinsaetze)
      .values(input)
      .returning();
    return created;
  });

export const updateEinsatzFn = createServerFn({ method: 'POST' })
  .validator(updateEinsatzSchema)
  .handler(async ({ data: input }) => {
    await requireAdmin();
    const { spielId, spielerId, ...rest } = input;
    const [updated] = await db
      .update(spielereinsaetze)
      .set(rest)
      .where(
        and(
          eq(spielereinsaetze.spielId, spielId),
          eq(spielereinsaetze.spielerId, spielerId),
        ),
      )
      .returning();
    return updated;
  });

export const removeEinsatzFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      spielId: z.string(),
      spielerId: z.string(),
    }),
  )
  .handler(async ({ data: input }) => {
    await requireAdmin();
    const [deleted] = await db
      .delete(spielereinsaetze)
      .where(
        and(
          eq(spielereinsaetze.spielId, input.spielId),
          eq(spielereinsaetze.spielerId, input.spielerId),
        ),
      )
      .returning();
    return deleted;
  });

export const einsatzListQueryOptions = (spielId: string) =>
  queryOptions({
    queryKey: ['einsatz', 'list', spielId] as const,
    queryFn: () => listEinsatzFn({ data: { spielId } }),
  });

export const einsatzDetailQueryOptions = (spielId: string, spielerId: string) =>
  queryOptions({
    queryKey: ['einsatz', 'detail', spielId, spielerId] as const,
    queryFn: () => getEinsatzDetailFn({ data: { spielId, spielerId } }),
  });

export const availablePlayersQueryOptions = (spielId: string) =>
  queryOptions({
    queryKey: ['einsatz', 'available', spielId] as const,
    queryFn: () => listAvailablePlayersFn({ data: { spielId } }),
  });
