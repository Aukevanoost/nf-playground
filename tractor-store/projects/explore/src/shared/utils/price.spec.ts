import { describe, expect, it } from 'vitest';
import { fmtPrice } from './price';

describe('fmtPrice', () => {
  it('appends the currency suffix to a positive integer price', () => {
    expect(fmtPrice(2300)).toBe('2300,00 Ø');
  });

  it('formats zero', () => {
    expect(fmtPrice(0)).toBe('0,00 Ø');
  });

  it('does not round or alter non-integer prices (current behaviour)', () => {
    // The formatter does not coerce decimals; it just appends the suffix.
    expect(fmtPrice(99.5)).toBe('99.5,00 Ø');
  });
});
