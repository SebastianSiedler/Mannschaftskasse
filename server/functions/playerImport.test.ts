import { describe, expect, it } from 'vitest';
import { matchPlayerList, normalizeName } from './playerImport';

describe('playerImport', () => {
  describe('normalizeName', () => {
    it('trims whitespace and converts to lower case', () => {
      expect(normalizeName('  Max Mustermann  ')).toBe('max mustermann');
    });

    it('strips bullet points, dashes, and tildes', () => {
      expect(normalizeName('- Max Mustermann')).toBe('max mustermann');
      expect(normalizeName('• Max Mustermann')).toBe('max mustermann');
      expect(normalizeName('* Max Mustermann')).toBe('max mustermann');
      expect(normalizeName('– Max Mustermann')).toBe('max mustermann');
    });
  });

  describe('matchPlayerList', () => {
    const mockPlayers = [
      { id: 'p1', names: ['Max Mustermann', 'Max'] },
      { id: 'p2', names: ['Lukas Schmidt', 'Luki'] },
      { id: 'p3', names: ['Jonas Müller'] },
    ];

    it('matches players exactly and case-insensitively', () => {
      const input = ['max mustermann', 'LUKAS SCHMIDT'];
      const result = matchPlayerList(input, mockPlayers);

      expect(result.matchedPlayers.map((p) => p.id)).toEqual(['p1', 'p2']);
      expect(result.unknownNames).toEqual([]);
    });

    it('matches aliases', () => {
      const input = ['Max', 'Luki'];
      const result = matchPlayerList(input, mockPlayers);

      expect(result.matchedPlayers.map((p) => p.id)).toEqual(['p1', 'p2']);
      expect(result.unknownNames).toEqual([]);
    });

    it('deduplicates duplicate input names for the same player', () => {
      const input = [
        'Max Mustermann',
        'Max Mustermann',
        'max',
        'Lukas Schmidt',
      ];
      const result = matchPlayerList(input, mockPlayers);

      // Should only include p1 once and p2 once
      expect(result.matchedPlayers.map((p) => p.id)).toEqual(['p1', 'p2']);
      expect(result.unknownNames).toEqual([]);
    });

    it('collects unknown names without duplicates', () => {
      const input = [
        'Max Mustermann',
        'Gastspieler 1',
        'Gastspieler 1',
        'Gastspieler 2',
      ];
      const result = matchPlayerList(input, mockPlayers);

      expect(result.matchedPlayers.map((p) => p.id)).toEqual(['p1']);
      expect(result.unknownNames).toEqual(['Gastspieler 1', 'Gastspieler 2']);
    });

    it('handles bulleted inputs gracefully', () => {
      const input = ['- Max Mustermann', '• Jonas Müller'];
      const result = matchPlayerList(input, mockPlayers);

      expect(result.matchedPlayers.map((p) => p.id)).toEqual(['p1', 'p3']);
      expect(result.unknownNames).toEqual([]);
    });

    it('ignores empty lines or blank items', () => {
      const input = ['', '   ', 'Max Mustermann'];
      const result = matchPlayerList(input, mockPlayers);

      expect(result.matchedPlayers.map((p) => p.id)).toEqual(['p1']);
      expect(result.unknownNames).toEqual([]);
    });
  });
});
