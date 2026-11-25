import { readFileSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { verdicts } from './data/verdicts';
import { DEFAULT_LANG, setLang, t } from './i18n';
import itMessages from './i18n/it.json';
import type { Verdict } from './lib/gauge';

const slugs = Object.keys(verdicts) as Verdict[];

beforeEach(() => setLang(DEFAULT_LANG));
afterEach(() => window.history.pushState({}, '', '/'));

describe('shared ?v= link', () => {
  it.each(slugs)('%s: shows the verdict without answers or total', (slug) => {
    window.history.pushState({}, '', `/?v=${slug}`);
    const { container } = render(<App />);
    expect(screen.getByText(t('state.shared.banner'))).toBeInTheDocument();
    expect(container.querySelector(`[data-verdict="${slug}"]`)).not.toBeNull();
    expect(
      screen.getByText(t('result.badge', { name: t(verdicts[slug].name) })),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: (n) => n.includes(t(verdicts[slug].title.line1)),
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.factor')).toHaveLength(0);
    expect(screen.getByText(t('gauge.shared'))).toBeInTheDocument();
    expect(container.querySelector('.legend .on')).toBeNull();
    expect(screen.getByRole('link', { name: (n) => n.includes(t('cta.link')) })).toHaveAttribute(
      'href',
      'https://federicobagato.it',
    );
    expect(screen.getByRole('button', { name: t('share.button') })).toBeInTheDocument();
    expect(document.getElementById('q-title')).toHaveFocus();
    expect(container.querySelector('.split')).toHaveAttribute('data-started', 'true');
    expect(container.querySelector('.intro')).toHaveAttribute('inert');
  });

  it('starts the wizard and clears the param from the shared view', () => {
    window.history.pushState({}, '', '/?v=burn');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: t('state.shared.cta') }));
    expect(window.location.search).toBe('');
    expect(screen.getAllByRole('radio').length).toBeGreaterThan(0);
  });

  it.each(['', 'nope', 'BASH', 'constructor', '__proto__'])(
    'invalid ?v=%s shows the invalid state and starts the test',
    (value) => {
      window.history.pushState({}, '', `/?v=${value}`);
      const { container } = render(<App />);
      expect(screen.getByText(t('state.invalid.title'))).toBeInTheDocument();
      expect(container.querySelector('[data-verdict]')).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: t('state.invalid.cta') }));
      expect(screen.queryByText(t('state.invalid.title'))).not.toBeInTheDocument();
      expect(window.location.search).toBe('');
      expect(screen.getAllByRole('radio').length).toBeGreaterThan(0);
    },
  );

  it('has no invalid state without ?v=', () => {
    render(<App />);
    expect(screen.queryByText(t('state.invalid.title'))).not.toBeInTheDocument();
  });
});

describe('index.html', () => {
  it('has a noscript with the IT message', () => {
    const html = readFileSync('index.html', 'utf8').replace(/\s+/g, ' ');
    expect(html).toMatch(/<noscript>[\s\S]*<\/noscript>/);
    expect(html).toContain(itMessages['state.noscript']);
  });
});
