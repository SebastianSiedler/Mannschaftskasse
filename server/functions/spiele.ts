import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { serverEnv } from '@/env/server';
import { db, saisons, spiele } from '@/lib/db';
import { syncMatchesWithBfv } from '@/server/routers/spiele/utils/updateMatches';
import { resolveMatchGoals } from './spiele/matchGoals';

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
    });

    if (!latestSaison) {
      return [];
    }

    const matches = await db.query.spiele.findMany({
      where: eq(spiele.saisonId, latestSaison.id),
      with: {
        opponent: true,
        Saison: true,
        spielereinsaetze: {
          columns: {
            tore: true,
          },
        },
      },
      orderBy: [asc(spiele.kickoffDate)],
    });

    const bfvData = latestSaison.bfvData;

    return matches.map((match) => {
      const recordedGoals = match.spielereinsaetze.reduce(
        (sum, e) => sum + e.tore,
        0,
      );

      const { bfvOwnGoals } = resolveMatchGoals({
        bfvMatchId: match.bfvMatchId,
        bfvData,
        fallbackResult: match.result,
        fallbackResultType: match.resultType,
        permanentTeamId: serverEnv.BFV_PERMANENT_TEAM_ID,
      });

      const hasGoalMismatch =
        typeof bfvOwnGoals === 'number' && recordedGoals !== bfvOwnGoals;

      return {
        ...match,
        recordedGoals,
        bfvOwnGoals,
        hasGoalMismatch,
      };
    });
  },
);

export const getSpielDetailFn = createServerFn({ method: 'GET' })
  .validator(z.object({ spielId: z.string() }))
  .handler(async ({ data: input }) => {
    const spiel = await db.query.spiele.findFirst({
      where: eq(spiele.id, input.spielId),
      with: {
        opponent: true,
        saison: true,
      },
    });

    if (!spiel) {
      return null;
    }

    const goals = resolveMatchGoals({
      bfvMatchId: spiel.bfvMatchId,
      bfvData: spiel.saison?.bfvData,
      fallbackResult: spiel.result,
      fallbackResultType: spiel.resultType,
      permanentTeamId: serverEnv.BFV_PERMANENT_TEAM_ID,
    });

    return {
      ...spiel,
      ...goals,
    };
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
