import { users } from '@/lib/db';
import { adminProcedure, authProcedure, t } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { asc, eq, ne } from 'drizzle-orm';
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
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, id),
        columns: {
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
    return await ctx.db.query.users.findMany({
      where: ctx.session?.user.id
        ? ne(users.id, ctx.session.user.id)
        : undefined,
      orderBy: [asc(users.name)],
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
      const [updated] = await ctx.db
        .update(users)
        .set({
          role: input.admin ? 'ADMIN' : 'USER',
        })
        .where(eq(users.id, input.userId))
        .returning();

      return updated;
    }),
});
