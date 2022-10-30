import Link from 'next/link';
import type { NextPageWithAuthAndLayout } from '@/lib/types';

const Home: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Link href="/profile">
        <span className="text-blue-600">Profile</span>
      </Link>
      <Link href="/search">
        <span className="text-blue-600">Search</span>
      </Link>
      <Link href="/tenant">
        <span className="text-blue-600">Tenant</span>
      </Link>
      <Link href="/spiele">
        <span className="text-blue-600">Spiele</span>
      </Link>
    </>
  );
};

Home.auth = true;

export default Home;

/**
 * If you want to statically render this page
 * - Export `appRouter` & `createContext` from [trpc].ts
 * - Make the `opts` object optional on `createContext()`
 *
 * @link https://trpc.io/docs/ssg
 */
// export const getStaticProps = async (
//   context: GetStaticPropsContext<{ filter: string }>,
// ) => {
//   const ssg = createSSGHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//   });
//
//   await ssg.fetchQuery('post.all');
//
//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       filter: context.params?.filter ?? 'all',
//     },
//     revalidate: 1,
//   };
// };
