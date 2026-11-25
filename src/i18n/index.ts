import en from './en.json';
import it from './it.json';

// COPY-DECK ISSUE: nav.lang.* and a11y.lang.* are omitted (no language toggle yet).
// COPY-DECK ISSUE: intro.privacy is kept but not rendered (valid only with cookieless analytics).
// COPY-DECK ISSUE: nav.link embeds the arrow; Nav splits it off so it can be aria-hidden.
// COPY-DECK ISSUE: a11y.gauge.region is not defined in the deck; the gauge is named by its h2.
// COPY-DECK ISSUE: gauge.bar.total duplicates {total}; the bar reuses gauge.total, so the key is unused.
export type Lang = 'it' | 'en';
export type MessageKey = keyof typeof it;
export type Vars = Record<string, string | number>;

// The default language is still open in the tech-stack spec: 'it' is a placeholder.
export const DEFAULT_LANG: Lang = 'it';

// Compile-time check that both languages share the same keys.
const messages: Record<Lang, Record<MessageKey, string>> = { it, en };

let current: Lang = DEFAULT_LANG;

export function setLang(lang: Lang): void {
  current = lang;
  document.documentElement.lang = lang;
}

export function getLang(): Lang {
  return current;
}

export function t(key: MessageKey, vars?: Vars): string {
  const template = messages[current][key];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}
