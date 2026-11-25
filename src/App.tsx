import { useEffect, useState } from 'react';
import Gauge from './components/Gauge';
import Layout from './components/Layout';
import Result from './components/Result';
import Wizard from './components/Wizard';
import {
  finalAnnouncement,
  provisionalAnnouncement,
  resetAnnouncement,
} from './i18n/gauge-messages';
import { finalVerdict, provisionalZone, runningTotal, type Answers } from './lib/score';

export default function App() {
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

  function restart() {
    setAnswers({});
    setFinished(false);
    setResets((n) => n + 1);
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
          <Wizard
            answers={answers}
            onAnswer={(questionId, answerId) =>
              setAnswers((prev) => ({ ...prev, [questionId]: answerId }))
            }
            onFinish={() => setFinished(true)}
          />
        )
      }
    />
  );
}
