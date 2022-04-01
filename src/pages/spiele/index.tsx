import { trpc } from '@/lib/trpc';
import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import MatchListItem from '@/src/components/Spiel/MatchListItem';
import SingleMatch from '@/src/components/Spiel/SingleMatch';
import { useRouter } from 'next/router';

export type RESULT_SCORE =
  | 'GEWONNEN'
  | 'VERLOREN'
  | 'UNENTSCHIEDEN'
  | 'NOT PLAYED';

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
  const spieleQuery = trpc.useQuery(['spiel.list']);

  return (
    <div>
      {spieleQuery.status === 'success' && (
        <div className="mx-2 mt-2 gap-y-4 flex flex-col">
          {spieleQuery.data.map((item) => {
            return (
              <MatchListItem
                key={item.id}
                spielId={item.id}
                kickOffDate={item.kickoffDate}
                clubId={item.opponent.bfvClubId}
                teamName={item.opponent.name}
                result={item.result}
                resultStatus={item.resultType}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
