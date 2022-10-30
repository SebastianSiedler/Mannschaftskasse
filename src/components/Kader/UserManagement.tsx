import Button from '@mui/material/Button';
import Image from 'next/legacy/image';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';

const UserManagement: React.FC = () => {
  const allUsersQuery = trpc.user.list.useQuery(undefined, {
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const changeUserPermission = trpc.user.changeRole.useMutation({
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
      {allUsersQuery.status === 'loading' && <div>Loading...</div>}

      {allUsersQuery.data?.map((item) => (
        <div key={item.id}>
          {/* Name and Mail */}
          <div className="flex gap-4">
            <div className="relative w-12 h-12">
              {item.image ? (
                <Image
                  src={item.image}
                  layout="fill" // required
                  objectFit="cover" // change to suit your needs
                  className="rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
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
