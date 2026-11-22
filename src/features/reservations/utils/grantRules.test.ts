import type { Grant } from '../types';
import { grantUnavailableReason, isGrantUsable } from './grantRules';

const TODAY = new Date('2026-11-20T10:00:00');
const GRANT: Grant = { id: 3, cod: 'PN-III', oreRamase: 42, dataSfarsit: '2026-12-31' };

describe('grantRules', () => {
  it('un grant activ, cu ore, se poate folosi (și în ultima lui zi)', () => {
    expect(isGrantUsable(GRANT, TODAY)).toBe(true);
    expect(isGrantUsable({ ...GRANT, dataSfarsit: '2026-11-20' }, TODAY)).toBe(true);
  });

  it('un grant expirat sau fără ore nu se poate folosi', () => {
    expect(grantUnavailableReason({ ...GRANT, dataSfarsit: '2026-11-19' }, TODAY)).toBe('expirat');
    expect(grantUnavailableReason({ ...GRANT, oreRamase: 0 }, TODAY)).toBe('fără ore rămase');
  });
});
