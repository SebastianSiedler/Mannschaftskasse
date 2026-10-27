import { isDeepStrictEqual } from 'node:util';
import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { bfvApi } from 'bfv-api';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { serverEnv } from '@/env/server';
import { db, saisons, spiele } from '@/lib/db';
import { updateMatches } from '@/server/routers/spiele/utils/updateMatches';

export const updateMatchesFn = createServerFn({ method: 'GET' })
  .validator(
    z
      .object({
        force: z.boolean().optional(),
      })
      .optional(),
  )
  .handler(async ({ data: input }) => {
    const saison = await db.query.saisons.findFirst({
      where: eq(saisons.latest, true),
    });

    if (!saison) {
      await updateMatches();
      return 'first RQ';
    }

    const { BFV_PERMANENT_TEAM_ID } = serverEnv;

    const { data } = await bfvApi.listMatches({
      params: { teamPermanentId: BFV_PERMANENT_TEAM_ID },
    });

    if (!isDeepStrictEqual(saison?.bfvData, data) || input?.force) {
      await updateMatches();
      return 'data changed';
    }

    return 'Nothing to update';
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
