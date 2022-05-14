/**
 * This file contains the root router of your tRPC-backend
 */
import superjson from 'superjson';
import { createRouter } from '../createRouter';
import { spielRouter } from './spiele';
import { spielerRouter } from './spieler';
import { einsatzRouter } from './spielereinsatz';
import { statsRouter } from './stats';
import { userRouter } from './user';

export const appRouter = createRouter()
  .transformer(superjson)
  /**
   * Add a health check endpoint to be called with `/api/trpc/healthz`
   */
  .query('healthz', {
    async resolve() {
      return {
        message: 'yay!',
      };
    },
  })
  .merge('user.', userRouter)
  .merge('spiel.', spielRouter)
  .merge('spieler.', spielerRouter)
  .merge('einsatz.', einsatzRouter)
  .merge('stats.', statsRouter);

export type AppRouter = typeof appRouter;
