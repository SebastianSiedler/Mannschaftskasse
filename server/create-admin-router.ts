import * as trpc from '@trpc/server';
import { Context } from './context';

export function createAdminRouter() {
  return trpc.router<Context>().middleware(({ ctx, next }) => {
    if (!ctx.session) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }

    if (ctx.session.user.role !== 'ADMIN') {
      throw new trpc.TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Admin Role required!',
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
      },
    });
  });
}
