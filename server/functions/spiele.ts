import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { serverEnv } from '@/env/server';
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

    const bfvMatches = (latestSaison.bfvData as any)?.matches ?? [];

    return matches.map((match) => {
      const recordedGoals = match.spielereinsaetze.reduce(
        (sum, e) => sum + e.tore,
        0,
      );

      let bfvOwnGoals: number | null = null;
      const bfvMatch = bfvMatches.find(
        (bm: any) => bm.matchId === match.bfvMatchId,
      );

      if (
        bfvMatch &&
        typeof bfvMatch.result === 'string' &&
        bfvMatch.result.includes(':')
      ) {
        const parts = bfvMatch.result.split(' ')[0].split(':');
        const homeScore = Number.parseInt(parts[0], 10);
        const guestScore = Number.parseInt(parts[1], 10);
        if (!Number.isNaN(homeScore) && !Number.isNaN(guestScore)) {
          const home =
            bfvMatch.homeTeamPermanentId === serverEnv.BFV_PERMANENT_TEAM_ID;
          bfvOwnGoals = home ? homeScore : guestScore;
        }
      } else if (match.result?.includes(':')) {
        const parts = match.result.split(' ')[0].split(':');
        const scoreA = Number.parseInt(parts[0], 10);
        const scoreB = Number.parseInt(parts[1], 10);
        if (!Number.isNaN(scoreA) && !Number.isNaN(scoreB)) {
          if (match.resultType === 'UNENTSCHIEDEN') {
            bfvOwnGoals = scoreA;
          } else if (match.resultType === 'GEWONNEN') {
            bfvOwnGoals = Math.max(scoreA, scoreB);
          } else if (match.resultType === 'VERLOREN') {
            bfvOwnGoals = Math.min(scoreA, scoreB);
          }
        }
      }

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

    let bfvOwnGoals: number | null = null;
    let bfvOpponentGoals: number | null = null;
    let isHome: boolean | null = null;

    const bfvMatch = (spiel.saison?.bfvData as any)?.matches?.find(
      (m: any) => m.matchId === spiel.bfvMatchId,
    );

    if (
      bfvMatch &&
      typeof bfvMatch.result === 'string' &&
      bfvMatch.result.includes(':')
    ) {
      const parts = bfvMatch.result.split(' ')[0].split(':');
      const homeScore = Number.parseInt(parts[0], 10);
      const guestScore = Number.parseInt(parts[1], 10);
      if (!Number.isNaN(homeScore) && !Number.isNaN(guestScore)) {
        const home =
          bfvMatch.homeTeamPermanentId === serverEnv.BFV_PERMANENT_TEAM_ID;
        isHome = home;
        bfvOwnGoals = home ? homeScore : guestScore;
        bfvOpponentGoals = home ? guestScore : homeScore;
      }
    } else if (spiel.result?.includes(':')) {
      const parts = spiel.result.split(' ')[0].split(':');
      const scoreA = Number.parseInt(parts[0], 10);
      const scoreB = Number.parseInt(parts[1], 10);
      if (!Number.isNaN(scoreA) && !Number.isNaN(scoreB)) {
        if (spiel.resultType === 'UNENTSCHIEDEN') {
          bfvOwnGoals = scoreA;
          bfvOpponentGoals = scoreB;
        } else if (spiel.resultType === 'GEWONNEN') {
          bfvOwnGoals = Math.max(scoreA, scoreB);
          bfvOpponentGoals = Math.min(scoreA, scoreB);
        } else if (spiel.resultType === 'VERLOREN') {
          bfvOwnGoals = Math.min(scoreA, scoreB);
          bfvOpponentGoals = Math.max(scoreA, scoreB);
        }
      }
    }

    return {
      ...spiel,
      bfvOwnGoals,
      bfvOpponentGoals,
      isHome,
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
