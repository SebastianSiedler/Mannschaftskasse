/**
 * This file contains the root router of your tRPC-backend
 */
import { TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { createRouter } from '../createRouter';
import { spielRouter } from './spiele';
import { spielerRouter } from './spieler';
import { einsatzRouter } from './spielereinsatz';
import { statsRouter } from './stats';
import { testRouter } from './test';
import { userRouter } from './user';

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = createRouter()
  // .middleware(({ ctx, next }) => { //TODO: middleware wieder reinkommentieren
  //   if (!ctx.session?.user) {
  //     throw new TRPCError({ code: 'UNAUTHORIZED' });
  //   }
  //   return next();
  // })
  /**
   * Add data transformers
   * @link https://trpc.io/docs/data-transformers
   */
  .transformer(superjson)
  /**
   * Optionally do custom error (type safe!) formatting
   * @link https://trpc.io/docs/error-formatting
   */
  // .formatError(({ shape, error }) => { })
  /**
   * Add a health check endpoint to be called with `/api/trpc/healthz`
   */
  .query('healthz', {
    async resolve() {
      return 'yay!';
    },
  })
  .merge('user.', userRouter)
  .merge('spiel.', spielRouter)
  .merge('spieler.', spielerRouter)
  .merge('einsatz.', einsatzRouter)
  .merge('stats.', statsRouter)
  .merge('test.', testRouter);

export type AppRouter = typeof appRouter;
