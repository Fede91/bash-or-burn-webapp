import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { verdicts } from '../data/verdicts';
import { DEFAULT_LANG, setLang, t } from '../i18n';
import type { Verdict } from '../lib/gauge';
import { linkedinText, shareUrl } from '../lib/share';
import ShareButton from './ShareButton';

const slugs = Object.keys(verdicts) as Verdict[];

function setNav(key: 'clipboard' | 'share', value: unknown) {
  Object.defineProperty(navigator, key, { value, configurable: true });
}

beforeEach(() => setLang(DEFAULT_LANG));
afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard');
  Reflect.deleteProperty(navigator, 'share');
});

describe('ShareButton', () => {
  it('toggles the disclosure', () => {
    render(<ShareButton verdict="burn" />);
    const button = screen.getByRole('button', { name: t('share.button') });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it.each(slugs)('%s: the X link is external and carries ?v=', (slug) => {
    render(<ShareButton verdict={slug} />);
    fireEvent.click(screen.getByRole('button', { name: t('share.button') }));
    const link = screen.getByRole('link', { name: (n) => n.includes(t('a11y.share.x')) });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toMatch(/noopener/);
    expect(link.getAttribute('rel')).toMatch(/noreferrer/);
    expect(link.getAttribute('href')).toContain(encodeURIComponent(`?v=${slug}`));
  });

  it('copies the share URL', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNav('clipboard', { writeText });
    render(<ShareButton verdict="bash" />);
    fireEvent.click(screen.getByRole('button', { name: t('share.button') }));
    fireEvent.click(screen.getByRole('button', { name: t('share.copy') }));
    expect(await screen.findByText(t('share.copied'))).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(shareUrl('bash'));
  });

  it('shows the failure when the clipboard rejects or is missing', async () => {
    setNav('clipboard', { writeText: vi.fn().mockRejectedValue(new Error('no')) });
    render(<ShareButton verdict="bash" />);
    fireEvent.click(screen.getByRole('button', { name: t('share.button') }));
    fireEvent.click(screen.getByRole('button', { name: t('share.copy') }));
    expect(await screen.findByText(t('state.copyFail'))).toBeInTheDocument();
  });

  it('copies the LinkedIn text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNav('clipboard', { writeText });
    render(<ShareButton verdict="let-it-write" />);
    fireEvent.click(screen.getByRole('button', { name: t('share.button') }));
    const link = screen.getByRole('link', { name: (n) => n.includes(t('a11y.share.linkedin')) });
    link.addEventListener('click', (e) => e.preventDefault());
    fireEvent.click(link);
    expect(await screen.findByText(t('share.linkedin.copied'))).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(linkedinText('let-it-write'));
    expect(link.getAttribute('href')).toContain(encodeURIComponent('?v=let-it-write'));
  });

  it('uses Web Share when available and ignores AbortError', async () => {
    const share = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new DOMException('x', 'AbortError'));
    setNav('share', share);
    render(<ShareButton verdict="burn" />);
    const button = screen.getByRole('button', { name: t('share.button') });
    fireEvent.click(button);
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share.mock.calls[0]?.[0]).toMatchObject({ url: shareUrl('burn') });
    fireEvent.click(button);
    await waitFor(() => expect(share).toHaveBeenCalledTimes(2));
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(t('state.copyFail'))).not.toBeInTheDocument();
  });

  it('opens the disclosure when Web Share fails otherwise', async () => {
    setNav('share', vi.fn().mockRejectedValue(new Error('boom')));
    render(<ShareButton verdict="burn" />);
    const button = screen.getByRole('button', { name: t('share.button') });
    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'true'));
  });
});
