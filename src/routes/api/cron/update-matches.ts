import { createFileRoute } from '@tanstack/react-router';
import { syncMatchesWithBfv } from '@/server/routers/spiele/utils/updateMatches';

export const Route = createFileRoute('/api/cron/update-matches')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret) {
          const authHeader = request.headers.get('authorization');
          if (authHeader !== `Bearer ${cronSecret}`) {
            return new Response('Unauthorized', { status: 401 });
          }
        }

        const status = await syncMatchesWithBfv({ bypassCooldown: true });
        return Response.json({ ok: true, status });
      },
    },
  },
});
