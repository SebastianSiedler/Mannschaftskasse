import { ssg } from '@/server/ssg';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import ListSpiele from '@/src/components/Spiel/ListSpiele';
import SingleMatch from '@/src/components/Spiel/SingleMatch';
import { useRouter } from 'next/router';
import { authSSG } from '@/src/tmp';

const x = authSSG({
  getStaticProps: async () => {
    console.warn('getStaticProps');

    if (process.browser) throw 'BROOOOOWWSER';
    await ssg.spiel.list.fetch();

    return {
      props: {
        // trpcState: ssg.dehydrate(),
      },
      revalidate: 1,
    };
  },

  Page: (props) => {
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
  },
  customProps: {
    auth: false,
    getLayout: (page) => {
      return <DefaultLayout>{page}</DefaultLayout>;
    },
  },
});

export default x.Page;

// export { getStaticProps };
