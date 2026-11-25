import type { ReactNode } from 'react';
import { t } from '../i18n';
import Grain from './Grain';
import Intro from './Intro';
import Nav from './Nav';
import SkipLink from './SkipLink';

interface LayoutProps {
  gauge: ReactNode;
}

export default function Layout({ gauge }: LayoutProps) {
  return (
    <>
      <SkipLink />
      <Nav />
      <main id="top" className="split">
        <div className="left">
          <div className="cols" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <Intro />
          {gauge}
        </div>
        <section id="wizard" className="wizard" aria-label={t('wizard.region')} tabIndex={-1} />
      </main>
      <Grain />
    </>
  );
}
