import Skeleton from '@mui/material/Skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  spieleListQueryOptions,
  updateMatchesFn,
} from '@/server/functions/spiele';
import MatchListItem from './MatchListItem';

let hasInitialScrolledToCurrentGame = false;

const ListSpiele: React.FC = () => {
  const queryClient = useQueryClient();
  const currentGameRef = useRef<HTMLDivElement | null>(null);

  useQuery({
    queryKey: ['spiele', 'updateMatches'] as const,
    queryFn: async () => {
      const res = await updateMatchesFn({ data: {} });
      if (res !== 'Nothing to update') {
        await queryClient.invalidateQueries({ queryKey: ['spiele', 'list'] });
      }
      return res;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 24 * 60 * 1000,
    refetchOnMount: false,
  });

  const spieleQuery = useQuery(spieleListQueryOptions());

  const mismatchCount =
    spieleQuery.data?.filter((s) => s.hasGoalMismatch).length ?? 0;

  useEffect(() => {
    if (
      spieleQuery.data &&
      !hasInitialScrolledToCurrentGame &&
      currentGameRef.current
    ) {
      hasInitialScrolledToCurrentGame = true;
      currentGameRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [spieleQuery.data]);

  return (
    <div>
      {spieleQuery.isLoading && (
        <div className="flex flex-col mx-2 mt-2 gap-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-center gap-2 rounded-xl px-2 py-2"
            >
              <Skeleton
                variant="rounded"
                width={40}
                height={40}
                className="rounded-lg shrink-0"
              />
              <div className="min-w-0 flex-1">
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="45%" height={20} />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton variant="text" width={36} height={24} />
                <Skeleton
                  variant="rounded"
                  width={76}
                  height={22}
                  sx={{ borderRadius: '9999px' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {spieleQuery.isSuccess && (
        <div className="flex flex-col mx-2 mt-2 gap-y-4">
          {mismatchCount > 0 && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/90 px-3.5 py-2.5 text-amber-950">
              <span className="text-base shrink-0">⚠️</span>
              <div className="text-xs leading-relaxed">
                <span className="font-semibold">
                  {mismatchCount}{' '}
                  {mismatchCount === 1 ? 'Spiel hat' : 'Spiele haben'} eine
                  Tor-Differenz:
                </span>{' '}
                Die erfassten Spieler-Tore stimmen nicht mit dem BFV-Ergebnis
                überein.
              </div>
            </div>
          )}

          {spieleQuery.data?.map((item) => {
            const isCurrentGame = item.Saison.length > 0;
            return (
              <div
                key={item.id}
                ref={isCurrentGame ? currentGameRef : undefined}
              >
                <MatchListItem
                  spielId={item.id}
                  kickOffDate={item.kickoffDate}
                  clubId={item.opponent.bfvClubId}
                  teamName={item.opponent.name}
                  result={item.result}
                  resultStatus={item.resultType}
                  currentGame={isCurrentGame}
                  hasGoalMismatch={item.hasGoalMismatch}
                  recordedGoals={item.recordedGoals}
                  bfvOwnGoals={item.bfvOwnGoals}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListSpiele;
