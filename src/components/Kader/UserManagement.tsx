import Button from '@mui/material/Button';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';

const UserManagement: React.FC = () => {
  const { data } = useSession();
  const allUsersQuery = trpc.useQuery(['user.list'], {
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const changeUserPermission = trpc.useMutation('user.changeRole', {
    onSuccess: () => {
      allUsersQuery.refetch();
      toast.success('Rolle geändert');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div>
      {allUsersQuery.data?.map((item) => (
        <div key={item.id}>
          {/* Name and Mail */}
          <div className="flex gap-4">
            <div className="w-12 h-12 relative">
              {item.image ? (
                <Image
                  src={item.image}
                  layout="fill" // required
                  objectFit="cover" // change to suit your needs
                  className="rounded-full"
                />
              ) : (
                <div className="h-full w-full bg-gray-200"></div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden whitespace-nowrap text-ellipsis">
                <span>{item.name}</span>
              </div>
              <div className="overflow-hidden whitespace-nowrap text-ellipsis">
                <span>{item.email}</span>
              </div>
            </div>

            <div>
              <Button
                onClick={() => {
                  if (
                    window.confirm(
                      `${item.name} Rolle wirklich zu ${
                        item.role === 'USER' ? 'Admin' : 'User'
                      } ändern? `,
                    )
                  ) {
                    changeUserPermission.mutate({
                      userId: item.id,
                      admin: item.role === 'USER',
                    });
                  }
                }}
              >
                {item.role === 'USER' ? 'Zu Admin' : 'Zu User'}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default UserManagement;
