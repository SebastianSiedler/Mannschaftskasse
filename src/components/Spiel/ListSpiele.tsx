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
      {spieleQuery.isLoading && <div>Loading...</div>}

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
