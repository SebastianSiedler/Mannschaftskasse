import { TRPCError } from '@trpc/server';
import { createRouter } from 'server/createRouter';
import { z } from 'zod';
import { Context } from '@/server/context';
import { getUserByCtx } from '@/server/utils';

export const einsatzRouter = createRouter()
  .query('list', {
    input: z.object({ spielId: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.spielereinsatz.findMany({
        where: {
          spielId: input.spielId,
        },
        include: {
          spieler: true,
        },
        orderBy: {
          spieler: {
            name: 'asc',
          },
        },
      });
    },
  })
  .query('detail', {
    input: z.object({ spielId: z.string(), spielerId: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.spielereinsatz.findUnique({
        where: {
          spielerId_spielId: {
            spielId: input.spielId,
            spielerId: input.spielerId,
          },
        },
      });
    },
  })
  .query('list.availablePlayers', {
    input: z.object({ spielId: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.spieler.findMany({
        where: {
          spielereinsaetze: {
            none: {
              spielId: input.spielId,
            },
          },
          active: true,
        },
      });
    },
  })
  .mutation('add', {
    input: z.object({
      spielId: z.string(),
      spielerId: z.string(),
      tore: z.number().min(0).default(0),
      gelbeKarte: z.number().default(0),
      roteKarte: z.number().default(0),
      bezahlt: z.boolean().default(false),
    }),
    async resolve({ input, ctx }) {
      console.log(input);
      return await ctx.prisma.spielereinsatz.create({
        data: input,
      });
    },
  })
  .mutation('update', {
    input: z.object({
      spielId: z.string(),
      spielerId: z.string(),
      tore: z.number().min(0).optional(),
      gelbeKarte: z.number().optional(),
      roteKarte: z.number().optional(),
      bezahlt: z.boolean().optional(),
    }),
    async resolve({ ctx, input }) {
      const { spielId, spielerId } = input;
      return await ctx.prisma.spielereinsatz.update({
        where: {
          spielerId_spielId: {
            spielId,
            spielerId,
          },
        },
        data: input,
      });
    },
  })
  .mutation('remove', {
    input: z.object({
      spielId: z.string(),
      spielerId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.spielereinsatz.delete({
        where: {
          spielerId_spielId: {
            spielId: input.spielId,
            spielerId: input.spielerId,
          },
        },
      });
    },
  });
