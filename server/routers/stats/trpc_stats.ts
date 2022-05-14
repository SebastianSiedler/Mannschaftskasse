import { z } from 'zod';
import { createAdminRouter } from '@/server/create-admin-router';
import { createProtectedRouter } from '@/server/create-protected-router';

export const statsRouter = createProtectedRouter()
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
  .merge('', createAdminRouter())
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
