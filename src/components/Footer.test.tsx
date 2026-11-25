import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';
import { DEFAULT_LANG, setLang, t } from '../i18n';
import Footer from './Footer';

beforeEach(() => setLang(DEFAULT_LANG));

describe('Footer', () => {
  it('marks the legal line as a placeholder', () => {
    const { container } = render(<Footer />);
    const legal = container.querySelector('[data-placeholder="legal"]');
    expect(legal).toHaveTextContent(t('footer.legal.placeholder'));
  });

  it('renders on the question and result screens', () => {
    render(<App />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    for (let i = 0; i < 7; i++) {
      fireEvent.click(screen.getAllByRole('radio')[2] as HTMLElement);
      fireEvent.submit(document.getElementById('wizard-form') as HTMLFormElement);
    }
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('share.button') })).toBeInTheDocument();
  });
});
