import { TRPCError } from '@trpc/server';
import { serverEnv } from '@/env/server';
import { prisma } from '@/lib/prisma';
import { getOpponentTeam, getParsedDate, parse_result } from '.';
import { Prisma, Spiel } from '@prisma/client';
import { bfvApi } from 'bfv-api';
import type { Schemas } from 'bfv-api';

type BfvMatch = Schemas['Match'];

export const updateMatches = async () => {
  const { BFV_PERMANENT_TEAM_ID } = serverEnv;

  const { data } = await bfvApi.listMatches({
    params: { teamPermanentId: BFV_PERMANENT_TEAM_ID },
  });

  let saison = await prisma.saison.findUnique({
    where: {
      bfvCompoundID: data.team.compoundId,
    },
  });

  if (!saison) {
    await prisma.saison.updateMany({
      where: { latest: true },
      data: { latest: false },
    });

    saison = await prisma.saison.create({
      data: {
        name: data.team.seasonId,
        bfvCompoundID: data.team.compoundId,
        latest: true,
        bfvData: data as unknown as Prisma.JsonObject,
      },
    });
  }

  const matches = await Promise.all(
    data.matches.map(
      async (match) =>
        await upsertMatch({ bfvMatch: match, saisonId: saison!.id }),
    ),
  );

  const currentMatch = matches
    .filter((match): match is Spiel => !!match) // remove nulls
    .find((match) => match.bfvMatchId === data.actualMatchId);

  if (!currentMatch) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: "Couldn't find a game for bfvActualMatchId",
    });
  }

  const updated_saison = await prisma.saison.update({
    where: {
      id: saison.id,
    },
    data: {
      currentSpielId: currentMatch.id,
      bfvData: data as unknown as Prisma.JsonObject,
    },
  });

  return updated_saison;
};

interface UpsertMatchopts {
  bfvMatch: BfvMatch;
  saisonId: string;
}

const upsertMatch = async (opts: UpsertMatchopts) => {
  const { bfvMatch, saisonId } = opts;

  /**
   * If the kickoffDate or kickoffTime is null, the game is not scheduled yet
   */
  if (bfvMatch.kickoffDate === null || bfvMatch.kickoffTime === null) {
    return;
  }

  const parsed_result = parse_result(bfvMatch);
  const opponent_team = getOpponentTeam(bfvMatch);

  if (opponent_team === null) return;

  const match = await prisma.spiel.findUnique({
    where: {
      bfvMatchId: bfvMatch.matchId,
    },
  });

  /* Create new Game in DB */
  if (match === null) {
    const opponent = await prisma.team.upsert({
      where: {
        bfvTeamPermanentId: opponent_team.teamPermanentId,
      },
      update: {
        bfvTeamPermanentId: opponent_team.teamPermanentId,
        bfvClubId: opponent_team.clubId,
        name: opponent_team.teamName,
      },
      create: {
        bfvTeamPermanentId: opponent_team.teamPermanentId,
        bfvClubId: opponent_team.clubId,
        name: opponent_team.teamName,
      },
    });

    return await prisma.spiel.create({
      data: {
        saisonId: saisonId,
        bfvMatchId: bfvMatch.matchId,

        kickoffDate: getParsedDate(bfvMatch.kickoffDate, bfvMatch.kickoffTime),

        result: parsed_result.result,
        resultType: parsed_result.type,

        opponentTeamId: opponent.id,
      },
    });
  }

  /* Update existing Game */
  return await prisma.spiel.update({
    where: {
      id: match.id,
    },
    data: {
      kickoffDate: getParsedDate(bfvMatch.kickoffDate, bfvMatch.kickoffTime),
      result: parsed_result.result,
      resultType: parsed_result.type,
    },
  });
};
