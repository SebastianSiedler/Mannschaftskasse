import { serverEnv } from '@/env/server';
import { db, saisons, spiele, teams, type Spiel } from '@/lib/db';
import { bfvApi, type Schemas } from 'bfv-api';
import { eq } from 'drizzle-orm';
import { getOpponentTeam, getParsedDate, parse_result } from '.';

type BfvMatch = Schemas['Match'];

export const updateMatches = async () => {
  const { BFV_PERMANENT_TEAM_ID } = serverEnv;

  const { data } = await bfvApi.listMatches({
    params: { teamPermanentId: BFV_PERMANENT_TEAM_ID },
  });

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
        bfvData: data,
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
      bfvData: data,
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
