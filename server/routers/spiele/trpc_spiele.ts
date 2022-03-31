import { TRPCError } from '@trpc/server';
import { createRouter } from 'server/createRouter';
import { z } from 'zod';
import { isBfvDataChanged, updateMatches } from './utils/useBfv';

export const spielRouter = createRouter()
  /**
   * Run only once on init if no data available
   */
  .query('update_matches', {
    async resolve() {
      return await updateMatches();
    },
  })
  .query('list', {
    async resolve({ ctx }) {
      try {
        if (await isBfvDataChanged()) {
          await updateMatches();
        }
      } catch (e) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed, updating bfv matches: ${(e as Error).message}`,
        });
      }

      const matches = await ctx.prisma.spiel.findMany({
        where: {
          saison: {
            latest: true,
          },
        },
        include: {
          homeTeam: true,
          guestTeam: true,
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
          homeTeam: true,
          guestTeam: true,
        },
      });

      return {
        ...spiel,
        title: `${spiel?.homeTeam.name} vs. ${spiel?.guestTeam.name} `,
      };
    },
  });
