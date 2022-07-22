import { ssg } from '@/server/ssg';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import ListSpiele from '@/src/components/Spiel/ListSpiele';
import SingleMatch from '@/src/components/Spiel/SingleMatch';
import { GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router';
import type { SSGLayout } from '@/lib/types';

const SpieleHome: SSGLayout<typeof getStaticProps> = () => {
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

SpieleHome.auth = false;
SpieleHome.getLayout = (page) => {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default SpieleHome;

export const getStaticProps = async (context: GetStaticPropsContext) => {
  await ssg.fetchQuery('spiel.list', undefined);

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};
