import { trpc } from '@/lib/trpc';
import type { NextPageWithAuthAndLayout } from '@/lib/types';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

const Home: NextPageWithAuthAndLayout = () => {
  const { data: session } = useSession();

  const userQuery = trpc.user.profile.useQuery(
    { id: session?.user.id ?? '' },
    {
      enabled: !!session?.user.id,
    },
  );

  return (
    <>
      <div>
        {!userQuery.isLoading && (
          <div>
            <div className="flex justify-between">
              <div>
                <div>{userQuery.data?.name}</div>
              </div>

              {userQuery.data?.image && (
                <div className="relative w-20 aspect-square">
                  <Image
                    src={userQuery.data.image}
                    alt={userQuery.data.name ?? 'Profile'}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              )}
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
