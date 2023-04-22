import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from './routers/_app';
import { prisma } from '@/lib/prisma';
import superjson from 'superjson';

export const ssg = createServerSideHelpers({
  router: appRouter,
  ctx: {
    prisma,
    session: null,
  },
  transformer: superjson,
});
