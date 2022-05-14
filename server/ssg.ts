import { createSSGHelpers } from '@trpc/react/ssg';
import { appRouter } from './routers/_app';
import { prisma } from '@/lib/prisma';
import superjson from 'superjson';

export const ssg = createSSGHelpers({
  router: appRouter,
  ctx: {
    prisma,
    session: null,
  },
  transformer: superjson,
});
