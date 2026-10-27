import Skeleton from '@mui/material/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AuthGuard, signOut, useSession } from '@/lib/auth-client';
import { userProfileQueryOptions } from '@/server/functions/user';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: session } = useSession();

  const userQuery = useQuery({
    ...userProfileQueryOptions(session?.user.id ?? ''),
    enabled: !!session?.user.id,
  });

  return (
    <AuthGuard>
      <div>
        {userQuery.isLoading ? (
          <div className="flex justify-between items-center p-4">
            <Skeleton variant="text" width={160} height={28} />
            <Skeleton variant="circular" width={80} height={80} />
          </div>
        ) : (
          <div>
            <div className="flex justify-between">
              <div>
                <div>{userQuery.data?.name}</div>
              </div>

              {userQuery.data?.image && (
                <div className="relative w-20 aspect-square">
                  <img
                    src={userQuery.data.image}
                    alt={userQuery.data.name ?? 'Profile'}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <button onClick={() => signOut()}>Sign out</button>{' '}
      </div>
    </AuthGuard>
  );
}
