import { describe, expect, it } from 'vitest';
import {
  getCardLimits,
  getRedCardDisplay,
  getYellowCardDisplay,
  resolveMatchCardsDisplay,
} from './cardRules';
import { updateEinsatzSchema } from './einsatz';

describe('cardRules', () => {
  describe('getCardLimits', () => {
    it('allows up to 2 yellow cards and 1 red card when no cards are given', () => {
      expect(getCardLimits({ gelbeKarte: 0, roteKarte: 0 })).toEqual({
        maxYellow: 2,
        maxRed: 1,
      });
    });

    it('allows up to 2 yellow cards and 1 red card with 1 yellow card', () => {
      expect(getCardLimits({ gelbeKarte: 1, roteKarte: 0 })).toEqual({
        maxYellow: 2,
        maxRed: 1,
      });
    });

    it('disallows red card when player already has 2 yellow cards (Gelb-Rot)', () => {
      expect(getCardLimits({ gelbeKarte: 2, roteKarte: 0 })).toEqual({
        maxYellow: 2,
        maxRed: 0,
      });
    });

    it('caps yellow cards to 1 if player has a direct red card', () => {
      expect(getCardLimits({ gelbeKarte: 0, roteKarte: 1 })).toEqual({
        maxYellow: 1,
        maxRed: 1,
      });
    });
  });

  describe('getYellowCardDisplay', () => {
    it('returns standard yellow card display for 0 and 1 card', () => {
      expect(getYellowCardDisplay(0)).toEqual({
        isYellowRed: false,
        label: 'Gelbe Karten',
        subtitle: undefined,
      });

      expect(getYellowCardDisplay(1)).toEqual({
        isYellowRed: false,
        label: 'Gelbe Karte',
        subtitle: undefined,
      });
    });

    it('returns yellow-red display when player has 2 yellow cards', () => {
      expect(getYellowCardDisplay(2)).toEqual({
        isYellowRed: true,
        label: 'Gelb-Rote Karte',
        subtitle: '2. Gelbe Karte führt zu Gelb-Rot',
      });
    });
  });

  describe('getRedCardDisplay', () => {
    it('formats red card display with subtitle when 1 red card is present', () => {
      expect(getRedCardDisplay(0)).toEqual({
        label: 'Rote Karte',
        subtitle: undefined,
      });
      expect(getRedCardDisplay(1)).toEqual({
        label: 'Rote Karte',
        subtitle: 'Direkter Platzverweis',
      });
    });
  });

  describe('resolveMatchCardsDisplay', () => {
    it('returns NONE when no cards are given', () => {
      expect(resolveMatchCardsDisplay(0, 0)).toEqual({ type: 'NONE' });
    });

    it('returns YELLOW_RED for 2 yellow cards', () => {
      expect(resolveMatchCardsDisplay(2, 0)).toEqual({ type: 'YELLOW_RED' });
    });

    it('returns SEPARATE with both cards for 1 yellow and 1 red card', () => {
      expect(resolveMatchCardsDisplay(1, 1)).toEqual({
        type: 'SEPARATE',
        hasYellow: true,
        hasRed: true,
      });
    });

    it('returns SEPARATE with only yellow for 1 yellow card', () => {
      expect(resolveMatchCardsDisplay(1, 0)).toEqual({
        type: 'SEPARATE',
        hasYellow: true,
        hasRed: false,
      });
    });

    it('returns SEPARATE with only red for 1 red card', () => {
      expect(resolveMatchCardsDisplay(0, 1)).toEqual({
        type: 'SEPARATE',
        hasYellow: false,
        hasRed: true,
      });
    });
  });

  describe('updateEinsatzSchema validation', () => {
    it('accepts valid card numbers', () => {
      const parsed = updateEinsatzSchema.safeParse({
        spielId: 's1',
        spielerId: 'p1',
        gelbeKarte: 2,
        roteKarte: 1,
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects more than 2 yellow cards', () => {
      const parsed = updateEinsatzSchema.safeParse({
        spielId: 's1',
        spielerId: 'p1',
        gelbeKarte: 3,
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects more than 1 red card', () => {
      const parsed = updateEinsatzSchema.safeParse({
        spielId: 's1',
        spielerId: 'p1',
        roteKarte: 2,
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects negative cards', () => {
      expect(
        updateEinsatzSchema.safeParse({
          spielId: 's1',
          spielerId: 'p1',
          gelbeKarte: -1,
        }).success,
      ).toBe(false);

      expect(
        updateEinsatzSchema.safeParse({
          spielId: 's1',
          spielerId: 'p1',
          roteKarte: -1,
        }).success,
      ).toBe(false);
    });
  });
});
