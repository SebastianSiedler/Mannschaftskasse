import { createFileRoute, Outlet } from '@tanstack/react-router';
import { spieleListQueryOptions } from '@/server/functions/spiele';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import ListSpiele from '@/src/components/Spiel/ListSpiele';

export const Route = createFileRoute('/spiele')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(spieleListQueryOptions());
  },
  component: SpieleLayout,
});

function SpieleLayout() {
  return (
    <DefaultLayout>
      <div>
        <ListSpiele />
        <Outlet />
      </div>
    </DefaultLayout>
  );
}
