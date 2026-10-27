import { trpc } from '@/lib/trpc';
import MatchListItem from './MatchListItem';

const ListSpiele: React.FC = () => {
  trpc.spiel.updateMatches.useQuery(
    {},
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 24 * 60 * 1000,
      refetchOnMount: false,
    },
  );

  const spieleQuery = trpc.spiel.list.useQuery();

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
