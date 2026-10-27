import {
  changeUserRoleFn,
  usersListQueryOptions,
} from '@/server/functions/user';
import Button from '@mui/material/Button';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const UserManagement: React.FC = () => {
  const allUsersQuery = useQuery(usersListQueryOptions());

  const changeUserPermission = useMutation({
    mutationFn: (input: { userId: string; admin: boolean }) =>
      changeUserRoleFn({ data: input }),
    onSuccess: () => {
      allUsersQuery.refetch();
      toast.success('Rolle geändert');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return (
    <div>
      {allUsersQuery.isLoading && <div>Loading...</div>}

      {allUsersQuery.data?.map((item) => (
        <div key={item.id}>
          <div className="flex gap-4">
            <div className="relative w-12 h-12">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name ?? 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-full"></div>
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
