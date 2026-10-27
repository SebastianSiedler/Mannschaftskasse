import { describe, expect, it } from 'vitest';
import { calculatePlayerDebt, filterUnpaidMatchIds } from './debtSettlement';

describe('debtSettlement', () => {
  describe('filterUnpaidMatchIds', () => {
    it('returns empty array when there are no match appearances', () => {
      expect(filterUnpaidMatchIds([])).toEqual([]);
    });

    it('returns empty array when all appearances are paid', () => {
      const einsaetze = [
        { spielId: 'game-1', bezahlt: true },
        { spielId: 'game-2', bezahlt: true },
      ];
      expect(filterUnpaidMatchIds(einsaetze)).toEqual([]);
    });

    it('returns only the match IDs that are unpaid', () => {
      const einsaetze = [
        { spielId: 'game-1', bezahlt: true },
        { spielId: 'game-2', bezahlt: false },
        { spielId: 'game-3', bezahlt: false },
        { spielId: 'game-4', bezahlt: true },
      ];
      expect(filterUnpaidMatchIds(einsaetze)).toEqual(['game-2', 'game-3']);
    });
  });

  describe('calculatePlayerDebt', () => {
    it('calculates 0 debt when all matches are paid or none exist', () => {
      expect(calculatePlayerDebt([])).toBe(0);
      expect(
        calculatePlayerDebt([
          { spielId: 'g1', bezahlt: true },
          { spielId: 'g2', bezahlt: true },
        ]),
      ).toBe(0);
    });

    it('multiplies unpaid games by the default cost per match (5 €)', () => {
      const einsaetze = [
        { spielId: 'g1', bezahlt: false },
        { spielId: 'g2', bezahlt: true },
        { spielId: 'g3', bezahlt: false },
      ];
      expect(calculatePlayerDebt(einsaetze)).toBe(10);
    });

    it('supports custom cost per match', () => {
      const einsaetze = [
        { spielId: 'g1', bezahlt: false },
        { spielId: 'g2', bezahlt: false },
      ];
      expect(calculatePlayerDebt(einsaetze, 10)).toBe(20);
    });
  });
});
