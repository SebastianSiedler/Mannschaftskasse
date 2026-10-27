import { createFileRoute, useNavigate } from '@tanstack/react-router';
import SingleMatch from '@/src/components/Spiel/SingleMatch';

export const Route = createFileRoute('/spiele/$spielId')({
  component: SpielDetailPage,
});

function SpielDetailPage() {
  const { spielId } = Route.useParams();
  const navigate = useNavigate();

  return (
    <SingleMatch
      spielId={spielId}
      open
      handleClose={() => {
        navigate({ to: '/spiele', replace: true, resetScroll: false });
      }}
    />
  );
}
