import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth/next';
const { performance } = require('perf_hooks');

export const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  const startTime = performance.now();
  const session = await getServerSession({ req, res }, authOptions);
  const endTime = performance.now();

  return {
    req,
    res,
    prisma,
    session,

    sessionDuration: `${endTime - startTime}ms`,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
