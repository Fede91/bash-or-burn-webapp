import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DEFAULT_LANG, setLang, t } from '../i18n';
import { verdicts } from '../data/verdicts';
import type { Verdict } from '../lib/gauge';
import { score, type Answers } from '../lib/score';
import Result from './Result';

beforeEach(() => setLang(DEFAULT_LANG));

const pick = (letters: string): Answers =>
  Object.fromEntries(letters.split('').map((l, i) => [`q${i + 1}`, l]));

const CASES: { verdict: Verdict; answers: Answers; code: boolean }[] = [
  { verdict: 'bash', answers: pick('aaaaaaa'), code: true },
  { verdict: 'bash-1call', answers: pick('aabbaaa'), code: false },
  { verdict: 'burn', answers: pick('ccccccc'), code: false },
  { verdict: 'let-it-write', answers: pick('bbbcbbb'), code: true },
];

describe.each(CASES)('Result for $verdict', ({ verdict, answers, code }) => {
  const data = verdicts[verdict];

  it('derives the verdict from the answers', () => {
    expect(score(answers).verdict).toBe(verdict);
  });

  it('puts the verdict colour only on the badge dot and title line 2', () => {
    const { container } = render(<Result answers={answers} onRestart={() => {}} />);
    expect(container.firstElementChild).toHaveAttribute('data-verdict', verdict);

    const badge = container.querySelector('.result-badge') as HTMLElement;
    expect(badge).toHaveTextContent(t('result.badge', { name: t(data.name) }));
    expect(badge.querySelector('.result-dot')).toHaveAttribute('aria-hidden', 'true');

    const title = document.getElementById('q-title') as HTMLElement;
    expect(title).toHaveAttribute('id', 'q-title');
    const [line1, line2] = Array.from(title.querySelectorAll('span'));
    expect(line1).toHaveTextContent(t(data.title.line1));
    expect(line2).toHaveTextContent(t(data.title.line2));
    expect(line1).not.toHaveClass('result-line-2');
    expect(line2).toHaveClass('result-line-2');

    const verdictClasses = ['result-dot', 'result-line-2'];
    const coloured = Array.from(container.querySelectorAll('[class]')).filter((el) =>
      verdictClasses.some((c) => el.classList.contains(c)),
    );
    expect(coloured).toHaveLength(2);
    expect(container.querySelectorAll('[style]')).toHaveLength(1);
  });

  it('shows the code block only for Bash and Let it write', () => {
    render(<Result answers={answers} onRestart={() => {}} />);
    const block = screen.queryByRole('region', { name: /bash/i });
    if (code) expect(block).toBeInTheDocument();
    else expect(block).not.toBeInTheDocument();
    expect(screen.queryByText(t('result.toc.code')) !== null).toBe(code);
    expect(
      screen.getByRole('link', { name: t(code ? 'result.toc.calc' : 'result.toc.calc.nocode') }),
    ).toHaveAttribute('href', '#calculator');
  });

  it('shows two factor rows, the calculator and the restart button', () => {
    const { container } = render(<Result answers={answers} onRestart={() => {}} />);
    expect(container.querySelectorAll('.factor')).toHaveLength(2);
    expect(container.querySelector('section#calculator')).toBeInTheDocument();
    expect(container.querySelectorAll('.calc-out li')).toHaveLength(3);
    expect(screen.getByText('07 / 07')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('result.restart') })).toBeInTheDocument();
    expect(screen.getByText(t(data.message))).toBeInTheDocument();
  });
});

describe('Result details', () => {
  it('focuses the title on mount', () => {
    render(<Result answers={pick('aaaaaaa')} onRestart={() => {}} />);
    expect(document.getElementById('q-title') as HTMLElement).toHaveFocus();
  });

  it('calls onRestart', () => {
    const onRestart = vi.fn();
    render(<Result answers={pick('aaaaaaa')} onRestart={onRestart} />);
    fireEvent.click(screen.getByRole('button', { name: t('result.restart') }));
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it('shows the signed total in the tagline', () => {
    render(<Result answers={pick('ccccccc')} onRestart={() => {}} />);
    expect(screen.getByText(/totale \+/)).toBeInTheDocument();
  });

  it('shows Q4 then Q3 and the note on Bash + 1 call', () => {
    const { container } = render(<Result answers={pick('aabbaaa')} onRestart={() => {}} />);
    const indexes = Array.from(container.querySelectorAll('.factor-index')).map(
      (e) => e.textContent,
    );
    expect(indexes).toEqual(['D4', 'D3']);
    expect(screen.getByText(t('result.factors.note.bash1call'))).toBeInTheDocument();
  });

  it('shows the when text on Burn', () => {
    render(<Result answers={pick('ccccccc')} onRestart={() => {}} />);
    expect(screen.getByText(t('verdict.burn.when'))).toBeInTheDocument();
  });
});

describe('verdict colour in CSS', () => {
  it('uses var(--verdict) only for the result dot border, title line 2 and the cta left rule', () => {
    const css = readFileSync(resolve(__dirname, '../styles/layout.css'), 'utf8');
    const rules = Array.from(css.matchAll(/([^{}]+)\{([^{}]*var\(--verdict\)[^{}]*)\}/g));
    const found = rules.map((m) => `${(m[1] ?? '').trim()} :: ${(m[2] ?? '').trim()}`);
    expect(found).toEqual([
      '.result-dot :: ' + found[0]?.split(' :: ')[1],
      '.result-line-2 :: color: var(--verdict);',
      '.cta :: ' + found[2]?.split(' :: ')[1],
    ]);
    expect(found[2]).toContain('border-left: 4px solid var(--verdict)');
    expect(found[0]).toContain('border: 3.5px solid var(--verdict)');
  });
});
