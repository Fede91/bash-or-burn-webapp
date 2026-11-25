import { t } from '../i18n';
import { track } from '../lib/analytics';
import { CTA_URL } from './Cta';

const PIVA = 'IT05747390283';

export default function Footer() {
  return (
    <footer className="foot">
      <p>{t('footer.legal', { piva: PIVA })}</p>
      <a href={CTA_URL} rel="noopener" onClick={() => track('cta_clicked', { location: 'footer' })}>
        {t('footer.link')}
      </a>
    </footer>
  );
}
