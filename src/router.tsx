import { QueryCache, QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { routeTree } from './routeTree.gen';

export function createAppQueryClient() {
  return new QueryClient({
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
          if (error?.message === 'UNAUTHORIZED') {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return createAppQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = createAppQueryClient();
  }
  return browserQueryClient;
}

export function getRouter() {
  const queryClient = getQueryClient();

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
    },
    scrollRestoration: true,
    getScrollRestorationKey: (location) => location.pathname,
    defaultPreload: 'intent',
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
