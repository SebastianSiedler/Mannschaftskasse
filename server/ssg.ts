import { db } from '@/lib/db';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { appRouter } from './routers/_app';

export const ssg = createServerSideHelpers({
  router: appRouter,
  ctx: {
    db,
    session: null,
  },
  transformer: superjson,
});
