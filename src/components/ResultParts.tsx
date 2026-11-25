import type { ReactNode } from 'react';
import { verdicts } from '../data/verdicts';
import { t } from '../i18n';
import type { Verdict } from '../lib/gauge';
import Calculator from './Calculator';
import CodeExample from './CodeExample';

export function Section({ id, children }: { id: string; children?: ReactNode }) {
  return (
    <section id={id} className="result-section">
      {children}
    </section>
  );
}

export function ResultHeader({ verdict, tagline }: { verdict: Verdict; tagline: string }) {
  const data = verdicts[verdict];
  return (
    <>
      <p className="result-badge">
        <span className="result-dot" aria-hidden="true" />
        {t('result.badge', { name: t(data.name) })}
      </p>
      <p className="result-descriptor">{t(data.descriptor)}</p>

      <h2 id="q-title" className="result-title" tabIndex={-1}>
        <span className="result-line">{t(data.title.line1)}</span>{' '}
        <span className="result-line result-line-2">{t(data.title.line2)}</span>
      </h2>
      <p className="result-tagline">{tagline}</p>
    </>
  );
}

interface ResultSectionsProps {
  verdict: Verdict;
  codeNumber: string;
  calcNumber: string;
}

/** Code example (when the verdict has one), calculator and closing message. */
export function ResultSections({ verdict, codeNumber, calcNumber }: ResultSectionsProps) {
  const data = verdicts[verdict];
  return (
    <>
      {data.hasCode && (verdict === 'bash' || verdict === 'let-it-write') && (
        <Section id="code">
          <p className="eyebrow" aria-hidden="true">
            {codeNumber}
          </p>
          <CodeExample verdict={verdict} />
        </Section>
      )}

      <Section id="calculator">
        <Calculator verdict={verdict} number={calcNumber} />
      </Section>

      <div className="result-message">
        {data.when && <p>{t(data.when)}</p>}
        <p>{t(data.message)}</p>
      </div>
    </>
  );
}
