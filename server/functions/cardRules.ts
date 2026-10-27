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
