import {
  CUT_BASH_POSITION,
  CUT_BURN_POSITION,
  formatTotal,
  needlePosition,
  splitTrailingArrow,
  zoneFor,
} from './gauge';

describe('needlePosition', () => {
  it.each([
    [-14, 0],
    [-4, (10 / 28) * 100],
    [0, 50],
    [5, (19 / 28) * 100],
    [14, 100],
    [-20, 0],
    [20, 100],
  ])('maps %i to %f%%', (total, expected) => {
    expect(needlePosition(total)).toBeCloseTo(expected, 6);
  });
});

describe('cuts', () => {
  it('sit between integers', () => {
    expect(CUT_BASH_POSITION).toBeCloseTo(37.5, 6);
    expect(CUT_BURN_POSITION).toBeCloseTo(66.0714, 4);
  });
});

describe('zoneFor', () => {
  it.each([
    [-14, 'bash'],
    [-4, 'bash'],
    [-3, 'let-it-write'],
    [0, 'let-it-write'],
    [4, 'let-it-write'],
    [5, 'burn'],
    [14, 'burn'],
  ])('maps %i to %s', (total, zone) => {
    expect(zoneFor(total)).toBe(zone);
  });
});

describe('formatTotal', () => {
  it('signs the total', () => {
    expect(formatTotal(3)).toBe('+3');
    expect(formatTotal(-5)).toBe('-5');
    expect(formatTotal(0)).toBe('0');
  });
});

describe('splitTrailingArrow', () => {
  it('separates the arrow', () => {
    expect(splitTrailingArrow('federicobagato.it ↗')).toEqual({
      label: 'federicobagato.it',
      arrow: '↗',
    });
  });
  it('leaves plain text alone', () => {
    expect(splitTrailingArrow('hello')).toEqual({ label: 'hello', arrow: '' });
  });
});
