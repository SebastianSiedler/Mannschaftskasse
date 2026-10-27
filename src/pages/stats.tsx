import { trpc } from '@/lib/trpc';
import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import Button from '@mui/material/Button';
import { signOut } from 'next-auth/react';
import StatsTable from '../components/Stats/Table';

const StatsHome: NextPageWithAuthAndLayout = () => {
  const statsQuery = trpc.stats.list.useQuery();

  return (
    <>
      {/* Loading */}
      {statsQuery.isLoading && <div>Loading...</div>}

      {/* Success */}
      {statsQuery.isSuccess &&
        statsQuery.data?.map(({ saison, saison_stats }, i) => (
          <div key={i}>
            <StatsTable data={saison_stats} saisonName={saison.name} />
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

const SignOut: React.FC = () => {
  return (
    <Button variant="outlined" onClick={() => signOut()}>
      Sign out
    </Button>
  );
};
