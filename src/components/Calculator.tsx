import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { defaultModel, prices } from '../data/prices';
import { getLang, t, type MessageKey } from '../i18n';
import {
  RUNS_MAX,
  RUNS_MIN,
  SLIDER_MAX,
  TOKENS_MAX,
  TOKENS_MIN,
  convert,
  currencySymbol,
  formatDate,
  formatMoney,
  formatNumber,
  ironyBand,
  parseInteger,
  runsToSlider,
  sliderToRuns,
  yearlyCostUsd,
  yearlyTokens,
} from '../lib/cost';
import type { Currency } from '../data/prices';
import type { Verdict } from '../lib/gauge';

interface CalculatorProps {
  verdict: Verdict;
  /** Section number shown as the eyebrow, e.g. "03". */
  number: string;
}

const LIVE_DEBOUNCE_MS = 600;
const AMOUNT_MARK = '\u0000';

const SCRIPT_KEY: Partial<Record<Verdict, MessageKey>> = {
  'bash-1call': 'calc.out.script.bash1call',
  burn: 'calc.out.script.burn',
};

const IRONY_KEYS = {
  b1: 'calc.irony.b1',
  b2: 'calc.irony.b2',
  b3: 'calc.irony.b3',
  b4: 'calc.irony.b4',
  b5: 'calc.irony.b5',
  burn: 'calc.irony.burn',
} as const satisfies Record<string, MessageKey>;

interface FieldProps {
  id: string;
  label: MessageKey;
  hint: MessageKey;
  hintVars?: Record<string, string>;
  error?: MessageKey;
  children: (describedBy: string) => ReactNode;
}

function Field({ id, label, hint, hintVars, error, children }: FieldProps) {
  const describedBy = error ? `${id}-hint ${id}-err` : `${id}-hint`;
  return (
    <>
      <label className="field-label" htmlFor={id} id={`${id}-label`}>
        {t(label)}
      </label>
      <p className="field-hint" id={`${id}-hint`}>
        {t(hint, hintVars)}
      </p>
      {children(describedBy)}
      <p className="error" id={`${id}-err`}>
        {error && (
          <>
            <span aria-hidden="true">{'!'}</span>
            {t(error)}
          </>
        )}
      </p>
    </>
  );
}

