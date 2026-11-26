import { PRIVACY_BLOCKS } from '../data/privacy';
import { t } from '../i18n';
import Footer from './Footer';
import Grain from './Grain';
import Inline from './Inline';
import Nav from './Nav';
import SkipLink from './SkipLink';

function BackLink() {
  const [arrow, ...rest] = t('privacy.back').split(' ');
  return (
    <a className="doc-back" href="/">
      <span className="arrow" aria-hidden="true">
        {arrow}{' '}
      </span>
      {rest.join(' ')}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <SkipLink target="#privacy" label={t('privacy.skip')} />
      <Nav brandHref="/" />
      <main id="privacy" className="doc" tabIndex={-1}>
        <BackLink />
        <h1>{t('privacy.title')}</h1>
        {PRIVACY_BLOCKS.map((block) => {
          if (block.type === 'ul') {
            return (
              <ul key={block.keys[0]}>
                {block.keys.map((key) => (
                  <li key={key}>
                    <Inline text={t(key)} />
                  </li>
                ))}
              </ul>
            );
          }
          const Tag = block.type;
          return (
            <Tag key={block.key}>
              <Inline text={t(block.key)} />
            </Tag>
          );
        })}
        <BackLink />
        <Footer />
      </main>
      <Grain />
    </>
  );
}
