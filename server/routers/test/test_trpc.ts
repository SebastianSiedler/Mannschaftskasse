import { measureTime } from '@/lib/index';
import axios from 'axios';
import { createRouter } from 'server/createRouter';
import { z } from 'zod';

export const testRouter = createRouter()
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
  /**
   * /api/trpc/test.prisma_first_user_parallel?input={"json":{"range":15}}
   */
  .query('prisma_first_user_parallel', {
    input: z.object({ range: z.number().default(5) }),
    async resolve({ ctx, input }) {
      const { data, duration } = await measureTime(async () => {
        return await Promise.all(
          Array(input.range)
            .fill('#')
            .map(async () => await ctx.prisma.user.findFirst()),
        );
      });

      return {
        data,
        duration,
        session: ctx.sessionDuration,
      };
    },
  })
  .query('prisma_first_user_sequentiell', {
    input: z.object({ range: z.number().default(5) }),
    async resolve({ ctx, input }) {
      const { data, duration } = await measureTime(async () => {
        const arr = [];
        for (const _ of Array(input.range).fill('#')) {
          const u = await ctx.prisma.user.findFirst();
          arr.push(u);
        }
        return arr;
      });

      return {
        data,
        duration,
        session: ctx.sessionDuration,
      };
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
      const { data, duration } = await measureTime(async () => {
        const { data } = await axios.get(
          `https://jsonplaceholder.typicode.com/posts?id=${Math.floor(
            Math.random() * 12,
          )}`,
        );
        return data;
      });

      return {
        data,
        duration,
      };
    },
  })
  .query('input', {
    input: z.object({ name: z.string() }),
    resolve({ ctx, input }) {
      // return { ctx, input };
      return input.name;
    },
  });
