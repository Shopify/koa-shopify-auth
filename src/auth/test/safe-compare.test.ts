import safeCompare from '../safe-compare'

const hmac = '7c66606415117ff9744a2a9b2be1712a15928b5ef474ab1a9ff5dc36b7dcaed8';

describe('safeCompare', () => {
  it('returns true when values are the same', () => {
    expect(safeCompare(hmac, hmac)).toBe(true);
  });

  it('returns false when values are different', () => {
    expect(safeCompare(hmac, 'not hmac')).toBe(false);
  });
});
