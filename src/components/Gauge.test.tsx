import { render, screen, within } from '@testing-library/react';
import { needlePosition, type Verdict } from '../lib/gauge';
import { setLang, t } from '../i18n';
import Gauge, { type GaugeProps } from './Gauge';

beforeEach(() => setLang('it'));

function renderGauge(props: Partial<GaugeProps> = {}) {
  const utils = render(
    <Gauge total={0} verdict="let-it-write" answered announcement="" {...props} />,
  );
  const needle = utils.container.querySelector<HTMLElement>('[data-needle]');
  const on = utils.container.querySelectorAll('.legend li.on');
  return { ...utils, needle, on };
}

describe('Gauge needle and zone', () => {
  it.each<[number, Verdict, string]>([
    [-14, 'bash', 'Bash'],
    [-4, 'bash', 'Bash'],
    [5, 'burn', 'Burn'],
    [14, 'burn', 'Burn'],
  ])('total %i highlights %s', (total, verdict, name) => {
    const { needle, on } = renderGauge({ total, verdict });
    expect(needle?.style.getPropertyValue('--pos')).toBe(`${needlePosition(total)}%`);
    expect(on).toHaveLength(1);
    expect(within(on[0] as HTMLElement).getByText(name)).toBeInTheDocument();
  });

  it('shows the empty note and no zone before the first answer', () => {
    const { on } = renderGauge({ answered: false });
    expect(on).toHaveLength(0);
    expect(screen.getByText(t('gauge.empty'))).toBeInTheDocument();
  });

  it('emphasises the note for bash-1call without changing the zone', () => {
    const { on, container } = renderGauge({ total: 2, verdict: 'bash-1call' });
    expect(container.querySelector('.g-note')).toHaveClass('strong');
    expect(on).toHaveLength(1);
    expect(within(on[0] as HTMLElement).getByText(t('gauge.legend.letItWrite.name'))).toBeVisible();
  });

  it('hides needle and total in shared mode', () => {
    const { needle, on, container } = renderGauge({ shared: true });
    expect(needle).toBeNull();
    expect(on).toHaveLength(0);
    expect(container.querySelector('.g-total')).toBeNull();
    expect(screen.getByText(t('gauge.shared'))).toBeInTheDocument();
  });

  it('uses the final label on the result screen', () => {
    renderGauge({ final: true });
    expect(screen.getByText(t('gauge.label.final'))).toBeInTheDocument();
  });
});

describe('Gauge structure and a11y', () => {
  it('draws 29 ticks, 15 of them major', () => {
    const { container } = renderGauge();
    expect(container.querySelectorAll('.tick')).toHaveLength(29);
    expect(container.querySelectorAll('.tick.major')).toHaveLength(15);
  });

  it('puts the cuts at 37.5% and 66.0714%', () => {
    const { container } = renderGauge();
    const lefts = [...container.querySelectorAll<HTMLElement>('.cut')].map((c) =>
      parseFloat(c.style.left),
    );
    expect(lefts[0]).toBeCloseTo(37.5, 4);
    expect(lefts[1]).toBeCloseTo(66.0714, 3);
  });

  it('hides the scale from assistive tech', () => {
    const { container } = renderGauge();
    expect(container.querySelector('.scale')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps a polite live region, empty at first render, then announcing', () => {
    const { container, rerender } = renderGauge();
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toBeInTheDocument();
    expect(region).toHaveTextContent('');
    rerender(<Gauge total={3} verdict="burn" answered announcement={t('gauge.live.reset')} />);
    expect(region).toHaveTextContent(t('gauge.live.reset'));
  });

  it('renders legend names and ranges from the catalogue, dots hidden', () => {
    const { container } = renderGauge();
    const cells = container.querySelectorAll('.legend li');
    expect(cells).toHaveLength(3);
    expect(cells[0]).toHaveTextContent(
      `${t('gauge.legend.bash.name')}${t('gauge.legend.bash.range')}`,
    );
    expect(cells[2]).toHaveTextContent(t('gauge.legend.burn.range'));
    container
      .querySelectorAll('.dot')
      .forEach((d) => expect(d).toHaveAttribute('aria-hidden', 'true'));
  });

  it('shows the signed total', () => {
    const { container } = renderGauge({ total: -5, verdict: 'bash' });
    expect(container.querySelector('.g-total b')).toHaveTextContent('-5');
  });
});
