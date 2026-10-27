import Skeleton from '@mui/material/Skeleton';
import { queryOptions, useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { getSessionFn } from '@/server/functions/auth';

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: ['auth', 'session'] as const,
    queryFn: () => getSessionFn(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export function useSession() {
  const query = useQuery(sessionQueryOptions());
  const status: 'loading' | 'authenticated' | 'unauthenticated' =
    query.isPending
      ? 'loading'
      : query.data?.user
        ? 'authenticated'
        : 'unauthenticated';

  return {
    data: query.data ?? null,
    status,
    refetch: query.refetch,
  };
}

export async function signIn(
  providerId?: string,
  options?: { callbackUrl?: string },
) {
  if (typeof window === 'undefined') return;
  if (!providerId) {
    window.location.href = '/sign-in';
    return;
  }

  const csrfRes = await fetch('/api/auth/csrf');
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `/api/auth/signin/${providerId}`;

  const csrfInput = document.createElement('input');
  csrfInput.type = 'hidden';
  csrfInput.name = 'csrfToken';
  csrfInput.value = csrfToken;
  form.appendChild(csrfInput);

  const callbackInput = document.createElement('input');
  callbackInput.type = 'hidden';
  callbackInput.name = 'callbackUrl';
  callbackInput.value = options?.callbackUrl ?? window.location.origin;
  form.appendChild(callbackInput);

  document.body.appendChild(form);
  form.submit();
}

export async function signOut(options?: { callbackUrl?: string }) {
  if (typeof window === 'undefined') return;

  const csrfRes = await fetch('/api/auth/csrf');
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/api/auth/signout';

  const csrfInput = document.createElement('input');
  csrfInput.type = 'hidden';
  csrfInput.name = 'csrfToken';
  csrfInput.value = csrfToken;
  form.appendChild(csrfInput);

  const callbackInput = document.createElement('input');
  callbackInput.type = 'hidden';
  callbackInput.name = 'callbackUrl';
  callbackInput.value = options?.callbackUrl ?? '/';
  form.appendChild(callbackInput);

  document.body.appendChild(form);
  form.submit();
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isUser = !!session?.user;

  React.useEffect(() => {
    if (status === 'loading') return;
    if (!isUser) {
      signIn();
    }
  }, [isUser, status]);

  if (isUser) {
    return <>{children}</>;
  }

  return (
    <div className="p-4 space-y-4">
      <Skeleton variant="rounded" width="100%" height={48} />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width="100%" height={64} />
        ))}
      </div>
    </div>
  );
}
