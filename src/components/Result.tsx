import { useEffect, type ReactNode } from 'react';
import { questions } from '../data/questions';
import { verdicts } from '../data/verdicts';
import { t, type MessageKey } from '../i18n';
import { formatTotal } from '../lib/gauge';
import { factorDetail, resultFactors, score, type Answers, type Factor } from '../lib/score';
import Calculator from './Calculator';
import CodeExample from './CodeExample';

interface ResultProps {
  answers: Answers;
  onRestart: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

function pointsKey(points: number): MessageKey {
  if (points < 0) return 'result.factors.points.script';
  if (points > 0) return 'result.factors.points.agent';
  return 'result.factors.points.neutral';
}

function FactorRow({ factor }: { factor: Factor }) {
  const detail = factorDetail(factor);
  if (!detail) return null;
  return (
    <li className="factor">
      <span className="factor-index">{t('result.factors.index', { n: detail.n })}</span>
      <div>
        <p className="factor-question">{t(detail.title)}</p>
        <p className="factor-answer">{t(detail.label)}</p>
        <p className="factor-points">
          {t(pointsKey(factor.points), { points: formatTotal(factor.points) })}
        </p>
      </div>
    </li>
  );
}

function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="result-section">
      {children}
    </section>
  );
}

export default function Result({ answers, onRestart }: ResultProps) {
  const { total, verdict } = score(answers);
  const data = verdicts[verdict];
  const factors = resultFactors(answers);

  useEffect(() => {
    document.getElementById('q-title')?.focus();
  }, []);

  const withCode = data.hasCode;
  const calcNumber = withCode ? '03' : '02';

  return (
    <div data-verdict={verdict} style={{ viewTransitionName: 'question' }}>
      <div className="progress" aria-hidden="true">
        <span className="progress-n">{t('wizard.progress', { n: pad(questions.length) })}</span>
        <div className="segments">
          {questions.map((q) => (
            <span key={q.id} className="segment" data-state="done" />
          ))}
        </div>
      </div>

      <p className="result-badge">
        <span className="result-dot" aria-hidden="true" />
        {t('result.badge', { name: t(data.name) })}
      </p>
      <p className="result-descriptor">{t(data.descriptor)}</p>

      <h2 id="q-title" className="result-title" tabIndex={-1}>
        <span className="result-line">{t(data.title.line1)}</span>{' '}
        <span className="result-line result-line-2">{t(data.title.line2)}</span>
      </h2>
      <p className="result-tagline">{t('result.tagline', { total: formatTotal(total) })}</p>

      <nav aria-label={t('result.toc.label')}>
        <ul className="toc">
          <li>
            <a href="#factors">{t('result.toc.factors')}</a>
          </li>
          {withCode && (
            <li>
              <a href="#code">{t('result.toc.code')}</a>
            </li>
          )}
          <li>
            <a href="#calculator">{t(withCode ? 'result.toc.calc' : 'result.toc.calc.nocode')}</a>
          </li>
        </ul>
      </nav>

      <Section id="factors">
        <p className="eyebrow" aria-hidden="true">
          {'01'}
        </p>
        <h3 className="section-title">{t('result.factors.title')}</h3>
        <ul className="factors">
          {factors.map((f) => (
            <FactorRow key={f.questionId} factor={f} />
          ))}
        </ul>
        {verdict === 'bash-1call' && (
          <p className="section-lead">{t('result.factors.note.bash1call')}</p>
        )}
      </Section>

      {data.hasCode && (verdict === 'bash' || verdict === 'let-it-write') && (
        <Section id="code">
          <p className="eyebrow" aria-hidden="true">
            {'02'}
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

      <div className="actions">
        <button type="button" className="btn btn-outline" onClick={onRestart}>
          {t('result.restart')}
        </button>
      </div>
    </div>
  );
}
