export interface PlayerRecord {
  id: string;
  names: string[];
}

export interface MatchPlayerListResult {
  matchedPlayers: PlayerRecord[];
  unknownNames: string[];
}

/**
 * Normalizes a name string by trimming, removing common list bullet markers,
 * and converting to lower case for case-insensitive matching.
 */
export function normalizeName(name: string): string {
  return name
    .replace(/^[\s\-•*~–—]+/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Matches input names against all available players.
 * - Deduplicates matched players by player.id so duplicate names do not crash database batch insert.
 * - Compares names case-insensitively and trimmed.
 * - Returns unique matched players and unique unknown names.
 */
export function matchPlayerList(
  inputNames: string[],
  allPlayers: PlayerRecord[],
): MatchPlayerListResult {
  const matchedPlayersMap = new Map<string, PlayerRecord>();
  const unknownNamesSet = new Set<string>();

  for (const rawName of inputNames) {
    const trimmedRaw = rawName.trim();
    const normalizedInput = normalizeName(rawName);
    if (!normalizedInput) continue;

    const matchedPlayer = allPlayers.find((p) =>
      p.names.some((alias) => normalizeName(alias) === normalizedInput),
    );

    if (matchedPlayer) {
      if (!matchedPlayersMap.has(matchedPlayer.id)) {
        matchedPlayersMap.set(matchedPlayer.id, matchedPlayer);
      }
    } else {
      unknownNamesSet.add(trimmedRaw);
    }
  }

  return {
    matchedPlayers: Array.from(matchedPlayersMap.values()),
    unknownNames: Array.from(unknownNamesSet),
  };
}
