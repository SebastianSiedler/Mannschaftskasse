import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure, t } from '@/server/trpc';

export const spielerRouter = t.router({
  list: adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.spieler.findMany();
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
      /* Input array contais dublicates */
      if (input.names.length !== new Set(input.names).size) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Namen enthalten Dublikate!',
        });
      }
      const spieler = await ctx.prisma.spieler.findMany({
        where: {
          id: {
            not: input.spielerId,
          },
        },
        select: { names: true },
      });
      const flat_spieler = spieler.map((s) => s.names).flat();

      for (const name of input.names) {
        if (flat_spieler.includes(name)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `${name} ist bereits vergeben!`,
          });
        }
      }

      return await ctx.prisma.spieler.upsert({
        where: {
          id: input.spielerId,
        },
        create: {
          active: input.active,
          names: input.names,
        },
        update: {
          active: input.active,
          names: input.names,
        },
      });
    }),
});
