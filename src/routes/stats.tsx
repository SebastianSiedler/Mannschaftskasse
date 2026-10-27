import Skeleton from '@mui/material/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AuthGuard } from '@/lib/auth-client';
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
        <div className="mx-2 mt-2 pb-6">
          {statsQuery.isLoading && (
            <div>
              {/* Summary card skeleton */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div>
                    <Skeleton variant="text" width={140} height={26} />
                    <Skeleton variant="text" width={180} height={18} />
                  </div>
                  <Skeleton
                    variant="rounded"
                    width={100}
                    height={32}
                    sx={{ borderRadius: 2 }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-3">
                  <Skeleton
                    variant="rounded"
                    height={60}
                    sx={{ borderRadius: 3 }}
                  />
                  <Skeleton
                    variant="rounded"
                    height={60}
                    sx={{ borderRadius: 3 }}
                  />
                  <Skeleton
                    variant="rounded"
                    height={60}
                    sx={{ borderRadius: 3 }}
                  />
                </div>
              </div>

              {/* Table skeleton */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden p-4">
                <Skeleton
                  variant="text"
                  width="100%"
                  height={28}
                  className="mb-3"
                />
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0"
                  >
                    <Skeleton variant="text" width="35%" height={24} />
                    <div className="flex items-center gap-4">
                      <Skeleton variant="text" width={28} height={24} />
                      <Skeleton variant="text" width={28} height={24} />
                      <Skeleton
                        variant="rounded"
                        width={75}
                        height={26}
                        sx={{ borderRadius: 2 }}
                      />
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
        </div>
      </DefaultLayout>
    </AuthGuard>
  );
}
