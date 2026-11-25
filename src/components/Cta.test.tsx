import { render, screen } from '@testing-library/react';
import { verdicts } from '../data/verdicts';
import { DEFAULT_LANG, setLang, t } from '../i18n';
import type { Verdict } from '../lib/gauge';
import { ANSWERS } from '../test/verdict-answers';
import Cta from './Cta';
import Result from './Result';

const slugs = Object.keys(verdicts) as Verdict[];

beforeEach(() => setLang(DEFAULT_LANG));

describe('Cta', () => {
  it.each(slugs)('%s: links to federicobagato.it', (slug) => {
    render(<Cta verdict={slug} />);
    const link = screen.getByRole('link', { name: (n) => n.includes(t('cta.link')) });
    expect(link).toHaveAttribute('href', 'https://federicobagato.it');
    expect(link).not.toHaveAttribute('target');
  });

  it.each(slugs)('%s: Result shows share, CTA and restart', (slug) => {
    render(<Result answers={ANSWERS[slug]} onRestart={() => {}} />);
    expect(document.querySelector(`[data-verdict="${slug}"]`)).not.toBeNull();
    expect(
      screen.getByRole('link', { name: (n) => n.includes(t('cta.link')) }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('share.button') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('result.restart') })).toBeInTheDocument();
  });
});
