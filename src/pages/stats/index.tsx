import { trpc } from '@/lib/trpc';
import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import Button from '@mui/material/Button';
import toast from 'react-hot-toast';

const StatsHome: NextPageWithAuthAndLayout = () => {
  const statsQuery = trpc.useQuery(['stats.list'], {
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const schuldenBegleichen = trpc.useMutation('stats.clearDebts', {
    onSuccess: () => {
      statsQuery.refetch();
      toast.success('Schulden beglichen');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const [data, setData] = useState<ReturnType<typeof getTransformedStats>>([]);

  const getTransformedStats = () => {
    return (
      statsQuery.data?.map(({ saison, saison_stats }) => {
        return {
          saison,
          saison_stats: saison_stats
            .map((player) => {
              const schulden = player.spielereinsaetze.reduce(
                (prev, curr) => (prev += curr.bezahlt ? 0 : 5),
                0,
              );
              const anz_spiele = player._count.spielereinsaetze;

              return {
                schulden,
                anz_spiele,
                name: player.names[0],
                ...player,
              };
            })
            .sort((a, b) => b.schulden - a.schulden),
        };
      }) ?? []
    );
  };

  useEffect(() => {
    setData(getTransformedStats());
  }, [statsQuery.data]);

  return (
    <>
      {data.map(({ saison, saison_stats }, i) => (
        <div key={i}>
          <table className="relative w-full border">
            <thead className="sticky top-0 bg-slate-300">
              <div>{`Saison: ${saison.name}`}</div>
              <tr>
                <th>Name</th>
                <th>Spiele</th>
                <th>Schulden</th>
              </tr>
            </thead>
            <tbody>
              {saison_stats.map((player, i) => (
                <tr
                  key={player.id}
                  className={
                    (i % 2 == 0 ? 'bg-gray-100' : '') + ' min-h-[300px]'
                  }
                >
                  <td className="">{player.name}</td>
                  <td className="text-center">{player.anz_spiele}</td>
                  <td className="text-center">
                    {player.schulden > 0 && (
                      <Button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Schulden von ${player.names[0]} wirklich begleichen?`,
                            )
                          ) {
                            schuldenBegleichen.mutate({ spielerId: player.id });
                          }
                        }}
                      >
                        {`${player.schulden}€ begleichen?`}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <SignOut />
    </>
  );
};

StatsHome.auth = true;
StatsHome.getLayout = (page: React.ReactElement) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default StatsHome;

import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

const SignOut: React.FC = () => {
  return <Button onClick={() => signOut()}>Sign out</Button>;
};
