import enMessages from './en.json';
import itMessages from './it.json';
import { DEFAULT_LANG, setLang, t } from './index';

const DASHES = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('i18n catalogues', () => {
  it('have identical key sets', () => {
    expect(Object.keys(enMessages).sort()).toEqual(Object.keys(itMessages).sort());
  });

  it('hold non-empty strings with matching placeholders and no dashes', () => {
    for (const [key, value] of Object.entries(itMessages)) {
      const other = (enMessages as Record<string, string>)[key] ?? '';
      expect(value, key).not.toBe('');
      expect(other, key).not.toBe('');
      expect(placeholders(value), key).toEqual(placeholders(other));
      expect(value + other, key).not.toMatch(DASHES);
    }
  });
});

describe('t()', () => {
  it('interpolates variables', () => {
    setLang('it');
    expect(t('gauge.live.provisional', { total: '+3', verdict: 'Burn' })).toBe(
      'Totale provvisorio +3. Per ora: Burn.',
    );
  });

  it('follows the selected language and keeps <html lang> in sync', () => {
    setLang('en');
    expect(t('wizard.region')).toBe('Questions');
    expect(document.documentElement.lang).toBe('en');
    setLang(DEFAULT_LANG);
    expect(document.documentElement.lang).toBe(DEFAULT_LANG);
  });
});
