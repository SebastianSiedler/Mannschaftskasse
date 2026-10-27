import Button from '@mui/material/Button';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AuthGuard, signOut } from '@/lib/auth-client';
import { statsListQueryOptions } from '@/server/functions/stats';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import StatsTable from '@/src/components/Stats/Table';

export const Route = createFileRoute('/stats')({
  component: StatsHome,
});

function StatsHome() {
  const statsQuery = useQuery(statsListQueryOptions());

  return (
    <AuthGuard>
      <DefaultLayout>
        {statsQuery.isLoading && <div>Loading...</div>}

        {statsQuery.isSuccess &&
          statsQuery.data?.map(({ saison, saison_stats }, i) => (
            <div key={i}>
              <StatsTable data={saison_stats} saisonName={saison.name} />
            </div>
          ))}

        <SignOut />
      </DefaultLayout>
    </AuthGuard>
  );
}

const SignOut: React.FC = () => {
  return (
    <Button variant="outlined" onClick={() => signOut()}>
      Sign out
    </Button>
  );
};
