import { Context } from './context';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { isAdmin, isAuthenticated } from '@/server/middleware';

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const authProcedure = t.procedure.use(isAuthenticated);
export const adminProcedure = t.procedure.use(isAdmin);
