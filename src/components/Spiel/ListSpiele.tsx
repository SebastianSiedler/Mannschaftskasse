import Skeleton from '@mui/material/Skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  spieleListQueryOptions,
  updateMatchesFn,
} from '@/server/functions/spiele';
import MatchListItem from './MatchListItem';

const ListSpiele: React.FC = () => {
  const queryClient = useQueryClient();

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
          {spieleQuery.data?.map((item) => {
            return (
              <MatchListItem
                key={item.id}
                spielId={item.id}
                kickOffDate={item.kickoffDate}
                clubId={item.opponent.bfvClubId}
                teamName={item.opponent.name}
                result={item.result}
                resultStatus={item.resultType}
                currentGame={item.Saison.length > 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListSpiele;
