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

  return (
    <>
      {/* Loading */}
      {statsQuery.isLoading && <div>Loading...</div>}

      {/* Success */}
      {statsQuery.isSuccess &&
        statsQuery.data?.map(({ saison, saison_stats }, i) => (
          <div key={i}>
            <table className="relative w-full border">
              <thead className="sticky top-0 bg-slate-300">
                <tr>
                  <td>{`Saison: ${saison.name}`}</td>
                </tr>
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
                              schuldenBegleichen.mutate({
                                spielerId: player.id,
                              });
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

const SignOut: React.FC = () => {
  return <Button onClick={() => signOut()}>Sign out</Button>;
};
