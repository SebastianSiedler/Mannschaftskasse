import { AppRouter } from 'server/routers/_app';
import { transformer, trpc } from '@/lib/trpc';
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

export default trpc.withTRPC(MyApp);
