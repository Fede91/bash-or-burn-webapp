import type { Verdict } from '../lib/gauge';
import { formatTotal } from '../lib/gauge';
import { t, type MessageKey } from './index';

const VERDICT_NAME_KEYS: Record<Verdict, MessageKey> = {
  bash: 'verdict.bash.name',
  'let-it-write': 'verdict.letItWrite.name',
  'bash-1call': 'verdict.bash1call.name',
  burn: 'verdict.burn.name',
};

export function verdictName(verdict: Verdict): string {
  return t(VERDICT_NAME_KEYS[verdict]);
}

export function provisionalAnnouncement(total: number, verdict: Verdict): string {
  return t('gauge.live.provisional', {
    total: formatTotal(total),
    verdict: verdictName(verdict),
  });
}

export function finalAnnouncement(total: number, verdict: Verdict): string {
  return t('gauge.live.final', { total: formatTotal(total), verdict: verdictName(verdict) });
}

export function resetAnnouncement(): string {
  return t('gauge.live.reset');
}
