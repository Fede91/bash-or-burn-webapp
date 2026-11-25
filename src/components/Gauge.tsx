import { useId, type CSSProperties } from 'react';
import {
  CUT_BASH_POSITION,
  CUT_BURN_POSITION,
  TICK_COUNT,
  formatTotal,
  needlePosition,
  zoneFor,
  type Verdict,
  type Zone,
} from '../lib/gauge';
import { verdictName } from '../i18n/gauge-messages';
import { t, type MessageKey } from '../i18n';

export interface GaugeProps {
  total: number;
  verdict: Verdict;
  /** False until the first answer: no zone is highlighted. */
  answered: boolean;
  /** Shared link without answers: no total, no needle, no zone. */
  shared?: boolean;
  /** Result screen: final label. */
  final?: boolean;
  /** Text for the polite live region; empty until an answer changes. */
  announcement: string;
}

interface LegendEntry {
  zone: Zone;
  name: MessageKey;
  range: MessageKey;
  colour: string;
}

const LEGEND: readonly LegendEntry[] = [
  {
    zone: 'bash',
    name: 'gauge.legend.bash.name',
    range: 'gauge.legend.bash.range',
    colour: 'var(--verdict-bash)',
  },
  {
    zone: 'let-it-write',
    name: 'gauge.legend.letItWrite.name',
    range: 'gauge.legend.letItWrite.range',
    colour: 'var(--verdict-let-it-write)',
  },
  {
    zone: 'burn',
    name: 'gauge.legend.burn.name',
    range: 'gauge.legend.burn.range',
    colour: 'var(--verdict-burn)',
  },
];

const TICKS = Array.from({ length: TICK_COUNT }, (_, i) => ({ i, major: (i - 14) % 2 === 0 }));

const TOTAL_MARK = '\u0000';

function cssVars(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties;
}

export default function Gauge({
  total,
  verdict,
  answered,
  shared = false,
  final = false,
  announcement,
}: GaugeProps) {
  const headingId = useId();
  const zone = zoneFor(total);
  const showResult = answered && !shared;
  const overridden = showResult && verdict === 'bash-1call';
  const [totalBefore, totalAfter] = t('gauge.total', { total: TOTAL_MARK }).split(TOTAL_MARK);
  const noteKey: MessageKey = shared
    ? 'gauge.shared'
    : answered
      ? 'gauge.note.bash1call'
      : 'gauge.empty';

  return (
    <section className="gauge" aria-labelledby={headingId}>
      <div className="g-head">
        <div className="g-title">
          <h2 id={headingId} className="g-label">
            <span className="g-label-full">{t(final ? 'gauge.label.final' : 'gauge.label')}</span>
            <span className="g-label-bar">{t('gauge.bar.label')}</span>
          </h2>
          {showResult && (
            <p className="g-zone">{t('gauge.bar.zone', { verdict: verdictName(verdict) })}</p>
          )}
        </div>
        {!shared && (
          <p className="g-total">
            {totalBefore}
            <b>{formatTotal(total)}</b>
            {totalAfter}
          </p>
        )}
      </div>

      <div className="scale" aria-hidden="true">
        <div className="ticks">
          {TICKS.map(({ i, major }) => (
            <span key={i} className={major ? 'tick major' : 'tick'} style={cssVars({ '--i': i })} />
          ))}
        </div>
        <div className="baseline">
          <span className="cut" style={cssVars({ left: `${CUT_BASH_POSITION}%` })} />
          <span className="cut" style={cssVars({ left: `${CUT_BURN_POSITION}%` })} />
        </div>
        <div className="nums">
          <span className="num num-min">{t('gauge.scale.min')}</span>
          <span className="num num-cut" style={{ left: `${CUT_BASH_POSITION}%` }}>
            -4
          </span>
          <span className="num num-zero">0</span>
          <span className="num num-cut" style={{ left: `${CUT_BURN_POSITION}%` }}>
            +5
          </span>
          <span className="num num-max">{t('gauge.scale.max')}</span>
        </div>
        {!shared && (
          <span
            className="needle"
            data-needle
            style={cssVars({ '--pos': `${needlePosition(total)}%` })}
          />
        )}
      </div>

      <ul className="legend">
        {LEGEND.map((entry) => (
          <li key={entry.zone} className={showResult && zone === entry.zone ? 'on' : undefined}>
            <span className="badge">
              <i className="dot" aria-hidden="true" style={cssVars({ '--vc': entry.colour })} />
              {t(entry.name)}
            </span>
            <span className="range">{t(entry.range)}</span>
          </li>
        ))}
      </ul>

      <p className={overridden ? 'g-note strong' : 'g-note'}>
        {answered && !shared && (
          <i
            className="dot note-dot"
            aria-hidden="true"
            style={cssVars({ '--vc': 'var(--verdict-bash-1call)' })}
          />
        )}
        <span>{t(noteKey)}</span>
      </p>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
