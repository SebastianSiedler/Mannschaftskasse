import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import * as trpcNext from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth/next';

export const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  const session = await getServerSession(req, res, authOptions);

  return {
    db,
    session,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
