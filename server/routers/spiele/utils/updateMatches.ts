import { isDeepStrictEqual } from 'node:util';
import { bfvApi, type Schemas } from 'bfv-api';
import { eq } from 'drizzle-orm';
import { serverEnv } from '@/env/server';
import { db, type Spiel, saisons, spiele, teams } from '@/lib/db';
import { getOpponentTeam, getParsedDate, parse_result } from '.';

type BfvMatch = Schemas['Match'];
type BfvMatchesData = Awaited<ReturnType<typeof bfvApi.listMatches>>['data'];

const BFV_SYNC_COOLDOWN_MS = 15 * 60 * 1000;

export async function syncMatchesWithBfv(options?: {
  force?: boolean;
  bypassCooldown?: boolean;
}) {
  const saison = await db.query.saisons.findFirst({
    where: eq(saisons.latest, true),
  });

  if (!saison) {
    await updateMatches();
    return 'first RQ' as const;
  }

  const rawBfvData = (saison.bfvData ?? {}) as Record<string, any>;
  const { _lastCheckedAt, ...previousBfvData } = rawBfvData;

  if (
    !options?.force &&
    !options?.bypassCooldown &&
    typeof _lastCheckedAt === 'number' &&
    Date.now() - _lastCheckedAt < BFV_SYNC_COOLDOWN_MS
  ) {
    return 'Nothing to update' as const;
  }

  const { BFV_PERMANENT_TEAM_ID } = serverEnv;

  const { data } = await bfvApi.listMatches({
    params: { teamPermanentId: BFV_PERMANENT_TEAM_ID },
  });

  if (!isDeepStrictEqual(previousBfvData, data) || options?.force) {
    await updateMatches(data);
    return 'data changed' as const;
  }

  await db
    .update(saisons)
    .set({
      bfvData: {
        ...data,
        _lastCheckedAt: Date.now(),
      },
    })
    .where(eq(saisons.id, saison.id));

  return 'Nothing to update' as const;
}

export const updateMatches = async (prefetchedData?: BfvMatchesData) => {
  const { BFV_PERMANENT_TEAM_ID } = serverEnv;

  const data =
    prefetchedData ??
    (
      await bfvApi.listMatches({
        params: { teamPermanentId: BFV_PERMANENT_TEAM_ID },
      })
    ).data;

  const bfvDataWithTimestamp = {
    ...data,
    _lastCheckedAt: Date.now(),
  };

  let saison = await db.query.saisons.findFirst({
    where: eq(saisons.bfvCompoundID, data.team.compoundId),
  });

  if (!saison) {
    await db
      .update(saisons)
      .set({ latest: false })
      .where(eq(saisons.latest, true));

    const [createdSaison] = await db
      .insert(saisons)
      .values({
        name: data.team.seasonId,
        bfvCompoundID: data.team.compoundId,
        latest: true,
        bfvData: bfvDataWithTimestamp,
      })
      .returning();

    saison = createdSaison;
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
    throw new Error("Couldn't find a game for bfvActualMatchId");
  }

  const [updated_saison] = await db
    .update(saisons)
    .set({
      currentSpielId: currentMatch.id,
      bfvData: bfvDataWithTimestamp,
    })
    .where(eq(saisons.id, saison.id))
    .returning();

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

  const match = await db.query.spiele.findFirst({
    where: eq(spiele.bfvMatchId, bfvMatch.matchId),
  });

  /* Create new Game in DB */
  if (!match) {
    const [opponent] = await db
      .insert(teams)
      .values({
        bfvTeamPermanentId: opponent_team.teamPermanentId,
        bfvClubId: opponent_team.clubId,
        name: opponent_team.teamName,
      })
      .onConflictDoUpdate({
        target: teams.bfvTeamPermanentId,
        set: {
          bfvClubId: opponent_team.clubId,
          name: opponent_team.teamName,
        },
      })
      .returning();

    const [created] = await db
      .insert(spiele)
      .values({
        saisonId: saisonId,
        bfvMatchId: bfvMatch.matchId,
        kickoffDate: getParsedDate(bfvMatch.kickoffDate, bfvMatch.kickoffTime),
        result: parsed_result.result,
        resultType: parsed_result.type,
        opponentTeamId: opponent.id,
      })
      .returning();

    return created;
  }

  /* Update existing Game */
  const [updated] = await db
    .update(spiele)
    .set({
      kickoffDate: getParsedDate(bfvMatch.kickoffDate, bfvMatch.kickoffTime),
      result: parsed_result.result,
      resultType: parsed_result.type,
    })
    .where(eq(spiele.id, match.id))
    .returning();

  return updated;
};
