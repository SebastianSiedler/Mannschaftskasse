import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, saisons, spiele } from '@/lib/db';
import { syncMatchesWithBfv } from '@/server/routers/spiele/utils/updateMatches';

export const updateMatchesFn = createServerFn({ method: 'GET' })
  .validator(
    z
      .object({
        force: z.boolean().optional(),
      })
      .optional(),
  )
  .handler(async ({ data: input }) => {
    return await syncMatchesWithBfv({ force: input?.force });
  });

export const listSpieleFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const latestSaison = await db.query.saisons.findFirst({
      where: eq(saisons.latest, true),
      columns: { id: true },
    });

    if (!latestSaison) {
      return [];
    }

    const matches = await db.query.spiele.findMany({
      where: eq(spiele.saisonId, latestSaison.id),
      with: {
        opponent: true,
        Saison: true,
      },
      orderBy: [asc(spiele.kickoffDate)],
    });

    return matches;
  },
);

export const getSpielDetailFn = createServerFn({ method: 'GET' })
  .validator(z.object({ spielId: z.string() }))
  .handler(async ({ data: input }) => {
    const spiel = await db.query.spiele.findFirst({
      where: eq(spiele.id, input.spielId),
      with: {
        opponent: true,
      },
    });

    return spiel ?? null;
  });

export const spieleListQueryOptions = () =>
  queryOptions({
    queryKey: ['spiele', 'list'] as const,
    queryFn: () => listSpieleFn(),
  });

export const spielDetailQueryOptions = (spielId: string) =>
  queryOptions({
    queryKey: ['spiele', 'detail', spielId] as const,
    queryFn: () => getSpielDetailFn({ data: { spielId } }),
  });
