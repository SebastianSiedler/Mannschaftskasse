import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import ListKader from '@/src/components/Kader/ListKader';

const KaderHome: NextPageWithAuthAndLayout = () => {
  return <ListKader />;
};

KaderHome.auth = true;
KaderHome.getLayout = (page: React.ReactElement) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default KaderHome;
