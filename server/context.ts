import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth/next';
import { measureTime } from '../lib';

export const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  const { data: session, duration } = await measureTime(() =>
    getServerSession({ req, res }, authOptions),
  );

  console.log('session: ', session);

  return {
    req,
    res,
    prisma,
    session,

    sessionDuration: session == null ? null : duration,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
