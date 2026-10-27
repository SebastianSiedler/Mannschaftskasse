import { createServerFn } from '@tanstack/react-start';
import { type AppSession, getServerAuthSession } from '@/lib/auth';

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AppSession | null> => {
    return await getServerAuthSession();
  },
);

export const getAuthProvidersFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return {
      auth0: {
        id: 'auth0',
        name: 'Auth0',
        type: 'oauth',
        signinUrl: '/api/auth/signin/auth0',
        callbackUrl: '/api/auth/callback/auth0',
      },
    };
  },
);
