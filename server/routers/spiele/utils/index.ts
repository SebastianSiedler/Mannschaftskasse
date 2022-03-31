import { serverEnv } from '@/env/server';
import { BfvMatch } from './bfv.types';

const isHomeTeam = (match: BfvMatch) => {
  const BFV_PERMANENT_TEAM_ID = serverEnv.BFV_PERMANENT_TEAM_ID;
  return BFV_PERMANENT_TEAM_ID == match.homeTeamPermanentId;
};

import { Result } from '@prisma/client';

interface ParsedResult {
  type: Result;
  result: string | null;
}

export const parse_result = (match: BfvMatch): ParsedResult => {
  const { result } = match;
  if (result === 'n.an.') {
    return {
      type: Result.NICHT_ANGETRETEN,
      result: null,
    };
  }

  if (result === '') {
    return {
      type: Result.AUSSTEHEND,
      result: null,
    };
  }

  /* "0:2 U" -> [0, 2] */
  const [heim_score, guest_score] = result
    .split(' ')[0]
    .split(':')
    .map((x) => {
      if (isNaN(Number(x))) {
        throw 'Invalid score given';
      }
      return Number(x);
    });

  if (heim_score === guest_score) {
    return {
      result,
      type: Result.UNENTSCHIEDEN,
    };
  }

  if (isHomeTeam(match) && heim_score > guest_score) {
    return {
      type: Result.GEWONNEN,
      result,
    };
  } else if (!isHomeTeam(match) && heim_score < guest_score) {
    return {
      type: Result.GEWONNEN,
      result,
    };
  } else {
    return {
      result,
      type: Result.VERLOREN,
    };
  }
};

interface OpponentTeam {
  teamPermanentId: string;
  teamName: string;
  clubId: string;
}
export const getOpponentTeam = (match: BfvMatch): OpponentTeam => {
  if (isHomeTeam(match)) {
    return {
      teamPermanentId: match.guestTeamPermanentId,
      teamName: match.guestTeamName,
      clubId: match.guestClubId,
    };
  } else {
    return {
      teamPermanentId: match.homeTeamPermanentId,
      teamName: match.homeTeamName,
      clubId: match.homeClubId,
    };
  }
};