export default function Calculator({ verdict, number }: CalculatorProps) {
  const lang = getLang();
  const [runsText, setRunsText] = useState('50');
  const [tinText, setTinText] = useState('8000');
  const [toutText, setToutText] = useState('500');
  const [runs, setRuns] = useState(50);
  const [tin, setTin] = useState(8000);
  const [tout, setTout] = useState(500);
  const [modelId, setModelId] = useState('sonnet-5-5');
  const [currency, setCurrency] = useState<Currency>('eur');
  const [live, setLive] = useState('');

  const model = prices.models.find((m) => m.id === modelId) ?? defaultModel;
  const usd = yearlyCostUsd(runs, tin, tout, model.inPerM, model.outPerM);
  const amount = convert(usd, currency);
  const amountText = formatMoney(amount, currency, lang);
  const tokensText = formatNumber(yearlyTokens(runs, tin, tout), lang);
  const date = formatDate(prices.asOf, lang);

  const runsInvalid = parseInteger(runsText, RUNS_MIN, RUNS_MAX) === null;
  const tinInvalid = parseInteger(tinText, TOKENS_MIN, TOKENS_MAX) === null;
  const toutInvalid = parseInteger(toutText, TOKENS_MIN, TOKENS_MAX) === null;

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(
      () => setLive(t('calc.live', { amount: amountText })),
      LIVE_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [amountText]);

  function numberHandler(
    setText: (v: string) => void,
    setValue: (v: number) => void,
    min: number,
    max: number,
  ) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
      const parsed = parseInteger(e.target.value, min, max);
      if (parsed !== null) setValue(parsed);
    };
  }

  function onSlider(e: ChangeEvent<HTMLInputElement>) {
    const next = sliderToRuns(Number(e.target.value));
    setRuns(next);
    setRunsText(String(next));
  }

  const [costBefore, costAfter] = t('calc.out.cost', { amount: AMOUNT_MARK }).split(AMOUNT_MARK);
  const scriptKey = SCRIPT_KEY[verdict] ?? 'calc.out.script';

  return (
    <>
      <p className="eyebrow" aria-hidden="true">
        {number}
      </p>
      <h3 className="section-title">{t('calc.title')}</h3>
      <p className="section-lead">{t(verdict === 'burn' ? 'calc.intro.burn' : 'calc.intro')}</p>

      <div className="calc-fields">
        <div className="calc-cell calc-wide">
          <Field
            id="calc-runs"
            label="calc.runs.label"
            hint="calc.runs.hint"
            error={runsInvalid ? 'calc.error.runs' : undefined}
          >
            {(describedBy) => (
              <div className="calc-runs">
                <input
                  id="calc-runs"
                  className="control"
                  type="number"
                  inputMode="numeric"
                  value={runsText}
                  aria-invalid={runsInvalid}
                  aria-describedby={describedBy}
                  onChange={numberHandler(setRunsText, setRuns, RUNS_MIN, RUNS_MAX)}
                />
                <input
                  className="slider"
                  type="range"
                  min={0}
                  max={SLIDER_MAX}
                  step={1}
                  value={runsToSlider(runs)}
                  aria-labelledby="calc-runs-label"
                  aria-valuetext={t('calc.runs.valuetext', { n: formatNumber(runs, lang) })}
                  onChange={onSlider}
                />
              </div>
            )}
          </Field>
        </div>
        <div className="calc-cell">
          <Field
            id="calc-tin"
            label="calc.tin.label"
            hint="calc.tin.hint"
            error={tinInvalid ? 'calc.error.tokens' : undefined}
          >
            {(describedBy) => (
              <input
                id="calc-tin"
                className="control"
                type="number"
                inputMode="numeric"
                value={tinText}
                aria-invalid={tinInvalid}
                aria-describedby={describedBy}
                onChange={numberHandler(setTinText, setTin, TOKENS_MIN, TOKENS_MAX)}
              />
            )}
          </Field>
        </div>
        <div className="calc-cell">
          <Field
            id="calc-tout"
            label="calc.tout.label"
            hint="calc.tout.hint"
            error={toutInvalid ? 'calc.error.tokens' : undefined}
          >
            {(describedBy) => (
              <input
                id="calc-tout"
                className="control"
                type="number"
                inputMode="numeric"
                value={toutText}
                aria-invalid={toutInvalid}
                aria-describedby={describedBy}
                onChange={numberHandler(setToutText, setTout, TOKENS_MIN, TOKENS_MAX)}
              />
            )}
          </Field>
        </div>
        <div className="calc-cell">
          <Field
            id="calc-model"
            label="calc.model.label"
            hint="calc.model.hint"
            hintVars={{ date }}
          >
            {(describedBy) => (
              <select
                id="calc-model"
                className="control"
                value={model.id}
                aria-describedby={describedBy}
                onChange={(e) => setModelId(e.target.value)}
              >
                {prices.models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <div className="calc-cell">
          <Field
            id="calc-currency"
            label="calc.currency.label"
            hint="calc.currency.hint"
            hintVars={{ date }}
          >
            {(describedBy) => (
              <select
                id="calc-currency"
                className="control"
                value={currency}
                aria-describedby={describedBy}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                {prices.currencies.map((c) => (
                  <option key={c} value={c}>
                    {t(c === 'eur' ? 'calc.currency.eur' : 'calc.currency.usd')}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </div>

      <ul className="calc-out">
        <li className="calc-featured">
          {costBefore}
          <strong>{amountText}</strong>
          {costAfter}
        </li>
        <li>{t('calc.out.tokens', { tokens: tokensText })}</li>
        <li>{t(scriptKey, { currency: currencySymbol(currency) })}</li>
      </ul>
      <p className="calc-irony">{t(IRONY_KEYS[ironyBand(amount, verdict)])}</p>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
    </>
  );
}
