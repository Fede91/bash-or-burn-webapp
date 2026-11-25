import type { Verdict } from '../lib/gauge';
import { t, type MessageKey } from '../i18n';
import { shareKeySuffix } from '../lib/share';

export const CTA_URL = 'https://federicobagato.it';

export default function Cta({ verdict }: { verdict: Verdict }) {
  return (
    <section className="cta">
      <p className="cta-context">{t(`cta.context.${shareKeySuffix(verdict)}` as MessageKey)}</p>
      <a className="cta-link" href={CTA_URL} rel="noopener">
        {t('cta.link')}
        <span className="cta-meta" aria-hidden="true">
          {t('cta.link.meta')}
        </span>
        <span className="sr-only">{t('cta.link.sr')}</span>
      </a>
    </section>
  );
}
