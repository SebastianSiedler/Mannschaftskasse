import type { GetStaticPaths, GetStaticProps } from 'next/types';
import type { ParsedUrlQuery } from 'querystring';
import type React from 'react';

type FieldValues = Record<string, any>;

type SSGPage<T> = React.FC<T>;

type SSGLayoutArgs<
  TCustomProps,
  TProps extends FieldValues,
  TPathQuery extends ParsedUrlQuery,
> = {
  getStaticPaths?: GetStaticPaths<TPathQuery>;
  getStaticProps?: GetStaticProps<TProps, TPathQuery>;
  Page: SSGPage<TProps>;
  customProps?: TCustomProps;
  tmp?: React.FC;
};

const layout = <TCustomProps,>() => {
  const ssg = <
    TProps extends FieldValues = any,
    TPathQuery extends ParsedUrlQuery = any,
  >(
    args: SSGLayoutArgs<TCustomProps, TProps, TPathQuery>,
  ) => {
    const newPage = Object.assign(args.Page, args.customProps);
    return Object.assign(args, { page: newPage });
  };

  return {
    ssg,
  };
};

type Auth = {
  auth?: boolean;
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

export const authLayout = layout<Auth>();
export const authSSG = authLayout.ssg;

export const { Page: page, getStaticProps } = authLayout.ssg({
  getStaticPaths: () => ({
    fallback: 'blocking',
    paths: [
      { params: { id: '1', age: '33' } },
      { params: { id: '2', age: '33' } },
    ],
  }),

  getStaticProps: ({ params }) => {
    params?.age;

    return {
      revalidate: 1,
      props: {
        a: 'asdf',
        name: 'Peter',
      } as const,
    };
  },

  Page: ({ a, name }) => {
    return <div>Some coole page</div>;
  },

  customProps: {
    auth: true,
  },
});

export default page;
