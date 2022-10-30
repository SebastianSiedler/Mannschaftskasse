import type {
  InferGetServerSidePropsType,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import * as React from 'react';

interface AuthLayout {
  auth?: boolean;
  getLayout?: (page: React.ReactElement) => React.ReactNode;
}

/**
 * For Next Client Side Pages
 * 
 * @example
 * const SneakerHome: NextPageWithAuthAndLayout<typeof getStaticProps> = ({ brands }) => {
   return <div>...
   }
 */
export type NextPageWithAuthAndLayout<T = Record<string, unknown>> =
  NextPage<T> & AuthLayout;

/**
 * For Next SSR Pages
 * 
 * @example
 * const SneakerHome: SSGLayout<typeof getStaticProps> = ({ brands }) => {
   return <div>...
   }
 */
export type SSGLayout<T extends (args: any) => any> = NextPage<
  InferGetStaticPropsType<T>
> &
  AuthLayout;

/**
 * For Next SSR Pages
 * 
 * @example
 * const SneakerHome: SSRLayout<typeof getServerSideProps> = ({ brands }) => {
   return <div>...
   }
 */
export type SSRLayout<T extends (args: any) => any> = NextPage<
  InferGetServerSidePropsType<T>
> &
  AuthLayout;
