import { Context } from './context';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { TRPCError } from '@trpc/server';

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * reject unauthenticated users
 */
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
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

/**
 * reject non admin users
 */
const isAdmin = t.middleware(async ({ ctx, next }) => {
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

export const authProcedure = t.procedure.use(isAuthenticated);
export const adminProcedure = t.procedure.use(isAdmin);
