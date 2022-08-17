import { createProxySSGHelpers } from '@trpc/react/ssg';
import { appRouter } from './routers/_app';
import { prisma } from '@/lib/prisma';
import superjson from 'superjson';

export const ssg = createProxySSGHelpers({
  router: appRouter,
  ctx: {
    prisma,
    session: null,
  },
  transformer: superjson,
});
