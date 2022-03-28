import { Context } from '@/server/context';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { BfvLeague, BfvMatch } from './bfv.types';
import { serverEnv } from '@/env/server';
import { prisma } from '@/lib/prisma';

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

  await Promise.all(
    data.matches.map(
      async (match) =>
        await upsertMatch({ bfvMatch: match, saisonId: saison!.id }),
    ),
  );

  // for (const match of data.matches) {
  //   await upsertMatch({ bfvMatch: match, saisonId: saison.id });
  // }
};

const getTeamByBfvPermanentId = async (
  permanentTeamId: string,
  teamName: string,
) => {
  const teamId = await prisma.team.findUnique({
    where: {
      bfvTeamPermanentId: permanentTeamId,
    },
  });

  if (!teamId) {
    const { data } = await getBfvClubInfo(permanentTeamId);

    if (!data?.club) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No corresponding bfv club to team found',
      });
    }

    return await prisma.team.create({
      data: {
        bfvTeamPermanentId: permanentTeamId,
        name: teamName,
        bfvClubId: data.club.id,
        logo: data.club.logoUrl,
      },
    });
  }

  return teamId;
};

interface UpsertMatchopts {
  bfvMatch: BfvMatch;
  saisonId: string;
}

const upsertMatch = async (opts: UpsertMatchopts) => {
  const { bfvMatch, saisonId } = opts;
  const match = await prisma.spiel.findUnique({
    where: {
      bfvMatchId: bfvMatch.matchId,
    },
  });

  if (match === null) {
    const [homeTeam, guestTeam] = await Promise.all([
      await getTeamByBfvPermanentId(
        bfvMatch.homeTeamPermanentId,
        bfvMatch.homeTeamName,
      ),
      await getTeamByBfvPermanentId(
        bfvMatch.guestTeamPermanentId,
        bfvMatch.guestTeamName,
      ),
    ]);

    return await prisma.spiel.create({
      data: {
        saisonId: saisonId,
        kickoffDate: getParsedDate(bfvMatch.kickoffDate, bfvMatch.kickoffTime),
        result: bfvMatch.result,
        homeTeamId: homeTeam.id,
        guestTeamId: guestTeam.id,
        bfvMatchId: bfvMatch.matchId,
      },
    });
  } else {
    await prisma.spiel.update({
      where: {
        id: match.id,
      },
      data: {
        kickoffDate: getParsedDate(bfvMatch.kickoffDate, bfvMatch.kickoffTime),
        result: bfvMatch.result,
      },
    });
  }
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
