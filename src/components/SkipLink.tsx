import { t } from '../i18n';

interface SkipLinkProps {
  target?: string;
  label?: string;
}

export default function SkipLink({ target = '#wizard', label = t('nav.skip') }: SkipLinkProps) {
  return (
    <a className="skip-link" href={target}>
      {label}
    </a>
  );
}
