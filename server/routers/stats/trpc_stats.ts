import { TRPCError } from '@trpc/server';
import { createRouter } from 'server/createRouter';
import { z } from 'zod';
import { Context } from '@/server/context';
import { getUserByCtx } from '@/server/utils';

export const statsRouter = createRouter()
  .query('list', {
    async resolve({ ctx }) {
      const saisons = await ctx.prisma.saison.findMany();

      const stats = await ctx.prisma.$transaction(
        saisons.map((saison) => {
          return ctx.prisma.spieler.findMany({
            where: {
              spielereinsaetze: {
                some: {
                  Spiel: {
                    saisonId: saison.id,
                  },
                },
              },
            },
            include: {
              _count: {
                select: {
                  spielereinsaetze: true,
                },
              },
              spielereinsaetze: {
                where: {
                  Spiel: {
                    saisonId: {
                      equals: saison.id,
                    },
                  },
                },
                select: {
                  tore: true,
                  bezahlt: true,
                },
              },
            },
          });
        }),
      );

      return stats.map((saison_stats, i) => ({
        saison_stats,
        saison: saisons[i],
      }));
    },
  })
  .mutation('clearDebts', {
    input: z.object({ spielerId: z.string() }),
    async resolve({ ctx, input }) {
      await ctx.prisma.spielereinsatz.updateMany({
        where: {
          spielerId: input.spielerId,
        },
        data: {
          bezahlt: true,
        },
      });
    },
  });
