import type { AppRouter } from '@/server/routers/_app';
import { QueryCache } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type {
  inferRouterInputs,
  inferRouterOutputs,
  TRPCError,
} from '@trpc/server';
import type { NextPageContext } from 'next';
import toast from 'react-hot-toast';
import superjson from 'superjson';

export const transformer = superjson;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Extend `NextPageContext` with meta data that can be picked up by `responseMeta()` when server-side rendering
 */
export interface SSRContext extends NextPageContext {
  status?: number;
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

/**
 * A set of strongly-typed React hooks from your `AppRouter` type signature.
 */
export const trpc = createTRPCNext<AppRouter, SSRContext>({
  transformer,
  config() {
    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer,
        }),
      ],
      queryClientConfig: {
        queryCache: new QueryCache({
          onError: (error) => {
            if (typeof window !== 'undefined' && error instanceof Error) {
              toast.error(error.message);
            }
          },
        }),
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              const trcpErrorCode = error?.data?.code as TRPCError['code'];
              if (trcpErrorCode === 'NOT_FOUND') {
                return false;
              }
              if (failureCount < 3 && trcpErrorCode !== 'UNAUTHORIZED') {
                return true;
              }
              return false;
            },
            refetchInterval: 24 * 60 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: 24 * 60 * 60 * 1000,
          },
        },
      },
    };
  },
});
