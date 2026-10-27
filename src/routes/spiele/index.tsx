import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { spieleListQueryOptions } from '@/server/functions/spiele';
import { DefaultLayout } from '@/src/components/DefaultLayout';
import ListSpiele from '@/src/components/Spiel/ListSpiele';
import SingleMatch from '@/src/components/Spiel/SingleMatch';

const spieleSearchSchema = z.object({
  spielId: z.string().optional(),
  spielerId: z.string().optional(),
});

export const Route = createFileRoute('/spiele/')({
  validateSearch: spieleSearchSchema,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(spieleListQueryOptions());
  },
  component: SpieleHome,
});

function SpieleHome() {
  const { spielId, spielerId } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <DefaultLayout>
      <div>
        <ListSpiele />

        {!!spielId && (
          <SingleMatch
            spielId={spielId}
            spielerId={spielerId}
            open={!!spielId}
            handleClose={() => {
              navigate({ to: '/spiele', replace: true });
            }}
          />
        )}
      </div>
    </DefaultLayout>
  );
}
