import { serverEnv } from '@/env/server';
import { saisons, spiele } from '@/lib/db';
import { t } from '@/server/trpc';
import { bfvApi } from 'bfv-api';
import { asc, eq } from 'drizzle-orm';
import isEqual from 'lodash.isequal';
import { z } from 'zod';
import { updateMatches } from './utils/updateMatches';

export const spielRouter = t.router({
  /**
   * Update matches in local DB
   * if an error occours:
   * force update: /api/trpc/spiel.update_matches?input={"json":{"force":true}}
   */
  updateMatches: t.procedure
    .input(
      z.object({
        force: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const saison = await ctx.db.query.saisons.findFirst({
        where: eq(saisons.latest, true),
      });

      /* Passiert nur, wenn noch nie ein BFV request gemacht wurde */
      if (!saison) {
        await updateMatches();
        return 'first RQ';
      }

      const { BFV_PERMANENT_TEAM_ID } = serverEnv;

      const data = await bfvApi.listMatches({
        params: { teamPermanentId: BFV_PERMANENT_TEAM_ID },
      });

      /* BFV Data has changed*/
      if (!isEqual(saison?.bfvData, data) || input.force) {
        await updateMatches();
        return {
          message: 'data changed',
          bfv_new_data: data,
          old_data: saison.bfvData,
        };
      }

      return 'Nothing to update';
    }),

  list: t.procedure.query(async ({ ctx }) => {
    const latestSaison = await ctx.db.query.saisons.findFirst({
      where: eq(saisons.latest, true),
      columns: { id: true },
    });

    if (!latestSaison) {
      return [];
    }

    const matches = await ctx.db.query.spiele.findMany({
      where: eq(spiele.saisonId, latestSaison.id),
      with: {
        opponent: true,
        Saison: true,
      },
      orderBy: [asc(spiele.kickoffDate)],
    });

    return matches;
  }),

  detail: t.procedure
    .input(z.object({ spielId: z.string() }))
    .query(async ({ ctx, input }) => {
      const spiel = await ctx.db.query.spiele.findFirst({
        where: eq(spiele.id, input.spielId),
        with: {
          opponent: true,
        },
      });

      return spiel ?? null;
    }),
});
