import { render, screen } from '@testing-library/react';
import { PRIVACY_BLOCKS } from '../data/privacy';
import { DEFAULT_LANG, setLang, t } from '../i18n';
import PrivacyPage from './PrivacyPage';

beforeEach(() => setLang(DEFAULT_LANG));

describe('PrivacyPage', () => {
  it('has the shell landmarks, one h1 and a skip link to the text', () => {
    const { container } = render(<PrivacyPage />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(t('privacy.title'));
    expect(screen.getByRole('link', { name: t('privacy.skip') })).toHaveAttribute(
      'href',
      '#privacy',
    );
    expect(container.querySelector('main#privacy')).toBeInTheDocument();
  });

  it('links back to the test at top and bottom, and the brand goes home', () => {
    render(<PrivacyPage />);
    const back = screen.getAllByRole('link', { name: /Torna al test/ });
    expect(back).toHaveLength(2);
    for (const a of back) expect(a).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: t('nav.brand') })).toHaveAttribute('href', '/');
  });

  it('renders every section heading and inline links as anchors', () => {
    render(<PrivacyPage />);
    const h2 = PRIVACY_BLOCKS.filter((b) => b.type === 'h2').length;
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(h2);
    expect(
      screen.getAllByRole('link', { name: 'getintouch@federicobagato.it' })[0],
    ).toHaveAttribute('href', 'mailto:getintouch@federicobagato.it');
  });

  it('has the same keys in both languages', () => {
    for (const lang of ['it', 'en'] as const) {
      setLang(lang);
      for (const b of PRIVACY_BLOCKS) {
        for (const key of 'keys' in b ? b.keys : [b.key]) expect(t(key)).not.toBe('');
      }
    }
  });
});
