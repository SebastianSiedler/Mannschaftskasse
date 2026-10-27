import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { ne } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { db, spieler } from '@/lib/db';

export const listSpielerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin();
    return await db.query.spieler.findMany();
  },
);

export const upsertSpielerFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      names: z.string().min(2).array().min(1),
      spielerId: z.string().optional(),
      active: z.boolean(),
    }),
  )
  .handler(async ({ data: input }) => {
    await requireAdmin();

    if (input.names.length !== new Set(input.names).size) {
      throw new Error('Namen enthalten Dublikate!');
    }

    const isExistingId = !!input.spielerId && input.spielerId !== '-1';

    const existingPlayers = await db.query.spieler.findMany({
      where: isExistingId ? ne(spieler.id, input.spielerId!) : undefined,
      columns: { names: true },
    });
    const flat_spieler = existingPlayers.flatMap((s) => s.names);

    for (const name of input.names) {
      if (flat_spieler.includes(name)) {
        throw new Error(`${name} ist bereits vergeben!`);
      }
    }

    if (isExistingId) {
      const [updated] = await db
        .insert(spieler)
        .values({
          id: input.spielerId!,
          active: input.active,
          names: input.names,
        })
        .onConflictDoUpdate({
          target: spieler.id,
          set: {
            active: input.active,
            names: input.names,
          },
        })
        .returning();

      return updated;
    }

    const [created] = await db
      .insert(spieler)
      .values({
        active: input.active,
        names: input.names,
      })
      .returning();

    return created;
  });

export const spielerListQueryOptions = () =>
  queryOptions({
    queryKey: ['spieler', 'list'] as const,
    queryFn: () => listSpielerFn(),
  });
