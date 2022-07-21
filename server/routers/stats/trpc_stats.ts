import { z } from 'zod';
import { createAdminRouter } from '@/server/create-admin-router';
import { createProtectedRouter } from '@/server/create-protected-router';

export const statsRouter = createProtectedRouter()
  .query('list', {
    async resolve({ ctx }) {
      const saisons = await ctx.prisma.saison.findMany({
        include: {
          spiel: {
            include: {
              spielereinsaetze: {
                include: {
                  spieler: true,
                },
              },
            },
          },
        },
      });

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
        saison: saisons[i],
        saison_stats: saison_stats
          .map((player) => {
            const schulden = player.spielereinsaetze.reduce(
              (prev, curr) => (prev += curr.bezahlt ? 0 : 5),
              0,
            );
            const anz_spiele = player.spielereinsaetze.length;

            return {
              schulden,
              anz_spiele,
              name: player.names[0],
              ...player,
            };
          })
          .sort((a, b) => b.schulden - a.schulden),
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
