import { useEffect, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { questions } from '../data/questions';
import { t } from '../i18n';
import { track } from '../lib/analytics';
import type { Answers } from '../lib/score';
import Question from './Question';

interface WizardProps {
  answers: Answers;
  onAnswer: (questionId: string, answerId: string) => void;
  onFinish: () => void;
  onStepChange?: (step: number) => void;
}

const TOTAL = questions.length;
const LAST = TOTAL - 1;
const pad = (n: number) => String(n).padStart(2, '0');

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function Wizard({ answers, onAnswer, onFinish, onStepChange }: WizardProps) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track('wizard_started');
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const heading = headingRef.current;
    heading?.focus({ preventScroll: true });
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    if (step === 0) {
      if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior });
    } else if (typeof heading?.scrollIntoView === 'function') {
      heading.scrollIntoView({ block: 'start', behavior });
    }
  }, [step]);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  const question = questions[step];
  if (!question) return null;
  const selected = answers[question.id];

  function goTo(next: number) {
    setError(false);
    if (typeof document.startViewTransition === 'function' && !prefersReducedMotion()) {
      document.startViewTransition(() => flushSync(() => setStep(next)));
    } else {
      setStep(next);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) {
      setError(true);
      e.currentTarget.querySelector<HTMLInputElement>('input[type="radio"]')?.focus();
      return;
    }
    track('question_answered', { step_index: step + 1, step_total: TOTAL });
    if (step === LAST) {
      setError(false);
      onFinish();
      return;
    }
    goTo(step + 1);
  }

  return (
    <form id="wizard-form" noValidate onSubmit={handleSubmit}>
      <span className="numeral" aria-hidden="true">
        {pad(step + 1)}
      </span>
      <div className="progress" aria-hidden="true">
        <span className="progress-n">{t('wizard.progress', { n: pad(step + 1) })}</span>
        <div className="segments">
          {questions.map((q, i) => (
            <span
              key={q.id}
              className="segment"
              data-state={i < step ? 'done' : i === step ? 'current' : 'upcoming'}
            />
          ))}
        </div>
      </div>
      <Question
        key={question.id}
        question={question}
        index={step}
        selected={selected}
        error={error}
        headingRef={headingRef}
        onChange={(answerId) => {
          setError(false);
          onAnswer(question.id, answerId);
        }}
      />
      <div className="actions">
        <button type="submit" className="btn btn-primary">
          {t(step === LAST ? 'wizard.submit' : 'wizard.next')}
          <span aria-hidden="true">{'→'}</span>
        </button>
        {step > 0 && (
          <button type="button" className="btn btn-outline" onClick={() => goTo(step - 1)}>
            {t('wizard.back')}
          </button>
        )}
        <span className="kbd" aria-hidden="true">
          {t('wizard.kbd')}
        </span>
      </div>
    </form>
  );
}
