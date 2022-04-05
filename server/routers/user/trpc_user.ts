import { TRPCError } from '@trpc/server';
import { createRouter } from '../../createRouter';
import { z } from 'zod';
import { createAdminRouter } from '@/server/create-admin-router';

export const userRouter = createRouter()
  .query('profile', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { id } = input;
      const user = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          image: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No profile with id '${id}'`,
        });
      }

      return user;
    },
  })
  .merge(
    '',
    createAdminRouter()
      .query('list', {
        async resolve({ ctx }) {
          return await ctx.prisma.user.findMany({
            where: {
              id: {
                not: ctx.session?.user.id,
              },
            },
            orderBy: {
              name: 'asc',
            },
          });
        },
      })
      .mutation('changeRole', {
        input: z.object({
          userId: z.string(),
          admin: z.boolean(),
        }),
        async resolve({ ctx, input }) {
          return await ctx.prisma.user.update({
            where: {
              id: input.userId,
            },
            data: {
              role: input.admin ? 'ADMIN' : 'USER',
            },
          });
        },
      }),
  );
