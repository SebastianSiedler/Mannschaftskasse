import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { db, saisons, spielereinsaetze } from '@/lib/db';

export const listStatsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAuth();
    const [allSaisons, allPlayers] = await Promise.all([
      db.query.saisons.findMany({
        columns: {
          id: true,
          name: true,
          latest: true,
        },
        orderBy: [desc(saisons.name)],
      }),
      db.query.spieler.findMany({
        columns: {
          id: true,
          names: true,
          active: true,
        },
        with: {
          spielereinsaetze: {
            columns: {
              tore: true,
              bezahlt: true,
              gelbeKarte: true,
              roteKarte: true,
              spielId: true,
              spielerId: true,
            },
            with: {
              Spiel: {
                columns: {
                  id: true,
                  saisonId: true,
                },
                with: {
                  opponent: {
                    columns: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return allSaisons.map((saison) => {
      const saisonPlayers = allPlayers
        .map((player) => ({
          ...player,
          spielereinsaetze: player.spielereinsaetze.filter(
            (einsatz) => einsatz.Spiel.saisonId === saison.id,
          ),
        }))
        .filter((player) => player.spielereinsaetze.length > 0);

      return {
        saison,
        saison_stats: saisonPlayers
          .map((player) => {
            const schulden = player.spielereinsaetze.reduce((prev, curr) => {
              return (prev += curr.bezahlt ? 0 : 5);
            }, 0);

            const tore = player.spielereinsaetze.reduce((acc, curr) => {
              return (acc += curr.tore);
            }, 0);

            const anz_spiele = player.spielereinsaetze.length;

            return {
              schulden,
              anz_spiele,
              tore,
              name: player.names[0],
              playerId: player.id,
              ...player,
            };
          })
          .sort((a, b) => b.schulden - a.schulden),
      };
    });
  },
);

export const clearDebtsFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      spielerId: z.string(),
      spielIds: z.string().array().optional(),
    }),
  )
  .handler(async ({ data: input }) => {
    await requireAdmin();
    const whereCondition =
      input.spielIds && input.spielIds.length > 0
        ? and(
            eq(spielereinsaetze.spielerId, input.spielerId),
            inArray(spielereinsaetze.spielId, input.spielIds),
          )
        : eq(spielereinsaetze.spielerId, input.spielerId);

    await db
      .update(spielereinsaetze)
      .set({
        bezahlt: true,
      })
      .where(whereCondition);
  });

export type StatsListOutput = Awaited<ReturnType<typeof listStatsFn>>;

export const statsListQueryOptions = () =>
  queryOptions({
    queryKey: ['stats', 'list'] as const,
    queryFn: () => listStatsFn(),
  });
