import { authOptions } from '@/lib/auth';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { getServerSession } from 'next-auth/next';
import { getProviders, signIn } from 'next-auth/react';
import Head from 'next/head';
import Div100vh from 'react-div-100vh';
import Image from 'next/legacy/image';
import GoogleIcon from '../../public/providerIcons/Google.svg';

const SignIn = ({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      <Head>
        <title>Sign In</title>
      </Head>

      <Div100vh>
        <main className="flex flex-col justify-center basis-full">
          <div>Sign In</div>
          <div className="w-full space-y-4 text-center bg-primary">
            {Object.values(providers ?? {}).map((provider) => (
              <div key={provider.name}>
                <button
                  className="flex gap-2 p-3 outline rounded-xl"
                  onClick={() => signIn(provider.id)}
                >
                  <Image src={GoogleIcon}></Image>
                  <span>Sign in with {provider.name}</span>
                </button>
              </div>
            ))}
          </div>
        </main>
      </Div100vh>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  const providers = await getProviders();

  if (session?.user) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
      props: { providers },
    };
  }

  return {
    props: { providers },
  };
};

export default SignIn;
