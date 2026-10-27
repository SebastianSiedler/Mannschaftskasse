/**
 * Query key prefixes to invalidate when debts are settled.
 * Ensures the stats dashboard, match detail sheets, and match list
 * reflect the newly paid status without requiring a page reload.
 */
export const DEBT_SETTLEMENT_INVALIDATION_KEYS = [
  ['stats'],
  ['einsatz'],
  ['spiele'],
] as const;

/**
 * Query key prefixes to invalidate when player match appearances or goals are edited.
 */
export const MATCH_MUTATION_INVALIDATION_KEYS = [
  ['spiele'],
  ['stats'],
  ['einsatz'],
] as const;
