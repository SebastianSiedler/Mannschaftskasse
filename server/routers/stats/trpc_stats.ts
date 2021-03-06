import { isAdmin, isAuthenticated } from '@/server/middleware';
import { t } from '@/server/trpc';
import { z } from 'zod';

export const statsRouter = t.router({
  /**
   * List alle Spielereinsätze nach Saison aufgelistet
   */
  list: t.procedure.use(isAuthenticated).query(async ({ ctx }) => {
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
