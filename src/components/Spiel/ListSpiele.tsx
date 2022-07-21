import { trpc } from '@/lib/trpc';
import toast from 'react-hot-toast';
import MatchListItem from './MatchListItem';

const ListSpiele: React.FC = () => {
  trpc.proxy.spiel.updateMatches.useQuery(
    {},
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 24 * 60 * 1000,
      refetchOnMount: false,

      onError: (err) => {
        toast.error(err.message);
      },
    },
  );

  const spieleQuery = trpc.proxy.spiel.list.useQuery(undefined, {
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div>
      {spieleQuery.status === 'loading' && <div>Loading...</div>}

      {spieleQuery.status === 'success' && (
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
