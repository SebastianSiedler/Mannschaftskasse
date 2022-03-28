import Link from 'next/link';
import type { NextPageWithAuthAndLayout } from '@/lib/types';

const Home: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Link href="/profile">
        <a className="text-blue-600">Profile</a>
      </Link>
      <Link href="/search">
        <a className="text-blue-600">Search</a>
      </Link>
      <Link href="/tenant">
        <a className="text-blue-600">Tenant</a>
      </Link>
      <Link href="/spiele">
        <a className="text-blue-600">Spiele</a>
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
