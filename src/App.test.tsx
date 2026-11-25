import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { DEFAULT_LANG, setLang, t } from './i18n';

beforeEach(() => setLang(DEFAULT_LANG));

describe('App shell', () => {
  it('makes the skip link the first focusable element, targeting #wizard', () => {
    const { container } = render(<App />);
    const skip = screen.getByRole('link', { name: t('nav.skip') });
    expect(skip).toHaveAttribute('href', '#wizard');
    expect(container.querySelector('#wizard')).toBeInTheDocument();
    expect(container.querySelector('a[href], button, input, [tabindex="0"]')).toBe(skip);
  });

  it('renders both title lines in the h1', () => {
    render(<App />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(t('intro.title.line1'));
    expect(h1).toHaveTextContent(t('intro.title.line2'));
  });

  it('exposes landmarks', () => {
    const { container } = render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(container.querySelector('main#top')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: t('wizard.region') })).toHaveAttribute(
      'id',
      'wizard',
    );
  });

  it('hides the nav arrow from assistive tech', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: 'federicobagato.it' });
    expect(link.querySelector('[aria-hidden="true"]')).toHaveTextContent('↗');
  });

  it('keeps html lang on the default language', () => {
    render(<App />);
    expect(document.documentElement.lang).toBe(DEFAULT_LANG);
  });

  it('shows the result with the final gauge, then restart resets everything', () => {
    render(<App />);
    const form = () => document.getElementById('wizard-form') as HTMLFormElement;
    for (let i = 0; i < 7; i++) {
      fireEvent.click(screen.getAllByRole('radio')[2] as HTMLElement);
      fireEvent.submit(form());
    }
    expect(screen.getByText(t('gauge.label.final'))).toBeInTheDocument();
    expect(document.querySelector('[data-verdict="burn"]')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: t('result.restart') }));
    expect(screen.queryByText(t('gauge.label.final'))).not.toBeInTheDocument();
    expect(screen.getByText('01 / 07')).toBeInTheDocument();
    expect(document.getElementById('q-title')).toHaveFocus();
    expect(screen.getByText(t('gauge.live.reset'))).toBeInTheDocument();
    expect(screen.getByText(t('gauge.empty'))).toBeInTheDocument();
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
  });
});
