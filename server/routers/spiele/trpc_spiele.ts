import { serverEnv } from '@/env/server';
import { z } from 'zod';
import { getBfvData } from './utils/useBfv';
import isEqual from 'lodash.isequal';
import { updateMatches } from './utils/updateMatches';
import { t } from '@/server/trpc';
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
      const saison = await ctx.prisma.saison.findFirst({
        where: {
          latest: true,
        },
      });

      /* Passiert nur, wenn noch nie ein BFV request gemacht wurde */
      if (!saison) {
        await updateMatches();
        return 'first RQ';
      }

      const { BFV_PERMANENT_TEAM_ID } = serverEnv;

      const data = await getBfvData(BFV_PERMANENT_TEAM_ID);

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
    const matches = await ctx.prisma.spiel.findMany({
      where: {
        saison: {
          latest: true,
        },
      },
      include: {
        opponent: true,
        Saison: true,
      },
      orderBy: {
        kickoffDate: 'asc',
      },
    });

    return matches;
  }),

  detail: t.procedure
    .input(z.object({ spielId: z.string() }))
    .query(async ({ ctx, input }) => {
      const spiel = await ctx.prisma.spiel.findUnique({
        where: {
          id: input.spielId,
        },
        include: {
          opponent: true,
        },
      });

      return spiel;
    }),
});
