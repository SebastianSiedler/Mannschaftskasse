import { trpc } from '@/lib/trpc';
import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import MatchListItem from '@/src/components/Spiel/MatchListItem';
import SingleMatch from '@/src/components/Spiel/SingleMatch';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const SpieleHome: NextPageWithAuthAndLayout = () => {
  const router = useRouter();

  return (
    <div>
      <ListSpiele />

      {!!router.query.spielId && (
        <SingleMatch
          spielId={router.query.spielId as unknown as string}
          open={!!router.query.spielId}
          handleClose={() => {
            router.replace('/spiele');
          }}
        />
      )}
    </div>
  );
};

SpieleHome.auth = true;
SpieleHome.getLayout = (page: React.ReactElement) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default SpieleHome;

const ListSpiele: React.FC = () => {
  trpc.useQuery(['spiel.update_matches'], {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 24 * 60 * 1000,
    refetchOnMount: false,

    onError: (err) => {
      toast.error(err.message);
    },
  });

  const spieleQuery = trpc.useQuery(['spiel.list'], {
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div>
      {spieleQuery.status === 'loading' && <div>Loading...</div>}

      {spieleQuery.status === 'success' && (
        <div className="mx-2 mt-2 gap-y-4 flex flex-col">
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
