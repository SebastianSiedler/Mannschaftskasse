import { serverEnv } from '@/env/server';
import { createRouter } from 'server/createRouter';
import { z } from 'zod';
import { getBfvData } from './utils/useBfv';
import isEqual from 'lodash.isequal';
import { updateMatches } from './utils/updateMatches';

export const spielRouter = createRouter()
  /**
   * Update matches in local DB
   * if an error occours:
   * force update: /api/trpc/spiel.update_matches?input={"json":{"force":true}}
   */
  .query('update_matches', {
    input: z.object({
      force: z.boolean().optional(),
    }),
    async resolve({ ctx, input }) {
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
    },
  })
  .query('list', {
    async resolve({ ctx }) {
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
    },
  })
  .query('detail', {
    input: z.object({ spielId: z.string() }),
    async resolve({ ctx, input }) {
      const spiel = await ctx.prisma.spiel.findUnique({
        where: {
          id: input.spielId,
        },
        include: {
          opponent: true,
        },
      });

      return spiel;
    },
  });
