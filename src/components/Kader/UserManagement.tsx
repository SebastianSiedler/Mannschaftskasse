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
        <div
          key={item.id}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div
              style={{
                aspectRatio: '1/1',
                width: 50,
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden',
              }}
            >
              {item.image ? (
                <Image src={item.image} layout="fill" />
              ) : (
                <div
                  style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'gray',
                  }}
                ></div>
              )}
            </div>
            <div>
              <div>{item.name}</div>
              <div>{item.email}</div>
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
      ))}
    </div>
  );
};
export default UserManagement;
