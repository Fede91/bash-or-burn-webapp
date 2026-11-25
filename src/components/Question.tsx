import type { ChangeEvent, Ref } from 'react';
import type { Question as QuestionData } from '../data/questions';
import { t } from '../i18n';

interface QuestionProps {
  question: QuestionData;
  index: number;
  selected: string | undefined;
  error: boolean;
  headingRef: Ref<HTMLHeadingElement>;
  onChange: (answerId: string) => void;
}

export default function Question({
  question,
  index,
  selected,
  error,
  headingRef,
  onChange,
}: QuestionProps) {
  const note = question.answers.find((a) => a.id === selected)?.note;
  const errId = `err-${question.id}`;

  return (
    <fieldset aria-describedby={errId} style={{ viewTransitionName: 'question' }}>
      <legend>
        <h2 id="q-title" tabIndex={-1} ref={headingRef}>
          <span className="sr-only">{t('wizard.progress.sr', { n: index + 1 })} </span>
          {t(question.title)}
        </h2>
      </legend>
      <p className="q-hint">{t(question.hint)}</p>
      <div className="opts">
        {question.answers.map((a) => (
          <label className="opt" key={a.id}>
            <input
              type="radio"
              name={question.id}
              value={a.id}
              checked={selected === a.id}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            />
            <span className="key" aria-hidden="true">
              {a.id}
            </span>
            <span className="opt-text">
              <span className="opt-label">{t(a.label)}</span>
              <span className="opt-hint">{t(a.hint)}</span>
            </span>
            <span className="radio" aria-hidden="true" />
          </label>
        ))}
      </div>
      <div id="note" aria-live="polite">
        {note && (
          <p className="note">
            <span className="note-label">{t('wizard.note.label')}</span>
            {t(note)}
          </p>
        )}
      </div>
      <p className="error" id={errId} aria-live="assertive">
        {error && (
          <>
            <span aria-hidden="true">{'!'}</span>
            {t('wizard.error.none')}
          </>
        )}
      </p>
    </fieldset>
  );
}
