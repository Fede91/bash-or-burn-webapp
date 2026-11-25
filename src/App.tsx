import Gauge from './components/Gauge';
import Layout from './components/Layout';
import type { Verdict } from './lib/gauge';

// Initial, unanswered state. The wizard (next task) will own and drive these values.
const INITIAL_TOTAL = 0;
const INITIAL_VERDICT: Verdict = 'let-it-write';

export default function App() {
  return (
    <Layout
      gauge={
        <Gauge total={INITIAL_TOTAL} verdict={INITIAL_VERDICT} answered={false} announcement="" />
      }
    />
  );
}
