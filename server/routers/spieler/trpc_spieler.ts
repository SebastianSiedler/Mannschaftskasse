import { spieler } from '@/lib/db';
import { adminProcedure, t } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { ne } from 'drizzle-orm';
import { z } from 'zod';

export const spielerRouter = t.router({
  list: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.spieler.findMany();
  }),

  upsert: adminProcedure
    .input(
      z.object({
        names: z.string().min(2).array().min(1),
        spielerId: z.string().optional(),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      /* Input array contains duplicates */
      if (input.names.length !== new Set(input.names).size) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Namen enthalten Dublikate!',
        });
      }

      const isExistingId = !!input.spielerId && input.spielerId !== '-1';

      const existingPlayers = await ctx.db.query.spieler.findMany({
        where: isExistingId ? ne(spieler.id, input.spielerId!) : undefined,
        columns: { names: true },
      });
      const flat_spieler = existingPlayers.map((s) => s.names).flat();

      for (const name of input.names) {
        if (flat_spieler.includes(name)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `${name} ist bereits vergeben!`,
          });
        }
      }

      if (isExistingId) {
        const [updated] = await ctx.db
          .insert(spieler)
          .values({
            id: input.spielerId!,
            active: input.active,
            names: input.names,
          })
          .onConflictDoUpdate({
            target: spieler.id,
            set: {
              active: input.active,
              names: input.names,
            },
          })
          .returning();

        return updated;
      }

      const [created] = await ctx.db
        .insert(spieler)
        .values({
          active: input.active,
          names: input.names,
        })
        .returning();

      return created;
    }),
});
