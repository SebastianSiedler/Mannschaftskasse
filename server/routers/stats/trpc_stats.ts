import { isAdmin, isAuthenticated } from '@/server/middleware';
import { authProcedure, t } from '@/server/trpc';
import { z } from 'zod';

export const statsRouter = t.router({
  /**
   * List alle Spielereinsätze nach Saison aufgelistet
   */
  list: authProcedure.query(async ({ ctx }) => {
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
      orderBy: {
        name: 'desc',
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
          const schulden = player.spielereinsaetze.reduce((prev, curr) => {
            return (prev += curr.bezahlt ? 0 : 5);
          }, 0);

          const tore = player.spielereinsaetze.reduce((acc, curr) => {
            return (acc += curr.tore);
          }, 0);

          const anz_spiele = player.spielereinsaetze.length;

          return {
            schulden,
            anz_spiele,
            tore,
            name: player.names[0],
            playerId: player.id,
            ...player,
          };
        })
        .sort((a, b) => b.schulden - a.schulden),
    }));
  }),

  /**
   * Schulden für einen Spieler begleichen
   */
  clearDebts: t.procedure
    .use(isAdmin)
    .input(
      z.object({
        spielerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.spielereinsatz.updateMany({
        where: {
          spielerId: input.spielerId,
        },
        data: {
          bezahlt: true,
        },
      });
    }),
});
