/**
 * This file contains the root router of your tRPC-backend
 */
import { spielRouter } from './spiele';
import { spielerRouter } from './spieler';
import { einsatzRouter } from './spielereinsatz';
import { statsRouter } from './stats';
import { userRouter } from './user';
import { t } from '@/server/trpc';

export const appRouter = t.router({
  user: userRouter,
  spiel: spielRouter,
  spieler: spielerRouter,
  stats: statsRouter,
  einsatz: einsatzRouter,
});

export type AppRouter = typeof appRouter;
