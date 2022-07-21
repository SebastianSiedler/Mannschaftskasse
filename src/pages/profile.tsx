import { trpc } from '@/lib/trpc';
import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

const Home: NextPageWithAuthAndLayout = () => {
  const { data: session } = useSession();

  const userQuery = trpc.proxy.user.profile.useQuery(
    { id: session?.user.id! },
    {
      onError: (err) => {
        toast.error(err.message);
      },
    },
  );

  return (
    <>
      <div>
        {userQuery.status !== 'loading' && (
          <div>
            <div className="flex justify-between">
              <div>
                <div>{userQuery.data?.name}</div>
              </div>

              <div className="relative w-20 aspect-square">
                <Image
                  src={userQuery.data?.image!}
                  layout="fill"
                  className="rounded-full"
                ></Image>
              </div>
            </div>
          </div>
        )}
        <button onClick={() => signOut()}>Sign out</button>{' '}
      </div>
    </>
  );
};

Home.auth = true;

export default Home;
