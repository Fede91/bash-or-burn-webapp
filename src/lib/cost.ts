import { prices, type Currency } from '../data/prices';
import type { Lang } from '../i18n';
import type { Verdict } from './gauge';

export type IronyBand = 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'burn';

export const RUNS_MIN = 1;
export const RUNS_MAX = 10_000;
export const TOKENS_MIN = 0;
export const TOKENS_MAX = 10_000_000;
export const SLIDER_MAX = 1000;

const DAYS_PER_YEAR = 365;

export function yearlyTokens(runsPerDay: number, tokensIn: number, tokensOut: number): number {
  return runsPerDay * DAYS_PER_YEAR * (tokensIn + tokensOut);
}

/** Prices are USD per million tokens. */
export function yearlyCostUsd(
  runsPerDay: number,
  tokensIn: number,
  tokensOut: number,
  pricePerMIn: number,
  pricePerMOut: number,
): number {
  return (runsPerDay * DAYS_PER_YEAR * (tokensIn * pricePerMIn + tokensOut * pricePerMOut)) / 1e6;
}

export function convert(usd: number, currency: Currency, usdToEur = prices.usdToEur): number {
  return currency === 'eur' ? usd * usdToEur : usd;
}

/** Compares the unrounded amount in the selected currency; lower bounds are inclusive. */
export function ironyBand(amount: number, verdict: Verdict): IronyBand {
  if (verdict === 'burn') return 'burn';
  if (amount < 10) return 'b1';
  if (amount < 100) return 'b2';
  if (amount < 1000) return 'b3';
  if (amount < 10_000) return 'b4';
  return 'b5';
}

export function isValidInteger(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

/** Parses a field value: null when it is empty, not a whole number or out of range. */
export function parseInteger(text: string, min: number, max: number): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return isValidInteger(value, min, max) ? value : null;
}

const LOG_RANGE = Math.log(RUNS_MAX / RUNS_MIN);

export function sliderToRuns(position: number): number {
  const clamped = Math.min(Math.max(position, 0), SLIDER_MAX);
  return Math.round(RUNS_MIN * Math.exp((clamped / SLIDER_MAX) * LOG_RANGE));
}

export function runsToSlider(runs: number): number {
  const clamped = Math.min(Math.max(runs, RUNS_MIN), RUNS_MAX);
  return Math.round((Math.log(clamped / RUNS_MIN) / LOG_RANGE) * SLIDER_MAX);
}

const LOCALES: Record<Lang, string> = { it: 'it-IT', en: 'en-US' };

export function formatNumber(value: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], {
    maximumFractionDigits: 0,
    useGrouping: 'always',
  }).format(value);
}

/** Two decimals below 10 so that small amounts do not collapse to 0. */
export function formatMoney(amount: number, currency: Currency, lang: Lang): string {
  const digits = amount < 10 ? 2 : 0;
  return new Intl.NumberFormat(LOCALES[lang], {
    style: 'currency',
    currencyDisplay: 'narrowSymbol',
    currency: currency === 'eur' ? 'EUR' : 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: 'always',
  }).format(amount);
}

export function currencySymbol(currency: Currency): string {
  return currency === 'eur' ? '€' : '$';
}

export function formatDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(iso),
  );
}
