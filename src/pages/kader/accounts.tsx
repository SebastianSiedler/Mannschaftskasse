import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import UserManagement from '@/src/components/Kader/UserManagement';

const KaderHome: NextPageWithAuthAndLayout = () => {
  return <UserManagement />;
};

KaderHome.auth = true;
KaderHome.getLayout = (page: React.ReactElement) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default KaderHome;
