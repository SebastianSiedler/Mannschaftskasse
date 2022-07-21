import { t } from '@/server/trpc';
import { TRPCError } from '@trpc/server';

export const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const isUserAdmin = ctx.session.user.role === 'ADMIN';

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      isUserAdmin,
    },
  });
});

export const isAdmin = t.middleware(async ({ ctx, next }) => {
  const isUserAdmin = ctx.session?.user.role === 'ADMIN';

  if (!isUserAdmin) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Admin Role required!',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      isUserAdmin,
    },
  });
});
