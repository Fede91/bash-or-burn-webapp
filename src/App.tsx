import { useState } from 'react';
import Gauge from './components/Gauge';
import Layout from './components/Layout';
import Wizard from './components/Wizard';
import { provisionalAnnouncement } from './i18n/gauge-messages';
import { provisionalZone, runningTotal, type Answers } from './lib/score';

export default function App() {
  const [answers, setAnswers] = useState<Answers>({});

  const total = runningTotal(answers);
  const answered = Object.keys(answers).length !== 0;
  const verdict = provisionalZone(answers);
  const announcement = answered ? provisionalAnnouncement(total, verdict) : '';

  return (
    <Layout
      gauge={
        <Gauge total={total} verdict={verdict} answered={answered} announcement={announcement} />
      }
      wizard={
        <Wizard
          answers={answers}
          onAnswer={(questionId, answerId) =>
            setAnswers((prev) => ({ ...prev, [questionId]: answerId }))
          }
        />
      }
    />
  );
}
