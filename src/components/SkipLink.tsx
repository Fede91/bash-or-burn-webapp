import { t } from '../i18n';

export default function SkipLink() {
  return (
    <a className="skip-link" href="#wizard">
      {t('nav.skip')}
    </a>
  );
}
