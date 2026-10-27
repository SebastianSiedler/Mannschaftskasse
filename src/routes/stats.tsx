import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
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
        {statsQuery.isLoading && (
          <div className="my-4 bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <Skeleton variant="text" width={140} height={28} />
            </div>
            <div className="divide-y divide-gray-200">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <Skeleton variant="text" width={110} height={20} />
                <div className="flex gap-4">
                  <Skeleton variant="text" width={24} height={20} />
                  <Skeleton variant="text" width={24} height={20} />
                  <Skeleton variant="text" width={24} height={20} />
                  <Skeleton variant="text" width={36} height={20} />
                </div>
              </div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5 even:bg-gray-50"
                >
                  <Skeleton
                    variant="text"
                    width={`${35 + ((i * 11) % 30)}%`}
                    height={20}
                  />
                  <div className="flex gap-4">
                    <Skeleton variant="text" width={24} height={20} />
                    <Skeleton variant="text" width={24} height={20} />
                    <Skeleton variant="text" width={24} height={20} />
                    <Skeleton variant="text" width={36} height={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
