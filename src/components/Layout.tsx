import type { ReactNode } from 'react';
import { t } from '../i18n';
import Footer from './Footer';
import Grain from './Grain';
import Intro from './Intro';
import Nav from './Nav';
import SkipLink from './SkipLink';

interface LayoutProps {
  gauge: ReactNode;
  wizard: ReactNode;
  started: boolean;
}

export default function Layout({ gauge, wizard, started }: LayoutProps) {
  return (
    <>
      <SkipLink />
      <Nav />
      <main id="top" className="split" data-started={started ? 'true' : undefined}>
        <div className="left">
          <div className="cols" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <Intro started={started} />
          {gauge}
        </div>
        <section id="wizard" className="wizard" aria-label={t('wizard.region')} tabIndex={-1}>
          {wizard}
          <Footer />
        </section>
      </main>
      <Grain />
    </>
  );
}
