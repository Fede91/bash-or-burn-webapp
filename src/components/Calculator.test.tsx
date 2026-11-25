import { act, fireEvent, render, screen } from '@testing-library/react';
import { DEFAULT_LANG, setLang, t } from '../i18n';
import Calculator from './Calculator';

beforeEach(() => setLang(DEFAULT_LANG));
afterEach(() => vi.useRealTimers());

const lines = (c: HTMLElement) => Array.from(c.querySelectorAll('.calc-out li'));

describe('Calculator', () => {
  it('renders 3 output lines and an irony line with the defaults', () => {
    const { container } = render(<Calculator verdict="let-it-write" number="03" />);
    expect(lines(container)).toHaveLength(3);
    expect(lines(container)[0]).toHaveTextContent(/Costo annuo/);
    expect(lines(container)[1]).toHaveTextContent('155.125.000');
    // 574.875 USD * 0.86 = about 494 EUR: band b3
    expect(screen.getByText(t('calc.irony.b3'))).toBeInTheDocument();
  });

  it('changes the figure when the currency changes', () => {
    const { container } = render(<Calculator verdict="bash" number="02" />);
    const before = container.querySelector('.calc-featured strong')?.textContent;
    fireEvent.change(screen.getByLabelText(t('calc.currency.label')), { target: { value: 'usd' } });
    const after = container.querySelector('.calc-featured strong')?.textContent;
    expect(before).not.toBe(after);
    expect(after).toMatch(/575/);
  });

  it('keeps the slider and the runs input in sync', () => {
    render(<Calculator verdict="bash" number="02" />);
    const input = screen.getByLabelText(t('calc.runs.label'), { selector: 'input[type=number]' });
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '1000' } });
    expect(input).toHaveValue(10000);
    expect(slider).toHaveAttribute('aria-valuetext', t('calc.runs.valuetext', { n: '10.000' }));
    fireEvent.change(input, { target: { value: '1' } });
    expect(slider).toHaveValue('0');
  });

  it('flags invalid runs with aria-invalid and a message, no crash', () => {
    render(<Calculator verdict="bash" number="02" />);
    const input = screen.getByLabelText(t('calc.runs.label'), { selector: 'input[type=number]' });
    expect(input).toHaveAttribute('aria-invalid', 'false');
    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(t('calc.error.runs'))).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '20000' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(input, { target: { value: '20' } });
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('uses the Burn variant', () => {
    const { container } = render(<Calculator verdict="burn" number="02" />);
    expect(screen.getByText(t('calc.intro.burn'))).toBeInTheDocument();
    expect(screen.getByText(t('calc.out.script.burn'))).toBeInTheDocument();
    expect(screen.getByText(t('calc.irony.burn'))).toBeInTheDocument();
    expect(lines(container)).toHaveLength(3);
  });

  it('uses the Bash + 1 call script line', () => {
    render(<Calculator verdict="bash-1call" number="02" />);
    expect(screen.getByText(t('calc.out.script.bash1call'))).toBeInTheDocument();
  });

  it('announces the cost once, debounced by 600 ms', () => {
    vi.useFakeTimers();
    const { container } = render(<Calculator verdict="bash" number="02" />);
    const live = container.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(live).toBeEmptyDOMElement();
    const input = screen.getByLabelText(t('calc.tin.label'));
    fireEvent.change(input, { target: { value: '9000' } });
    fireEvent.change(input, { target: { value: '10000' } });
    act(() => vi.advanceTimersByTime(599));
    expect(live).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1));
    expect(live).toHaveTextContent(/Costo annuo aggiornato/);
  });
});
