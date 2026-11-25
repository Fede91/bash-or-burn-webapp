import { t } from '../i18n';
import { splitTrailingArrow } from '../lib/gauge';

export default function Nav() {
  const { label, arrow } = splitTrailingArrow(t('nav.link'));
  return (
    <header className="nav">
      <div className="nav-start">
        <a className="brand" href="#top">
          {t('nav.brand')}
        </a>
        <span className="brand-role">{t('nav.role')}</span>
      </div>
      <a className="nav-link" href="https://federicobagato.it">
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
