import { Context } from '@/server/context';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { BfvLeague, BfvMatch } from './bfv.types';
import { serverEnv } from '@/env/server';
import { prisma } from '@/lib/prisma';
import { getOpponentTeam, parse_result } from '.';

const { BFV_PERMANENT_TEAM_ID } = serverEnv;

/**
 * Get aktuelle Saison alle Spiele vom BFV
 */
const getBfvData = async (permanentTeamId: string) => {
  const { data } = await axios.get<BfvLeague>(
    `https://widget-prod.bfv.de/api/service/widget/v1/team/${permanentTeamId}/matches`,
  );
  return data.data;
};

export const updateMatches = async () => {
  const data = await getBfvData(BFV_PERMANENT_TEAM_ID);

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
      },
    });
  }

  const matches = await Promise.all(
    data.matches.map(
      async (match) =>
        await upsertMatch({ bfvMatch: match, saisonId: saison!.id }),
    ),
  );

  const currentMatch = matches.find(
    (match) => match.bfvMatchId === data.actualMatchId,
  );

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
      lastBfvUpdate: new Date(),
      currentSpielId: currentMatch.id,
    },
  });

  return updated_saison;
};

// const getTeamByBfvPermanentId = async (
//   permanentTeamId: string,
//   teamName: string,
// ) => {
//   const team = await prisma.team.findUnique({
//     where: {
//       bfvTeamPermanentId: permanentTeamId,
//     },
//   });

//   if (!team) {
//     const { data } = await getBfvClubInfo(permanentTeamId);

//     if (!data?.club) {
//       throw new TRPCError({
//         code: 'NOT_FOUND',
//         message: 'No corresponding bfv club to team found',
//       });
//     }

//     return await prisma.team.create({
//       data: {
//         bfvTeamPermanentId: permanentTeamId,
//         name: teamName,
//         bfvClubId: data.club.id,
//         logo: data.club.logoUrl,
//       },
//     });
//   }

//   return team;
// };

interface UpsertMatchopts {
  bfvMatch: BfvMatch;
  saisonId: string;
}

const upsertMatch = async (opts: UpsertMatchopts) => {
  const { bfvMatch, saisonId } = opts;

  const parsed_result = parse_result(bfvMatch);
  const opponent_team = getOpponentTeam(bfvMatch);

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

const getParsedDate = (date: string, time: string) => {
  const [day, month, year] = date.split('.');
  return new Date(`${year}.${month}.${day} ${time}`);
};

export const getBfvClubInfo = async (teamPermanentId: string) => {
  interface BfvClubinfo {
    data?: {
      club: {
        id: string;
        name: string;
        logoUrl: string;
      };
    };
  }
  const { data } = await axios.get<BfvClubinfo>(
    `https://widget-prod.bfv.de/api/service/widget/v1/club/info?teamPermanentId=${teamPermanentId}`,
  );

  return data;
};
