import { AppRouter } from 'server/routers/_app';
import { transformer } from '@/lib/trpc';
import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { loggerLink } from '@trpc/client/links/loggerLink';
import { withTRPC } from '@trpc/next';
import { TRPCError } from '@trpc/server';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import type { AppProps } from 'next/app';
import * as React from 'react';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

type AppPropsWithAuthAndLayout = AppProps & {
  Component: NextPageWithAuthAndLayout;
};

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithAuthAndLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      {Component.auth ? (
        <Auth>{getLayout(<Component {...pageProps} />)}</Auth>
      ) : (
        getLayout(<Component {...pageProps} />)
      )}
      <Toaster />
    </SessionProvider>
  );
}

function Auth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isUser = !!session?.user;
  React.useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!isUser) signIn(); // If not authenticated, force log in
  }, [isUser, status]);

  if (isUser) {
    return <>{children}</>;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return null;
}

function getBaseUrl() {
  if (process.browser) {
    return '';
  }
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export default withTRPC<AppRouter>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config() {
    return {
      /**
       * @link https://trpc.io/docs/links
       */
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      transformer,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
      queryClientConfig: {
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              const trcpErrorCode = error?.data?.code as TRPCError['code'];
              if (trcpErrorCode === 'NOT_FOUND') {
                return false;
              }
              if (failureCount < 3) {
                return true;
              }
              return false;
            },
          },
        },
      },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
