import { describe, expect, it } from 'vitest';
import {
  DEBT_SETTLEMENT_INVALIDATION_KEYS,
  MATCH_MUTATION_INVALIDATION_KEYS,
} from './queryInvalidation';

describe('queryInvalidation', () => {
  it('includes stats, einsatz, and spiele for debt settlement', () => {
    const keys = DEBT_SETTLEMENT_INVALIDATION_KEYS.map((k) => k[0]);
    expect(keys).toContain('stats');
    expect(keys).toContain('einsatz');
    expect(keys).toContain('spiele');
  });

  it('includes spiele, stats, and einsatz for match mutations', () => {
    const keys = MATCH_MUTATION_INVALIDATION_KEYS.map((k) => k[0]);
    expect(keys).toContain('spiele');
    expect(keys).toContain('stats');
    expect(keys).toContain('einsatz');
  });
});
