import type { MessageKey } from '../i18n';
import type { Verdict } from '../lib/gauge';
import raw from './verdicts.json';

export interface VerdictData {
  color: string;
  cssVar: string;
  name: MessageKey;
  descriptor: MessageKey;
  title: { line1: MessageKey; line2: MessageKey };
  /** Only Burn: when an agent is the right tool. */
  when?: MessageKey;
  message: MessageKey;
  hasCode: boolean;
}

export const verdicts = raw as Record<Verdict, VerdictData>;
