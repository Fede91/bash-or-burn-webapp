import { t } from '../i18n';
import { CTA_URL } from './Cta';

export default function Footer() {
  return (
    <footer className="foot">
      <p>{t('footer.made')}</p>
      <p>{t('footer.nomodel')}</p>
      <p>{t('footer.privacy')}</p>
      <p>
        {/* PLACEHOLDER: legal line pending P.IVA */}
        <span data-placeholder="legal">
          {t('footer.legal', { piva: t('footer.legal.placeholder') })}
        </span>
      </p>
      <a href={CTA_URL} rel="noopener">
        {t('footer.link')}
      </a>
    </footer>
  );
}
