import { verdicts } from '../data/verdicts';
import { t, type MessageKey } from '../i18n';
import type { Verdict } from './gauge';

// OPEN POINT: the canonical origin is not confirmed yet.
export const SITE_URL = 'https://bashorburn.federicobagato.it/';

export type VerdictParam =
  { kind: 'none' } | { kind: 'valid'; verdict: Verdict } | { kind: 'invalid' };

type ShareSuffix = 'bash' | 'bash1call' | 'burn' | 'letItWrite';

const SUFFIX: Record<Verdict, ShareSuffix> = {
  bash: 'bash',
  'bash-1call': 'bash1call',
  burn: 'burn',
  'let-it-write': 'letItWrite',
};

export function shareKeySuffix(verdict: Verdict): ShareSuffix {
  return SUFFIX[verdict];
}

export function shareUrl(verdict: Verdict): string {
  return `${SITE_URL}?v=${verdict}`;
}

export function parseVerdictParam(search: string): VerdictParam {
  const values = new URLSearchParams(search).getAll('v');
  const [value] = values;
  if (value === undefined) return { kind: 'none' };
  if (values.length === 1 && Object.hasOwn(verdicts, value)) {
    return { kind: 'valid', verdict: value as Verdict };
  }
  return { kind: 'invalid' };
}

export function xText(verdict: Verdict): string {
  return t(`share.x.${shareKeySuffix(verdict)}` as MessageKey);
}

export function linkedinText(verdict: Verdict): string {
  const body = t(`share.li.${shareKeySuffix(verdict)}` as MessageKey);
  return [t('share.li.open'), body, t('share.li.close', { url: shareUrl(verdict) })].join(' ');
}

export function xIntentUrl(verdict: Verdict): string {
  const text = `${xText(verdict)} ${shareUrl(verdict)}`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function linkedinIntentUrl(verdict: Verdict): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl(verdict))}`;
}
