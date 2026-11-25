import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import Cta from './components/Cta';
import Footer from './components/Footer';
import Nav from './components/Nav';
import ShareButton from './components/ShareButton';
import { DEFAULT_LANG, setLang, t } from './i18n';
import { track } from './lib/analytics';

vi.mock('./lib/analytics', () => ({ track: vi.fn() }));

beforeEach(() => {
  setLang(DEFAULT_LANG);
  vi.mocked(track).mockClear();
});

const submit = () => fireEvent.submit(document.getElementById('wizard-form') as HTMLFormElement);

describe('wizard events', () => {
  it('emits started once, nothing for an empty submit', () => {
    render(<App />);
    submit();
    expect(vi.mocked(track).mock.calls).toEqual([['wizard_started']]);
  });

  it('emits 7 step events and one verdict without answer ids', () => {
    render(<App />);
    for (let i = 0; i < 7; i++) {
      fireEvent.click(screen.getAllByRole('radio')[2] as HTMLElement);
      submit();
    }
    const calls = vi.mocked(track).mock.calls;
    const steps = calls.filter(([e]) => e === 'question_answered');
    expect(steps.map(([, p]) => p)).toEqual(
      [1, 2, 3, 4, 5, 6, 7].map((step_index) => ({ step_index, step_total: 7 })),
    );
    const verdicts = calls.filter(([e]) => e === 'verdict_reached');
    expect(verdicts).toHaveLength(1);
    expect(Object.keys(verdicts[0]?.[1] as object)).toEqual(['verdict']);
  });
});

describe('click events', () => {
  it('share handlers emit result_shared', () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    render(<ShareButton verdict="bash" />);
    fireEvent.click(screen.getByRole('button', { name: t('share.copy'), hidden: true }));
    const x = screen.getByRole('link', { name: (n) => n.includes(t('share.x')), hidden: true });
    x.addEventListener('click', (e) => e.preventDefault());
    fireEvent.click(x);
    expect(track).toHaveBeenCalledWith('result_shared', { verdict: 'bash', method: 'copy' });
    expect(track).toHaveBeenCalledWith('result_shared', { verdict: 'bash', method: 'x' });
  });

  it.each([
    ['nav', <Nav key="n" />],
    ['footer', <Footer key="f" />],
    ['cta', <Cta key="c" verdict="bash" />],
  ] as const)('%s link emits cta_clicked', (location, ui) => {
    render(ui);
    const link = screen.getByRole('link', { name: (n) => n.includes('federicobagato.it') });
    link.addEventListener('click', (e) => e.preventDefault());
    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith('cta_clicked', { location });
  });
});
