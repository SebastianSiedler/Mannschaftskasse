/**
 * Football card rules and display helpers.
 * - Max 2 yellow cards (2 yellow cards = yellow-red / Gelb-Rot).
 * - Max 1 red card.
 * - A player with Gelb-Rot (2 yellows) cannot receive an additional straight red card.
 * - A player with a straight red card can have at most 1 prior yellow card.
 */

export function getCardLimits(current: {
  gelbeKarte: number;
  roteKarte: number;
}) {
  const maxYellow = current.roteKarte > 0 ? 1 : 2;
  const maxRed = current.gelbeKarte >= 2 ? 0 : 1;
  return { maxYellow, maxRed };
}

export function getYellowCardDisplay(gelbeKarte: number) {
  if (gelbeKarte >= 2) {
    return {
      isYellowRed: true,
      label: 'Gelb-Rote Karte',
      subtitle: '2. Gelbe Karte führt zu Gelb-Rot',
    };
  }
  if (gelbeKarte === 1) {
    return {
      isYellowRed: false,
      label: 'Gelbe Karte',
      subtitle: undefined,
    };
  }
  return {
    isYellowRed: false,
    label: 'Gelbe Karten',
    subtitle: undefined,
  };
}

export function getRedCardDisplay(roteKarte: number) {
  return {
    label: 'Rote Karte',
    subtitle: roteKarte === 1 ? 'Direkter Platzverweis' : undefined,
  };
}

export type CardDisplayKind =
  | { type: 'NONE' }
  | { type: 'YELLOW_RED' }
  | { type: 'SEPARATE'; hasYellow: boolean; hasRed: boolean };

/**
 * Resolves card icons for match overviews:
 * - 2 yellow cards = Yellow-Red combined icon.
 * - 1 yellow and/or 1 red = separate individual card icons side-by-side.
 */
export function resolveMatchCardsDisplay(
  gelbeKarte: number,
  roteKarte: number,
): CardDisplayKind {
  if (gelbeKarte >= 2) {
    return { type: 'YELLOW_RED' };
  }
  const hasYellow = gelbeKarte === 1;
  const hasRed = roteKarte > 0;
  if (hasYellow || hasRed) {
    return {
      type: 'SEPARATE',
      hasYellow,
      hasRed,
    };
  }
  return { type: 'NONE' };
}
