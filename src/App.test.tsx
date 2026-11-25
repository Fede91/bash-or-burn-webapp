import { render, screen } from '@testing-library/react';
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
});
