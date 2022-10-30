import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import ListKader from '@/src/components/Kader/ListKader';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const KaderHome: NextPageWithAuthAndLayout = () => {
  const { data: session } = useSession();

  return (
    <>
      <ListKader />

      {session?.user.role === 'ADMIN' && (
        <Link href="/kader/accounts">
          <span>Manage Accounts</span>
        </Link>
      )}
    </>
  );
};

KaderHome.auth = true;
KaderHome.getLayout = (page: React.ReactElement) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default KaderHome;
