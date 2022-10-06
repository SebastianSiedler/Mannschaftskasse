import { NextPageWithAuthAndLayout, SSGLayout } from '@/lib/types';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import SingleMatch from '@/src/components/Spiel/SingleMatch';
import { useRouter } from 'next/router';

const SpieleHome: NextPageWithAuthAndLayout = () => {
  const router = useRouter();

  return (
    <div>
      {!!router.query.spielId ? (
        <SingleMatch
          spielId={router.query.spielId as unknown as string}
          open
          handleClose={() => {
            router.replace('/spiele');
          }}
        />
      ) : (
        <div>error</div>
      )}
    </div>
  );
};

SpieleHome.auth = false;
SpieleHome.getLayout = (page) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default SpieleHome;
