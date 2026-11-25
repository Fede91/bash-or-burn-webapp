import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { DEFAULT_LANG, setLang, t } from './i18n';

const scrollTo = vi.fn();
const scrollIntoView = vi.fn();

function stubMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({ matches: reduce && query.includes('reduce'), media: query }) as MediaQueryList,
  );
}

const split = () => document.querySelector('.split') as HTMLElement;
const intro = () => document.querySelector('.intro') as HTMLElement;
const form = () => document.getElementById('wizard-form') as HTMLFormElement;

function answerAndNext() {
  fireEvent.click(screen.getAllByRole('radio')[2] as HTMLElement);
  fireEvent.submit(form());
}

beforeEach(() => {
  setLang(DEFAULT_LANG);
  scrollTo.mockClear();
  scrollIntoView.mockClear();
  vi.stubGlobal('scrollTo', scrollTo);
  Element.prototype.scrollIntoView = scrollIntoView;
  stubMotion(false);
});

afterEach(() => vi.unstubAllGlobals());

describe('mobile intro collapse', () => {
  it('shows the intro at step 0, also after choosing an answer', () => {
    render(<App />);
    expect(split()).not.toHaveAttribute('data-started');
    expect(intro()).not.toHaveAttribute('inert');
    expect(intro()).not.toHaveAttribute('aria-hidden');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('radio')[2] as HTMLElement);
    expect(split()).not.toHaveAttribute('data-started');
  });

  it('hides the intro from step 1 and keeps focus on the question heading', () => {
    render(<App />);
    answerAndNext();
    expect(split()).toHaveAttribute('data-started', 'true');
    expect(intro()).toHaveAttribute('inert');
    expect(intro()).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(document.getElementById('q-title')).toHaveFocus();
  });

  it('shows the intro again when going back to step 0', () => {
    render(<App />);
    answerAndNext();
    fireEvent.click(screen.getByRole('button', { name: t('wizard.back') }));
    expect(split()).not.toHaveAttribute('data-started');
    expect(intro()).not.toHaveAttribute('inert');
    expect(intro()).not.toHaveAttribute('aria-hidden');
    expect(document.getElementById('q-title')).toHaveFocus();
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('keeps the intro hidden on the result and shows it after restart', () => {
    render(<App />);
    for (let i = 0; i < 7; i++) answerAndNext();
    expect(split()).toHaveAttribute('data-started', 'true');
    fireEvent.click(screen.getByRole('button', { name: t('result.restart') }));
    expect(split()).not.toHaveAttribute('data-started');
    expect(intro()).not.toHaveAttribute('inert');
    expect(document.getElementById('q-title')).toHaveFocus();
  });

  it('scrolls the question heading into view with smooth motion by default', () => {
    render(<App />);
    answerAndNext();
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'start', behavior: 'smooth' });
  });

  it('uses instant scrolling with prefers-reduced-motion', () => {
    stubMotion(true);
    render(<App />);
    answerAndNext();
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'start', behavior: 'auto' });
    fireEvent.click(screen.getByRole('button', { name: t('wizard.back') }));
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' });
  });
});
