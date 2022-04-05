import { createRouter } from 'server/createRouter';
import { z } from 'zod';
import { createAdminRouter } from '@/server/create-admin-router';
import { Spieler } from '@prisma/client';

export const einsatzRouter = createRouter()
  .query('list', {
    input: z.object({ spielId: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.spielereinsatz.findMany({
        where: {
          spielId: input.spielId,
        },
        include: {
          spieler: true,
        },
      });
    },
  })
  .query('detail', {
    input: z.object({ spielId: z.string(), spielerId: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.spielereinsatz.findUnique({
        where: {
          spielerId_spielId: {
            spielId: input.spielId,
            spielerId: input.spielerId,
          },
        },
      });
    },
  })
  .query('list.availablePlayers', {
    input: z.object({ spielId: z.string() }),
    async resolve({ ctx, input }) {
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
    },
  })

  /* Admin Only routes*/
  .merge(
    '',
    createAdminRouter()
      .mutation('add_by_player_list', {
        input: z.object({
          names: z.string().array().min(1),
          spielId: z.string(),
        }),
        async resolve({ input, ctx }) {
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
        },
      })
      .mutation('add', {
        input: z.object({
          spielId: z.string(),
          spielerId: z.string(),
          tore: z.number().min(0).default(0),
          gelbeKarte: z.number().default(0),
          roteKarte: z.number().default(0),
          bezahlt: z.boolean().default(false),
        }),
        async resolve({ input, ctx }) {
          return await ctx.prisma.spielereinsatz.create({
            data: input,
          });
        },
      })
      .mutation('update', {
        input: z.object({
          spielId: z.string(),
          spielerId: z.string(),
          tore: z.number().min(0).optional(),
          gelbeKarte: z.number().optional(),
          roteKarte: z.number().optional(),
          bezahlt: z.boolean().optional(),
        }),
        async resolve({ ctx, input }) {
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
        },
      })
      .mutation('remove', {
        input: z.object({
          spielId: z.string(),
          spielerId: z.string(),
        }),
        async resolve({ ctx, input }) {
          return await ctx.prisma.spielereinsatz.delete({
            where: {
              spielerId_spielId: {
                spielId: input.spielId,
                spielerId: input.spielerId,
              },
            },
          });
        },
      }),
  );
