import { z } from 'zod';
import { Spieler } from '@prisma/client';
import { t } from '@/server/trpc';
import { isAdmin, isAuthenticated } from '@/server/middleware';

export const einsatzRouter = t.router({
  list: t.procedure
    .use(isAuthenticated)
    .input(z.object({ spielId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.spielereinsatz.findMany({
        where: {
          spielId: input.spielId,
        },
        include: {
          spieler: true,
        },
      });
    }),

  detail: t.procedure
    .use(isAuthenticated)
    .input(z.object({ spielId: z.string(), spielerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const einsatz = await ctx.prisma.spielereinsatz.findUniqueOrThrow({
        where: {
          spielerId_spielId: {
            spielId: input.spielId,
            spielerId: input.spielerId,
          },
        },
      });
      return einsatz;
    }),

  listAvailablePlayers: t.procedure
    .use(isAuthenticated)
    .input(z.object({ spielId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.spieler.findMany({
        where: {
          spielereinsaetze: {
            none: {
              spielId: input.spielId,
            },
          },
          active: true,
        },
      });
    }),

  addByPlayerList: t.procedure
    .use(isAdmin)
    .input(
      z.object({
        names: z.string().array().min(1),
        spielId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const unknown_players: string[] = [];
      const played_players: Spieler[] = [];

      const all_players = await ctx.prisma.spieler.findMany();

      input.names.forEach((name) => {
        const player = all_players.find((player) =>
          player.names.includes(name),
        );

        if (!!player) {
          played_players.push(player);
          return;
        }

        unknown_players.push(name);
      });

      await ctx.prisma.$transaction(
        played_players.map((player) => {
          return ctx.prisma.spielereinsatz.upsert({
            where: {
              spielerId_spielId: {
                spielId: input.spielId,
                spielerId: player.id,
              },
            },
            create: {
              tore: 0,
              bezahlt: false,
              gelbeKarte: 0,
              roteKarte: 0,
              spielId: input.spielId,
              spielerId: player.id,
            },
            update: {},
          });
        }),
      );

      return {
        unknown_players,
      };
    }),

  add: t.procedure
    .use(isAdmin)
    .input(
      z.object({
        spielId: z.string(),
        spielerId: z.string(),
        tore: z.number().min(0).default(0),
        gelbeKarte: z.number().default(0),
        roteKarte: z.number().default(0),
        bezahlt: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.spielereinsatz.create({
        data: input,
      });
    }),

  update: t.procedure
    .use(isAdmin)
    .input(
      z.object({
        spielId: z.string(),
        spielerId: z.string(),
        tore: z.number().min(0).optional(),
        gelbeKarte: z.number().optional(),
        roteKarte: z.number().optional(),
        bezahlt: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { spielId, spielerId } = input;
      return await ctx.prisma.spielereinsatz.update({
        where: {
          spielerId_spielId: {
            spielId,
            spielerId,
          },
        },
        data: input,
      });
    }),

  remove: t.procedure
    .use(isAdmin)
    .input(
      z.object({
        spielId: z.string(),
        spielerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.spielereinsatz.delete({
        where: {
          spielerId_spielId: {
            spielId: input.spielId,
            spielerId: input.spielerId,
          },
        },
      });
    }),
});
