/**
 * This file contains the root router of your tRPC-backend
 */
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import superjson from 'superjson';
import { z } from 'zod';
import { createRouter } from '../createRouter';
import { spielRouter } from './spiele';
import { spielerRouter } from './spieler';
import { einsatzRouter } from './spielereinsatz';
import { statsRouter } from './stats';
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
  .query('prisma_user', {
    async resolve({ ctx }) {
      return await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session?.user.id,
        },
      });
    },
  })
  .query('prisma_first_user', {
    async resolve({ ctx }) {
      return await ctx.prisma.user.findFirst();
    },
  })
  .query('prisma_first_user_5_parallel', {
    async resolve({ ctx }) {
      return await Promise.all(
        [1, 2, 3, 4, 5].map(async () => await ctx.prisma.user.findFirst()),
      );
    },
  })
  .query('prisma_first_user_5_sequentiell', {
    async resolve({ ctx }) {
      const arr = [];
      for (let i = 0; i < 5; i++) {
        const u = await ctx.prisma.user.findFirst();
        arr.push(u);
      }
      return arr;
    },
  })
  .query('wait1000', {
    async resolve() {
      await new Promise((r) => setTimeout(r, 1000));
      return { time: new Date() };
    },
  })
  .query('jsonplaceholder', {
    async resolve() {
      const { data } = await axios.get(
        `https://jsonplaceholder.typicode.com/posts?id=${Math.floor(
          Math.random() * 12,
        )}`,
      );
      return data;
    },
  })
  .query('input', {
    input: z.object({ name: z.string() }),
    async resolve({ ctx, input }) {
      return { ctx, input };
    },
  })
  .merge('user.', userRouter)
  .merge('spiel.', spielRouter)
  .merge('spieler.', spielerRouter)
  .merge('einsatz.', einsatzRouter)
  .merge('stats.', statsRouter);

export type AppRouter = typeof appRouter;
