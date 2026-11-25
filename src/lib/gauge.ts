export const GAUGE_MIN = -14;
export const GAUGE_MAX = 14;
export const GAUGE_RANGE = GAUGE_MAX - GAUGE_MIN;
export const TICK_COUNT = GAUGE_RANGE + 1;

export type Zone = 'bash' | 'let-it-write' | 'burn';
export type Verdict = Zone | 'bash-1call';

/** Zone edges: `bash` is total <= BASH_MAX, `burn` is total >= BURN_MIN. */
export const BASH_MAX = -4;
export const BURN_MIN = 5;

function clamp(total: number): number {
  return Math.min(GAUGE_MAX, Math.max(GAUGE_MIN, total));
}

/** Position of a (possibly fractional) value on the scale, in percent. */
export function positionOf(value: number): number {
  return ((value - GAUGE_MIN) / GAUGE_RANGE) * 100;
}

export function needlePosition(total: number): number {
  return positionOf(clamp(total));
}

/** Cuts sit between integers: (-3.5 + 14) / 28 and (4.5 + 14) / 28. */
export const CUT_BASH_POSITION = positionOf(BASH_MAX + 0.5);
export const CUT_BURN_POSITION = positionOf(BURN_MIN - 0.5);

export function zoneFor(total: number): Zone {
  if (total <= BASH_MAX) return 'bash';
  if (total >= BURN_MIN) return 'burn';
  return 'let-it-write';
}

export function formatTotal(total: number): string {
  if (total > 0) return `+${total}`;
  if (total < 0) return `-${Math.abs(total)}`;
  return '0';
}

/** Splits a trailing arrow glyph off a label so it can be hidden from assistive tech. */
export function splitTrailingArrow(text: string): { label: string; arrow: string } {
  const match = /^(.*?)\s*(↗)$/.exec(text);
  return match ? { label: match[1] ?? '', arrow: match[2] ?? '' } : { label: text, arrow: '' };
}
