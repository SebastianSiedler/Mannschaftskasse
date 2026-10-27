import { describe, expect, it } from 'vitest';
import { Result } from '@/lib/db/schema';
import { parseScoreString, resolveMatchGoals } from './matchGoals';

describe('parseScoreString', () => {
  it('parses standard scores correctly', () => {
    expect(parseScoreString('3:1')).toEqual({ home: 3, guest: 1 });
    expect(parseScoreString('0:0')).toEqual({ home: 0, guest: 0 });
    expect(parseScoreString('12:10')).toEqual({ home: 12, guest: 10 });
  });

  it('handles suffixes such as "0:2 U"', () => {
    expect(parseScoreString('0:2 U')).toEqual({ home: 0, guest: 2 });
    expect(parseScoreString('3:1 V')).toEqual({ home: 3, guest: 1 });
  });

  it('handles extra whitespace', () => {
    expect(parseScoreString('  4 : 2  ')).toEqual({ home: 4, guest: 2 });
  });

  it('returns null for non-score or invalid inputs', () => {
    expect(parseScoreString('')).toBeNull();
    expect(parseScoreString('n.an.')).toBeNull();
    expect(parseScoreString(null)).toBeNull();
    expect(parseScoreString(undefined)).toBeNull();
    expect(parseScoreString('invalid')).toBeNull();
    expect(parseScoreString('3:')).toBeNull();
    expect(parseScoreString(':1')).toBeNull();
    expect(parseScoreString(123)).toBeNull();
  });
});

describe('resolveMatchGoals', () => {
  const TEAM_ID = 'MY_TEAM_PERM_ID';
  const OTHER_TEAM_ID = 'OTHER_TEAM_PERM_ID';
  const MATCH_ID = 'match-123';

  it('resolves home team goals from bfvData', () => {
    const bfvData = {
      matches: [
        {
          matchId: MATCH_ID,
          homeTeamPermanentId: TEAM_ID,
          guestTeamPermanentId: OTHER_TEAM_ID,
          result: '4:2',
        },
      ],
    };

    const res = resolveMatchGoals({
      bfvMatchId: MATCH_ID,
      bfvData,
      permanentTeamId: TEAM_ID,
    });

    expect(res).toEqual({
      isHome: true,
      bfvOwnGoals: 4,
      bfvOpponentGoals: 2,
    });
  });

  it('resolves guest team goals from bfvData', () => {
    const bfvData = {
      matches: [
        {
          matchId: MATCH_ID,
          homeTeamPermanentId: OTHER_TEAM_ID,
          guestTeamPermanentId: TEAM_ID,
          result: '1:3',
        },
      ],
    };

    const res = resolveMatchGoals({
      bfvMatchId: MATCH_ID,
      bfvData,
      permanentTeamId: TEAM_ID,
    });

    expect(res).toEqual({
      isHome: false,
      bfvOwnGoals: 3,
      bfvOpponentGoals: 1,
    });
  });

  it('handles bfvData result with suffix like "0:2 U"', () => {
    const bfvData = {
      matches: [
        {
          matchId: MATCH_ID,
          homeTeamPermanentId: OTHER_TEAM_ID,
          guestTeamPermanentId: TEAM_ID,
          result: '0:2 U',
        },
      ],
    };

    const res = resolveMatchGoals({
      bfvMatchId: MATCH_ID,
      bfvData,
      permanentTeamId: TEAM_ID,
    });

    expect(res).toEqual({
      isHome: false,
      bfvOwnGoals: 2,
      bfvOpponentGoals: 0,
    });
  });

  it('falls back to DB spiel.result and resultType when bfvData is missing', () => {
    const resWin = resolveMatchGoals({
      bfvMatchId: MATCH_ID,
      bfvData: null,
      fallbackResult: '4:1',
      fallbackResultType: Result.GEWONNEN,
      permanentTeamId: TEAM_ID,
    });

    expect(resWin).toEqual({
      isHome: null,
      bfvOwnGoals: 4,
      bfvOpponentGoals: 1,
    });

    const resLoss = resolveMatchGoals({
      bfvMatchId: MATCH_ID,
      bfvData: null,
      fallbackResult: '0:3',
      fallbackResultType: Result.VERLOREN,
      permanentTeamId: TEAM_ID,
    });

    expect(resLoss).toEqual({
      isHome: null,
      bfvOwnGoals: 0,
      bfvOpponentGoals: 3,
    });

    const resDraw = resolveMatchGoals({
      bfvMatchId: MATCH_ID,
      bfvData: null,
      fallbackResult: '2:2',
      fallbackResultType: Result.UNENTSCHIEDEN,
      permanentTeamId: TEAM_ID,
    });

    expect(resDraw).toEqual({
      isHome: null,
      bfvOwnGoals: 2,
      bfvOpponentGoals: 2,
    });
  });

  it('handles unplayed or invalid games gracefully', () => {
    const res = resolveMatchGoals({
      bfvMatchId: MATCH_ID,
      bfvData: {
        matches: [
          {
            matchId: MATCH_ID,
            homeTeamPermanentId: TEAM_ID,
            result: '',
          },
        ],
      },
      fallbackResult: null,
      fallbackResultType: Result.AUSSTEHEND,
      permanentTeamId: TEAM_ID,
    });

    expect(res).toEqual({
      isHome: null,
      bfvOwnGoals: null,
      bfvOpponentGoals: null,
    });
  });

  it('handles corrupted bfvData gracefully without throwing', () => {
    const res = resolveMatchGoals({
      bfvMatchId: MATCH_ID,
      bfvData: { invalid: true, matches: 'not an array' },
      permanentTeamId: TEAM_ID,
    });

    expect(res).toEqual({
      isHome: null,
      bfvOwnGoals: null,
      bfvOpponentGoals: null,
    });
  });
});
