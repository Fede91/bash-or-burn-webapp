import { useState, type ReactNode } from 'react';
import type { Verdict } from '../lib/gauge';
import { t, type MessageKey } from '../i18n';
import { track, type ShareMethod } from '../lib/analytics';
import { linkedinIntentUrl, linkedinText, shareUrl, xIntentUrl, xText } from '../lib/share';

const PANEL_ID = 'share-panel';

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

interface ShareButtonProps {
  verdict: Verdict;
  children?: ReactNode;
}

export default function ShareButton({ verdict, children }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<MessageKey | null>(null);

  async function report(text: string, ok: MessageKey, method: ShareMethod) {
    track('result_shared', { verdict, method });
    setFeedback((await copy(text)) ? ok : 'state.copyFail');
  }

  async function toggle() {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: xText(verdict), url: shareUrl(verdict) });
        track('result_shared', { verdict, method: 'native' });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    setOpen((value) => !value);
  }

  return (
    <div className="share">
      <div className="share-row">
        <button
          type="button"
          className="btn btn-primary"
          aria-expanded={open}
          aria-controls={PANEL_ID}
          onClick={toggle}
        >
          {t('share.button')}
        </button>
        {children}
      </div>
      <div id={PANEL_ID} className="share-panel" hidden={!open}>
        <a
          className="btn btn-outline"
          href={xIntentUrl(verdict)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('result_shared', { verdict, method: 'x' })}
        >
          {t('share.x')}
          <span className="sr-only">{t('a11y.share.x')}</span>
        </a>
        <a
          className="btn btn-outline"
          href={linkedinIntentUrl(verdict)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => report(linkedinText(verdict), 'share.linkedin.copied', 'linkedin')}
        >
          {t('share.linkedin')}
          <span className="sr-only">{t('a11y.share.linkedin')}</span>
        </a>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => report(shareUrl(verdict), 'share.copied', 'copy')}
        >
          {t('share.copy')}
        </button>
      </div>
      <p className="share-feedback" aria-live="polite">
        {feedback ? t(feedback) : ''}
      </p>
    </div>
  );
}
