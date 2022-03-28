import { trpc } from '@/lib/trpc';
import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import Button from '@mui/material/Button';
import toast from 'react-hot-toast';

const StatsHome: NextPageWithAuthAndLayout = () => {
  const statsQuery = trpc.useQuery(['stats.list']);

  const schuldenBegleichen = trpc.useMutation('stats.clearDebts', {
    onSuccess: () => {
      statsQuery.refetch();
      toast.success('Schulden beglichen');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div>
      {statsQuery.data?.map(({ saison, saison_stats }, i) => (
        <div key={i}>
          <div>{`Saison: ${saison.name}`}</div>

          {saison_stats.map((player) => (
            <div
              key={player.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '0.5rem 0 0.5rem 0',
              }}
            >
              <div>{player.name}</div>

              {/* Stats */}
              <div>
                <div>Spiele: {player._count.spielereinsaetze}</div>
                <div>
                  Tore:{' '}
                  {player.spielereinsaetze.reduce(
                    (prev, curr) => (prev += curr.tore),
                    0,
                  )}
                </div>
                <div>
                  Schulden:{' '}
                  {player.spielereinsaetze.reduce(
                    (prev, curr) => (prev += curr.bezahlt ? 0 : 5),
                    0,
                  )}
                </div>
              </div>

              {/* Schulden begleichen */}
              {player.spielereinsaetze.reduce(
                (prev, curr) => (prev += curr.bezahlt ? 0 : 5),
                0,
              ) > 0 ? (
                <Button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Schulden von ${player.name} wirklich begleichen?`,
                      )
                    ) {
                      schuldenBegleichen.mutate({ spielerId: player.id });
                    }
                  }}
                >
                  Schulden begleichen
                </Button>
              ) : (
                <div></div>
              )}
            </div>
          ))}
        </div>
      ))}
      <SignOut />
    </div>
  );
};

StatsHome.auth = true;
StatsHome.getLayout = (page: React.ReactElement) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default StatsHome;

import { signOut } from 'next-auth/react';

const SignOut: React.FC = () => {
  return <Button onClick={() => signOut()}>Sign out</Button>;
};
