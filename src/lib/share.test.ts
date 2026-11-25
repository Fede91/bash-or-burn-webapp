import { verdicts } from '../data/verdicts';
import { DEFAULT_LANG, setLang, type Lang } from '../i18n';
import type { Verdict } from './gauge';
import {
  linkedinIntentUrl,
  linkedinText,
  parseVerdictParam,
  shareKeySuffix,
  shareUrl,
  xIntentUrl,
  xText,
} from './share';

const slugs = Object.keys(verdicts) as Verdict[];

beforeEach(() => setLang(DEFAULT_LANG));

describe('parseVerdictParam', () => {
  it('returns none without the param', () => {
    expect(parseVerdictParam('')).toEqual({ kind: 'none' });
    expect(parseVerdictParam('?x=1')).toEqual({ kind: 'none' });
  });

  it.each(['bash', 'bash-1call', 'burn', 'let-it-write'])('accepts %s', (slug) => {
    expect(parseVerdictParam(`?v=${slug}`)).toEqual({ kind: 'valid', verdict: slug });
  });

  it.each(['?v=BASH', '?v=', '?v=nope', '?v=constructor', '?v=__proto__', '?v=bash&v=burn'])(
    'rejects %s',
    (search) => {
      expect(parseVerdictParam(search)).toEqual({ kind: 'invalid' });
    },
  );
});

describe('share urls', () => {
  it('knows the four slugs', () => {
    expect(slugs.sort()).toEqual(['bash', 'bash-1call', 'burn', 'let-it-write']);
  });

  it('maps slugs to key suffixes', () => {
    expect(slugs.map(shareKeySuffix).sort()).toEqual(['bash', 'bash1call', 'burn', 'letItWrite']);
  });

  it.each(slugs)('%s: share URL and intents carry ?v=', (slug) => {
    expect(shareUrl(slug)).toMatch(new RegExp(`\\?v=${slug}$`));
    expect(xIntentUrl(slug)).toContain(encodeURIComponent(`?v=${slug}`));
    expect(linkedinIntentUrl(slug)).toContain(encodeURIComponent(`?v=${slug}`));
    expect(linkedinText(slug)).toContain(`?v=${slug}`);
  });

  it.each(['it', 'en'] as Lang[])('keeps X texts within 280 characters (%s)', (lang) => {
    setLang(lang);
    for (const slug of slugs) {
      expect(xText(slug).length + 1 + 23).toBeLessThanOrEqual(280);
      expect(linkedinText(slug).length).toBeLessThanOrEqual(700);
    }
  });
});
