import { z } from 'zod';
import { Result } from '@/lib/db/schema';

export const bfvScoreStringSchema = z
  .string()
  .trim()
  .transform((val, ctx) => {
    const match = val.match(/^(\d+)\s*:\s*(\d+)/);
    if (!match) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid score format',
      });
      return z.NEVER;
    }
    const home = Number.parseInt(match[1], 10);
    const guest = Number.parseInt(match[2], 10);
    if (Number.isNaN(home) || Number.isNaN(guest)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Score numbers are NaN',
      });
      return z.NEVER;
    }
    return { home, guest };
  });

export const bfvMatchItemSchema = z.object({
  matchId: z.string(),
  homeTeamPermanentId: z.string(),
  guestTeamPermanentId: z.string().optional(),
  result: z.string().nullable().optional(),
});

export const bfvDataSchema = z
  .object({
    matches: z.array(bfvMatchItemSchema).optional(),
  })
  .passthrough();

export type BfvMatchItem = z.infer<typeof bfvMatchItemSchema>;

export interface ResolveMatchGoalsInput {
  bfvMatchId: string;
  bfvData?: unknown;
  fallbackResult?: string | null;
  fallbackResultType?: Result | null;
  permanentTeamId: string;
}

export interface ResolvedMatchGoals {
  bfvOwnGoals: number | null;
  bfvOpponentGoals: number | null;
  isHome: boolean | null;
}

export function parseScoreString(
  rawScore: unknown,
): { home: number; guest: number } | null {
  const parsed = bfvScoreStringSchema.safeParse(rawScore);
  return parsed.success ? parsed.data : null;
}

export function resolveMatchGoals(
  input: ResolveMatchGoalsInput,
): ResolvedMatchGoals {
  const {
    bfvMatchId,
    bfvData,
    fallbackResult,
    fallbackResultType,
    permanentTeamId,
  } = input;

  const parsedBfvData = bfvDataSchema.safeParse(bfvData);
  const bfvMatch = parsedBfvData.success
    ? parsedBfvData.data.matches?.find((m) => m.matchId === bfvMatchId)
    : undefined;

  if (bfvMatch?.result) {
    const parsedScore = parseScoreString(bfvMatch.result);
    if (parsedScore) {
      const isHome = bfvMatch.homeTeamPermanentId === permanentTeamId;
      return {
        isHome,
        bfvOwnGoals: isHome ? parsedScore.home : parsedScore.guest,
        bfvOpponentGoals: isHome ? parsedScore.guest : parsedScore.home,
      };
    }
  }

  // Fallback to DB spiel.result and resultType
  if (fallbackResult) {
    const fallbackScore = parseScoreString(fallbackResult);
    if (fallbackScore) {
      const { home: scoreA, guest: scoreB } = fallbackScore;
      if (fallbackResultType === Result.UNENTSCHIEDEN) {
        return {
          isHome: null,
          bfvOwnGoals: scoreA,
          bfvOpponentGoals: scoreB,
        };
      }
      if (fallbackResultType === Result.GEWONNEN) {
        return {
          isHome: null,
          bfvOwnGoals: Math.max(scoreA, scoreB),
          bfvOpponentGoals: Math.min(scoreA, scoreB),
        };
      }
      if (fallbackResultType === Result.VERLOREN) {
        return {
          isHome: null,
          bfvOwnGoals: Math.min(scoreA, scoreB),
          bfvOpponentGoals: Math.max(scoreA, scoreB),
        };
      }
    }
  }

  return {
    isHome: null,
    bfvOwnGoals: null,
    bfvOpponentGoals: null,
  };
}
