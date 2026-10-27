import { createFileRoute, Link } from '@tanstack/react-router';
import { AuthGuard, useSession } from '@/lib/auth-client';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import ListKader from '@/src/components/Kader/ListKader';

export const Route = createFileRoute('/kader/')({
  component: KaderHome,
});

function KaderHome() {
  const { data: session } = useSession();

  return (
    <AuthGuard>
      <DefaultLayout>
        <ListKader />

        {session?.user.role === 'ADMIN' && (
          <Link to="/kader/accounts">
            <span>Manage Accounts</span>
          </Link>
        )}
      </DefaultLayout>
    </AuthGuard>
  );
}
