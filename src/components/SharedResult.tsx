import { useEffect } from 'react';
import { verdicts } from '../data/verdicts';
import { t } from '../i18n';
import type { Verdict } from '../lib/gauge';
import Cta from './Cta';
import { ResultHeader, ResultSections } from './ResultParts';
import ShareButton from './ShareButton';
import SystemState from './SystemState';

interface SharedResultProps {
  verdict: Verdict;
  onStart: () => void;
}

export default function SharedResult({ verdict, onStart }: SharedResultProps) {
  const withCode = verdicts[verdict].hasCode;

  useEffect(() => {
    document.getElementById('q-title')?.focus();
  }, []);

  return (
    <div data-verdict={verdict} style={{ viewTransitionName: 'question' }}>
      <SystemState
        role="status"
        body={t('state.shared.banner')}
        action={{ label: t('state.shared.cta'), onClick: onStart }}
      />
      <ResultHeader verdict={verdict} tagline={t('result.tagline.shared')} />
      <p className="section-lead">{t('result.factors.shared')}</p>
      <ResultSections verdict={verdict} codeNumber={'01'} calcNumber={withCode ? '02' : '01'} />
      <ShareButton verdict={verdict} />
      <Cta verdict={verdict} />
    </div>
  );
}
