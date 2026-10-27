import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { asc, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { db, users } from '@/lib/db';

export const getUserProfileFn = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async ({ data: input }) => {
    await requireAuth();
    const { id } = input;
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        name: true,
        image: true,
      },
    });

    if (!user) {
      throw new Error(`No profile with id '${id}'`);
    }

    return user;
  });

export const listUsersFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await requireAdmin();
    return await db.query.users.findMany({
      where: session?.user.id ? ne(users.id, session.user.id) : undefined,
      orderBy: [asc(users.name)],
    });
  },
);

export const changeUserRoleFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      userId: z.string(),
      admin: z.boolean(),
    }),
  )
  .handler(async ({ data: input }) => {
    await requireAdmin();
    const [updated] = await db
      .update(users)
      .set({
        role: input.admin ? 'ADMIN' : 'USER',
      })
      .where(eq(users.id, input.userId))
      .returning();

    return updated;
  });

export const userProfileQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['user', 'profile', id] as const,
    queryFn: () => getUserProfileFn({ data: { id } }),
  });

export const usersListQueryOptions = () =>
  queryOptions({
    queryKey: ['user', 'list'] as const,
    queryFn: () => listUsersFn(),
  });
