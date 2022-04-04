import { TRPCError } from '@trpc/server';
import { createRouter } from 'server/createRouter';
import { z } from 'zod';
import { updateMatches } from './utils/useBfv';

export const spielRouter = createRouter()
  /**
   * Run only once on init if no data available
   */
  .query('update_matches', {
    async resolve({ ctx }) {
      const saison = await ctx.prisma.saison.findFirst({
        where: { latest: true },
      });

      if (!saison) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active saison found',
        });
      }

      const diff_ms = Math.abs(
        new Date().getTime() - new Date(saison.lastBfvUpdate).getTime(),
      );

      /* Update (at earliest) every 600s */
      if (diff_ms / 1000 > 600) {
        await updateMatches();
        return {
          updated: true,
          lastUpdate: saison.lastBfvUpdate,
          lastUpdateDiffMs: diff_ms,
        };
      }

      return {
        updated: false,
        lastUpdate: saison.lastBfvUpdate,
        lastUpdateDiffMs: diff_ms,
      };
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
