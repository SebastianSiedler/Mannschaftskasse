import { serverEnv } from '@/env/server';
import { BfvMatch } from './bfv.types';

const isHomeTeam = (match: BfvMatch) => {
  const BFV_PERMANENT_TEAM_ID = serverEnv.BFV_PERMANENT_TEAM_ID;
  return BFV_PERMANENT_TEAM_ID == match.homeTeamPermanentId;
};

enum Result {
  'NICHT_ANGETRETEN',
  'GEWONNEN',
  'VERLOREN',
  'UNENTSCHIEDEN',
  'AUSSTEHEND',
  'NICHT_ANGETRETEN_GEGNER',
}

export const parse_result = (match: BfvMatch) => {
  const { result } = match;
  if (result === 'n.an.') {
    return {
      type: Result.NICHT_ANGETRETEN,
    };
  }

  if (result === '') {
    return {
      type: Result.AUSSTEHEND,
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

  if (isHomeTeam(match)) {
    if (heim_score > guest_score) {
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
  }
};
