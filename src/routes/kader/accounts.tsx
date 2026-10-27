import { createFileRoute } from '@tanstack/react-router';
import { AuthGuard } from '@/lib/auth-client';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import UserManagement from '@/src/components/Kader/UserManagement';

export const Route = createFileRoute('/kader/accounts')({
  component: KaderAccountsPage,
});

function KaderAccountsPage() {
  return (
    <AuthGuard>
      <DefaultLayout>
        <UserManagement />
      </DefaultLayout>
    </AuthGuard>
  );
}
