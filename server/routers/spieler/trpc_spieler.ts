import { TRPCError } from '@trpc/server';
import { createRouter } from 'server/createRouter';
import { z } from 'zod';
import { Context } from '@/server/context';
import { getUserByCtx } from '@/server/utils';

export const spielerRouter = createRouter()
  .query('list', {
    async resolve({ ctx }) {
      return await ctx.prisma.spieler.findMany();
    },
  })
  .mutation('add', {
    input: z.object({ name: z.string().min(2) }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.spieler.create({
        data: {
          name: input.name,
          active: true,
        },
      });
    },
  })
  .mutation('update', {
    input: z.object({
      spielerId: z.string(),
      active: z.boolean().optional(),
      name: z.string().min(2).optional(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.spieler.update({
        where: {
          id: input.spielerId,
        },
        data: {
          active: input.active,
          name: input.name,
        },
      });
    },
  });
