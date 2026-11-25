import { t } from '../i18n';
import { track } from '../lib/analytics';
import { splitTrailingArrow } from '../lib/gauge';
import { CTA_URL } from './Cta';

export default function Nav() {
  const { label, arrow } = splitTrailingArrow(t('nav.link'));
  return (
    <header className="nav">
      <div className="nav-start">
        <a className="brand" href="#top">
          {t('nav.brand')}
        </a>
      </div>
      <a
        className="nav-link"
        href={CTA_URL}
        onClick={() => track('cta_clicked', { location: 'nav' })}
      >
        {label}
        {arrow && (
          <span className="arrow" aria-hidden="true">
            {' '}
            {arrow}
          </span>
        )}
      </a>
    </header>
  );
}
