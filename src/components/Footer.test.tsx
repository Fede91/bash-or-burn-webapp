import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';
import { DEFAULT_LANG, setLang, t } from '../i18n';
import Footer from './Footer';

beforeEach(() => setLang(DEFAULT_LANG));

describe('Footer', () => {
  it('shows the VAT number and none of the removed copy', () => {
    const { container } = render(<Footer />);
    expect(container).toHaveTextContent('P.IVA IT05747390283');
    expect(container.querySelector('[data-placeholder]')).toBeNull();
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });

  it('links to the privacy notice before the federicobagato.it link', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveTextContent(t('footer.privacy'));
    expect(links[0]).toHaveAttribute('href', '/privacy');
    expect(links[1]).toHaveTextContent(t('footer.link'));
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
