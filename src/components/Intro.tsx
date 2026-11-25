import { useId } from 'react';
import { t } from '../i18n';

export default function Intro() {
  const titleId = useId();
  return (
    <section className="intro" aria-labelledby={titleId}>
      <p className="eyebrow">{t('intro.eyebrow')}</p>
      <h1 id={titleId}>
        <span className="line" data-line>
          {t('intro.title.line1')}
        </span>{' '}
        <span className="line acc" data-line>
          {t('intro.title.line2')}
        </span>
      </h1>
      <p className="lead">{t('intro.lead')}</p>
    </section>
  );
}
