import { adminProcedure, authProcedure, t } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const userRouter = t.router({
  profile: authProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
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
    }),

  /**
   * Return a list of all other accounts, except the one of the
   * logged in user.
   */
  list: adminProcedure.query(async ({ ctx }) => {
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
  }),

  changeRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        admin: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          role: input.admin ? 'ADMIN' : 'USER',
        },
      });
    }),
});
