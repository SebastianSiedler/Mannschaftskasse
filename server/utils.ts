import { TRPCError } from '@trpc/server';
import { Context } from './context';

export const getUserByCtx = (ctx: Context) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }
  return ctx.session.user;
};
