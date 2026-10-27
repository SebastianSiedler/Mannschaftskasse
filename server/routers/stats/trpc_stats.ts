import { saisons, spielereinsaetze } from '@/lib/db';
import { adminProcedure, authProcedure, t } from '@/server/trpc';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

export const statsRouter = t.router({
  /**
   * List alle Spielereinsätze nach Saison aufgelistet
   */
  list: authProcedure.query(async ({ ctx }) => {
    const [allSaisons, allPlayers] = await Promise.all([
      ctx.db.query.saisons.findMany({
        with: {
          spiel: {
            with: {
              spielereinsaetze: {
                with: {
                  spieler: true,
                },
              },
            },
          },
        },
        orderBy: [desc(saisons.name)],
      }),
      ctx.db.query.spieler.findMany({
        with: {
          spielereinsaetze: {
            with: {
              Spiel: {
                with: {
                  opponent: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return allSaisons.map((saison) => {
      const saisonPlayers = allPlayers
        .map((player) => ({
          ...player,
          spielereinsaetze: player.spielereinsaetze.filter(
            (einsatz) => einsatz.Spiel.saisonId === saison.id,
          ),
        }))
        .filter((player) => player.spielereinsaetze.length > 0);

      return {
        saison,
        saison_stats: saisonPlayers
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
      };
    });
  }),

  /**
   * Schulden für einen Spieler begleichen
   */
  clearDebts: adminProcedure
    .input(
      z.object({
        spielerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(spielereinsaetze)
        .set({
          bezahlt: true,
        })
        .where(eq(spielereinsaetze.spielerId, input.spielerId));
    }),
});
