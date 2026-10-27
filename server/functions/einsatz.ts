import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { db, type Spieler, spieler, spielereinsaetze } from '@/lib/db';

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
    return await db.query.spielereinsaetze.findMany({
      where: eq(spielereinsaetze.spielId, input.spielId),
      with: {
        spieler: true,
      },
      orderBy: [asc(spielereinsaetze.bezahlt)],
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
      .map(({ id, names, active }) => ({ id, names, active }));
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
    const unknown_players: string[] = [];
    const played_players: Spieler[] = [];

    const all_players = await db.query.spieler.findMany();

    input.names.forEach((name) => {
      const player = all_players.find((player) => player.names.includes(name));

      if (player) {
        played_players.push(player);
        return;
      }

      unknown_players.push(name);
    });

    if (played_players.length > 0) {
      await db
        .insert(spielereinsaetze)
        .values(
          played_players.map((player) => ({
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
      unknown_players,
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
