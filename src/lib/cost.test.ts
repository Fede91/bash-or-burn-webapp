import { prices } from '../data/prices';
import {
  convert,
  currencySymbol,
  formatMoney,
  formatNumber,
  ironyBand,
  isValidInteger,
  parseInteger,
  runsToSlider,
  sliderToRuns,
  yearlyCostUsd,
  yearlyTokens,
} from './cost';

describe('formula', () => {
  it('computes yearly tokens', () => {
    expect(yearlyTokens(50, 8000, 500)).toBe(155_125_000);
  });

  it('computes yearly cost in USD from per-million prices', () => {
    expect(yearlyCostUsd(50, 8000, 500, 3, 15)).toBeCloseTo(574.875, 6);
  });

  it('is zero when there are no tokens', () => {
    expect(yearlyCostUsd(50, 0, 0, 3, 15)).toBe(0);
  });

  it('yields a finite positive cost for every model in prices.json', () => {
    for (const m of prices.models) {
      const cost = yearlyCostUsd(50, 8000, 500, m.inPerM, m.outPerM);
      expect(Number.isFinite(cost)).toBe(true);
      expect(cost).toBeGreaterThan(0);
    }
  });
});

describe('currencies', () => {
  it('leaves USD untouched', () => {
    expect(convert(100, 'usd')).toBe(100);
  });

  it('applies the fixed rate for EUR', () => {
    expect(convert(100, 'eur', 0.9)).toBeCloseTo(90, 10);
    expect(convert(100, 'eur')).toBeCloseTo(100 * prices.usdToEur, 10);
  });

  it('covers every currency listed in prices.json', () => {
    for (const c of prices.currencies) {
      expect(Number.isFinite(convert(574.875, c))).toBe(true);
      expect(currencySymbol(c)).toMatch(/^[€$]$/);
    }
  });
});

describe('ironyBand', () => {
  it.each([
    [0, 'b1'],
    [9.99, 'b1'],
    [10, 'b2'],
    [99.99, 'b2'],
    [100, 'b3'],
    [999.99, 'b3'],
    [1000, 'b4'],
    [9999.99, 'b4'],
    [10_000, 'b5'],
    [1_000_000, 'b5'],
  ] as const)('amount %s is %s', (amount, band) => {
    expect(ironyBand(amount, 'let-it-write')).toBe(band);
    expect(ironyBand(amount, 'bash')).toBe(band);
    expect(ironyBand(amount, 'bash-1call')).toBe(band);
  });

  it('is always burn for the Burn verdict', () => {
    for (const amount of [0, 9.99, 10, 1000, 10_000, 1e9]) {
      expect(ironyBand(amount, 'burn')).toBe('burn');
    }
  });
});

describe('validation', () => {
  it('accepts whole numbers in range, inclusive', () => {
    expect(isValidInteger(1, 1, 10_000)).toBe(true);
    expect(isValidInteger(10_000, 1, 10_000)).toBe(true);
    expect(isValidInteger(0, 1, 10_000)).toBe(false);
    expect(isValidInteger(10_001, 1, 10_000)).toBe(false);
    expect(isValidInteger(1.5, 1, 10_000)).toBe(false);
  });

  it('parses field text', () => {
    expect(parseInteger('50', 1, 10_000)).toBe(50);
    expect(parseInteger(' 7 ', 1, 10_000)).toBe(7);
    expect(parseInteger('', 1, 10_000)).toBeNull();
    expect(parseInteger('abc', 1, 10_000)).toBeNull();
    expect(parseInteger('-3', 1, 10_000)).toBeNull();
    expect(parseInteger('1.5', 1, 10_000)).toBeNull();
    expect(parseInteger('0', 1, 10_000)).toBeNull();
    expect(parseInteger('0', 0, 10)).toBe(0);
  });
});

describe('slider mapping', () => {
  it('maps the endpoints', () => {
    expect(sliderToRuns(0)).toBe(1);
    expect(sliderToRuns(1000)).toBe(10_000);
    expect(runsToSlider(1)).toBe(0);
    expect(runsToSlider(10_000)).toBe(1000);
  });

  it('round-trips powers of ten', () => {
    for (const runs of [1, 10, 100, 1000, 10_000]) {
      expect(sliderToRuns(runsToSlider(runs))).toBe(runs);
    }
  });

  it('clamps out-of-range input', () => {
    expect(sliderToRuns(-5)).toBe(1);
    expect(sliderToRuns(5000)).toBe(10_000);
    expect(runsToSlider(0)).toBe(0);
    expect(runsToSlider(99_999)).toBe(1000);
  });
});

describe('formatting', () => {
  it('formats numbers per language', () => {
    expect(formatNumber(1_234_567, 'it')).toBe('1.234.567');
    expect(formatNumber(1_234_567, 'en')).toBe('1,234,567');
    expect(formatNumber(1234, 'it')).toBe('1.234');
  });

  it('formats money per language and currency', () => {
    expect(formatMoney(1234, 'eur', 'it').replace(/\s/g, ' ')).toBe('1.234 €');
    expect(formatMoney(1234, 'eur', 'en')).toBe('€1,234');
    expect(formatMoney(1234, 'usd', 'en')).toBe('$1,234');
    expect(formatMoney(1234, 'usd', 'it').replace(/\s/g, ' ')).toBe('1.234 $');
  });

  it('keeps two decimals below 10', () => {
    expect(formatMoney(3.456, 'usd', 'en')).toBe('$3.46');
  });
});
