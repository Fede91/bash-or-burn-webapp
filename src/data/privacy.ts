import type { MessageKey } from '../i18n';

export type PrivacyBlock =
  { type: 'h2' | 'h3' | 'p'; key: MessageKey } | { type: 'ul'; keys: MessageKey[] };

// Body of the privacy notice, after the h1 and in reading order. Text lives in the i18n files.
export const PRIVACY_BLOCKS: PrivacyBlock[] = [
  { type: 'p', key: 'privacy.intro.p1' },
  { type: 'p', key: 'privacy.intro.p2' },
  { type: 'h2', key: 'privacy.s1.h' },
  { type: 'p', key: 'privacy.s1.p1' },
  { type: 'h2', key: 'privacy.s2.h' },
  { type: 'p', key: 'privacy.s2.p1' },
  { type: 'h2', key: 'privacy.s3.h' },
  { type: 'h3', key: 'privacy.s3.h1' },
  { type: 'p', key: 'privacy.s3.p2' },
  { type: 'h3', key: 'privacy.s3.h3' },
  { type: 'p', key: 'privacy.s3.p4' },
  {
    type: 'ul',
    keys: [
      'privacy.s3.li5.1',
      'privacy.s3.li5.2',
      'privacy.s3.li5.3',
      'privacy.s3.li5.4',
      'privacy.s3.li5.5',
    ],
  },
  { type: 'p', key: 'privacy.s3.p6' },
  { type: 'p', key: 'privacy.s3.p7' },
  { type: 'p', key: 'privacy.s3.p8' },
  { type: 'h2', key: 'privacy.s4.h' },
  { type: 'p', key: 'privacy.s4.p1' },
  { type: 'ul', keys: ['privacy.s4.li2.1', 'privacy.s4.li2.2'] },
  { type: 'p', key: 'privacy.s4.p3' },
  { type: 'h2', key: 'privacy.s5.h' },
  { type: 'p', key: 'privacy.s5.p1' },
  { type: 'h2', key: 'privacy.s6.h' },
  { type: 'ul', keys: ['privacy.s6.li1.1', 'privacy.s6.li1.2'] },
  { type: 'p', key: 'privacy.s6.p2' },
  { type: 'p', key: 'privacy.s6.p3' },
  { type: 'h2', key: 'privacy.s7.h' },
  { type: 'p', key: 'privacy.s7.p1' },
  { type: 'h2', key: 'privacy.s8.h' },
  { type: 'ul', keys: ['privacy.s8.li1.1', 'privacy.s8.li1.2'] },
  { type: 'h2', key: 'privacy.s9.h' },
  { type: 'p', key: 'privacy.s9.p1' },
  { type: 'p', key: 'privacy.s9.p2' },
  { type: 'p', key: 'privacy.s9.p3' },
  { type: 'h2', key: 'privacy.s10.h' },
  { type: 'p', key: 'privacy.s10.p1' },
];
