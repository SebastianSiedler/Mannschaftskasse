export interface EinsatzDebtItem {
  spielId: string;
  bezahlt: boolean;
}

/**
 * Extracts the IDs of matches that have unpaid debts for a player.
 */
export function filterUnpaidMatchIds(einsaetze: EinsatzDebtItem[]): string[] {
  return einsaetze.filter((e) => !e.bezahlt).map((e) => e.spielId);
}

/**
 * Calculates the total debt for a list of player match appearances.
 */
export function calculatePlayerDebt(
  einsaetze: EinsatzDebtItem[],
  costPerMatch = 5,
): number {
  return einsaetze.reduce(
    (sum, curr) => sum + (curr.bezahlt ? 0 : costPerMatch),
    0,
  );
}
