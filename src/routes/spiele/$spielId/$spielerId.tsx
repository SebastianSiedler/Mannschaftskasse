import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { spieleListQueryOptions } from '@/server/functions/spiele';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import ListSpiele from '@/src/components/Spiel/ListSpiele';
import SingleMatch from '@/src/components/Spiel/SingleMatch';

export const Route = createFileRoute('/spiele/$spielId/$spielerId')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(spieleListQueryOptions());
  },
  component: SpielPlayerEinsatzPage,
});

function SpielPlayerEinsatzPage() {
  const { spielId, spielerId } = Route.useParams();
  const navigate = useNavigate();

  return (
    <DefaultLayout>
      <div>
        <ListSpiele />
        <SingleMatch
          spielId={spielId}
          spielerId={spielerId}
          open
          handleClose={() => {
            navigate({ to: '/spiele', replace: true });
          }}
        />
      </div>
    </DefaultLayout>
  );
}
