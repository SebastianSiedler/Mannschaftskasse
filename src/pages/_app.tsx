import { trpc } from '@/lib/trpc';
import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import type { AppProps } from 'next/app';
import * as React from 'react';
import { Toaster } from 'react-hot-toast';
import Spinner from '../components/misc/Spinner';
import '../styles/globals.css';
import { ChakraProvider } from '@chakra-ui/react';

type AppPropsWithAuthAndLayout = AppProps & {
  Component: NextPageWithAuthAndLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithAuthAndLayout) {
  const session = (pageProps as any).session;
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    // <ChakraProvider>
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      {Component.auth ? (
        <Auth>{getLayout(<Component {...pageProps} />)}</Auth>
      ) : (
        getLayout(<Component {...pageProps} />)
      )}
      <Toaster />
    </SessionProvider>
    // </ChakraProvider>
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
  return (
    <div>
      <span>Waiting for Authentication...</span> <Spinner />
    </div>
  );
}

export default trpc.withTRPC(MyApp);
