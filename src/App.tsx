import { useEffect, useState } from 'react';
import Gauge from './components/Gauge';
import Layout from './components/Layout';
import Result from './components/Result';
import SharedResult from './components/SharedResult';
import SystemState from './components/SystemState';
import Wizard from './components/Wizard';
import {
  finalAnnouncement,
  provisionalAnnouncement,
  resetAnnouncement,
} from './i18n/gauge-messages';
import { t } from './i18n';
import { track } from './lib/analytics';
import { parseVerdictParam } from './lib/share';
import { finalVerdict, provisionalZone, runningTotal, type Answers } from './lib/score';

function readLink() {
  return parseVerdictParam(window.location.search);
}

function clearVerdictParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete('v');
  window.history.replaceState(null, '', url);
}

export default function App() {
  const [link, setLink] = useState(readLink);
  const [answers, setAnswers] = useState<Answers>({});
  const [finished, setFinished] = useState(false);
  const [resets, setResets] = useState(0);

  const total = runningTotal(answers);
  const answered = Object.keys(answers).length !== 0;
  const verdict = finished ? finalVerdict(answers) : provisionalZone(answers);

  let announcement = '';
  if (finished) announcement = finalAnnouncement(total, verdict);
  else if (answered) announcement = provisionalAnnouncement(total, verdict);
  else if (resets > 0) announcement = resetAnnouncement();

  useEffect(() => {
    if (resets > 0) document.getElementById('q-title')?.focus();
  }, [resets]);

  function startTest() {
    clearVerdictParam();
    setLink({ kind: 'none' });
    setResets((n) => n + 1);
  }

  function restart() {
    setAnswers({});
    setFinished(false);
    setResets((n) => n + 1);
  }

  if (link.kind === 'valid') {
    return (
      <Layout
        gauge={<Gauge total={0} verdict={link.verdict} answered final shared announcement="" />}
        wizard={<SharedResult verdict={link.verdict} onStart={startTest} />}
      />
    );
  }

  return (
    <Layout
      gauge={
        <Gauge
          total={total}
          verdict={verdict}
          answered={answered}
          final={finished}
          announcement={announcement}
        />
      }
      wizard={
        finished ? (
          <Result answers={answers} onRestart={restart} />
        ) : (
          <>
            {link.kind === 'invalid' && (
              <SystemState
                role="status"
                title={t('state.invalid.title')}
                body={t('state.invalid.body')}
                action={{ label: t('state.invalid.cta'), onClick: startTest }}
              />
            )}
            <Wizard
              answers={answers}
              onAnswer={(questionId, answerId) =>
                setAnswers((prev) => ({ ...prev, [questionId]: answerId }))
              }
              onFinish={() => {
                track('verdict_reached', { verdict: finalVerdict(answers) });
                setFinished(true);
              }}
            />
          </>
        )
      }
    />
  );
}
