import { spieler, spielereinsaetze, type Spieler } from '@/lib/db';
import { adminProcedure, authProcedure, t } from '@/server/trpc';
import { updateEinsatzSchema } from '@/src/components/Spiel/EditEinsatz';
import { TRPCError } from '@trpc/server';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';

export const einsatzRouter = t.router({
  list: authProcedure
    .input(z.object({ spielId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.spielereinsaetze.findMany({
        where: eq(spielereinsaetze.spielId, input.spielId),
        with: {
          spieler: true,
        },
        orderBy: [asc(spielereinsaetze.bezahlt)],
      });
    }),

  detail: authProcedure
    .input(z.object({ spielId: z.string(), spielerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const einsatz = await ctx.db.query.spielereinsaetze.findFirst({
        where: and(
          eq(spielereinsaetze.spielId, input.spielId),
          eq(spielereinsaetze.spielerId, input.spielerId),
        ),
      });

      if (!einsatz) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Spielereinsatz nicht gefunden',
        });
      }

      return einsatz;
    }),

  listAvailablePlayers: authProcedure
    .input(z.object({ spielId: z.string() }))
    .query(async ({ ctx, input }) => {
      const activePlayers = await ctx.db.query.spieler.findMany({
        where: eq(spieler.active, true),
        with: {
          spielereinsaetze: {
            where: eq(spielereinsaetze.spielId, input.spielId),
          },
        },
      });

      return activePlayers
        .filter((p) => p.spielereinsaetze.length === 0)
        .map(({ id, names, active }) => ({ id, names, active }));
    }),

  addByPlayerList: adminProcedure
    .input(
      z.object({
        names: z.string().array().min(1),
        spielId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const unknown_players: string[] = [];
      const played_players: Spieler[] = [];

      const all_players = await ctx.db.query.spieler.findMany();

      input.names.forEach((name) => {
        const player = all_players.find((player) =>
          player.names.includes(name),
        );

        if (player) {
          played_players.push(player);
          return;
        }

        unknown_players.push(name);
      });

      if (played_players.length > 0) {
        await ctx.db
          .insert(spielereinsaetze)
          .values(
            played_players.map((player) => ({
              tore: 0,
              bezahlt: false,
              gelbeKarte: 0,
              roteKarte: 0,
              spielId: input.spielId,
              spielerId: player.id,
            })),
          )
          .onConflictDoNothing({
            target: [spielereinsaetze.spielerId, spielereinsaetze.spielId],
          });
      }

      return {
        unknown_players,
      };
    }),

  add: adminProcedure
    .input(
      z.object({
        spielId: z.string(),
        spielerId: z.string(),
        tore: z.number().min(0).default(0),
        gelbeKarte: z.number().default(0),
        roteKarte: z.number().default(0),
        bezahlt: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(spielereinsaetze)
        .values(input)
        .returning();
      return created;
    }),

  update: adminProcedure
    .input(updateEinsatzSchema)
    .mutation(async ({ ctx, input }) => {
      const { spielId, spielerId, ...rest } = input;
      const [updated] = await ctx.db
        .update(spielereinsaetze)
        .set(rest)
        .where(
          and(
            eq(spielereinsaetze.spielId, spielId),
            eq(spielereinsaetze.spielerId, spielerId),
          ),
        )
        .returning();
      return updated;
    }),

  remove: adminProcedure
    .input(
      z.object({
        spielId: z.string(),
        spielerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(spielereinsaetze)
        .where(
          and(
            eq(spielereinsaetze.spielId, input.spielId),
            eq(spielereinsaetze.spielerId, input.spielerId),
          ),
        )
        .returning();
      return deleted;
    }),
});
