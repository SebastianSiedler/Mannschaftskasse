import { createFileRoute, redirect } from '@tanstack/react-router';
import Div100vh from 'react-div-100vh';
import { signIn } from '@/lib/auth-client';
import { getAuthProvidersFn, getSessionFn } from '@/server/functions/auth';

export const Route = createFileRoute('/sign-in')({
  head: () => ({
    meta: [{ title: 'Sign In - Mannschaftskasse' }],
  }),
  loader: async () => {
    const [session, providers] = await Promise.all([
      getSessionFn(),
      getAuthProvidersFn(),
    ]);

    if (session?.user) {
      throw redirect({ to: '/spiele' });
    }

    return { providers };
  },
  component: SignInPage,
});

function SignInPage() {
  const { providers } = Route.useLoaderData();

  return (
    <Div100vh>
      <main className="flex flex-col justify-center basis-full">
        <div>Sign In</div>
        <div className="w-full space-y-4 text-center bg-primary">
          {Object.values(providers ?? {}).map((provider) => (
            <div key={provider.name}>
              <button
                className="flex gap-2 p-3 outline rounded-xl"
                onClick={() => signIn(provider.id)}
              >
                <img
                  src="/providerIcons/Google.svg"
                  alt={provider.name}
                  className="w-6 h-6"
                />
                <span>Sign in with {provider.name}</span>
              </button>
            </div>
          ))}
        </div>
      </main>
    </Div100vh>
  );
}
