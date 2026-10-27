import { spieleListQueryOptions } from '@/server/functions/spiele';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import ListSpiele from '@/src/components/Spiel/ListSpiele';
import SingleMatch from '@/src/components/Spiel/SingleMatch';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/spiele/$spielId/')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(spieleListQueryOptions());
  },
  component: SpielDetailPage,
});

function SpielDetailPage() {
  const { spielId } = Route.useParams();
  const navigate = useNavigate();

  return (
    <DefaultLayout>
      <div>
        <ListSpiele />
        <SingleMatch
          spielId={spielId}
          open
          handleClose={() => {
            navigate({ to: '/spiele', replace: true });
          }}
        />
      </div>
    </DefaultLayout>
  );
}
