import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { t } from '../i18n';

const q = (n: number) => `Domanda ${n} di 7.`;

function choose(letter: string) {
  const radios = screen.getAllByRole('radio');
  fireEvent.click(radios['abc'.indexOf(letter)] as HTMLElement);
}
const form = () => document.getElementById('wizard-form') as HTMLFormElement;
const next = () => fireEvent.submit(form());

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, 'startViewTransition');
});

describe('Wizard', () => {
  it('renders step 1 with progress and three real radios', () => {
    render(<App />);
    expect(screen.getByText('01 / 07')).toBeInTheDocument();
    expect(document.querySelectorAll('.segment')).toHaveLength(7);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByText(q(1))).toHaveClass('sr-only');
    expect(screen.queryByText(t('wizard.back'))).not.toBeInTheDocument();
  });

  it('shows an assertive error, focuses the first radio and never disables the button', () => {
    render(<App />);
    next();
    const error = screen.getByText(t('wizard.error.none'));
    expect(error.closest('[aria-live="assertive"]')).not.toBeNull();
    expect(screen.getAllByRole('radio')[0]).toHaveFocus();
    expect(screen.getByText('01 / 07')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(t('wizard.next')) })).toBeEnabled();
    choose('a');
    expect(screen.queryByText(t('wizard.error.none'))).not.toBeInTheDocument();
  });

  it('advances, focuses the new heading, and Back keeps answers', () => {
    render(<App />);
    choose('c');
    next();
    expect(screen.getByText('02 / 07')).toBeInTheDocument();
    expect(document.activeElement).toBe(document.getElementById('q-title'));
    expect(screen.getByRole('button', { name: t('wizard.back') })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t('wizard.back') }));
    expect(screen.getByText('01 / 07')).toBeInTheDocument();
    expect(document.activeElement).toBe(document.getElementById('q-title'));
    expect(screen.getAllByRole('radio')[2]).toBeChecked();
  });

  it('does not focus the heading on first load', () => {
    render(<App />);
    expect(document.activeElement).toBe(document.body);
  });

  it('updates the Gauge live region after each answer', () => {
    render(<App />);
    choose('c');
    expect(screen.getByText(/Totale provvisorio \+2/)).toBeInTheDocument();
    next();
    choose('a');
    expect(screen.getByText(/Totale provvisorio 0/)).toBeInTheDocument();
  });

  it('completes 7 steps and shows the MCP note on Q7', () => {
    render(<App />);
    for (let i = 0; i < 6; i++) {
      choose('b');
      next();
    }
    expect(screen.getByText('07 / 07')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: new RegExp(t('wizard.submit')) }),
    ).toBeInTheDocument();
    choose('b');
    const note = document.getElementById('note')!;
    expect(within(note).getByText(t('wizard.q7.b.note'))).toBeInTheDocument();
    choose('a');
    expect(note).toBeEmptyDOMElement();
    choose('c');
    next();
    expect(screen.queryByText(t('wizard.error.none'))).not.toBeInTheDocument();
    expect(form()).toHaveAttribute('data-finished', 'true');
  });

  describe('view transitions', () => {
    it('skips them under reduced motion', () => {
      const start = vi.fn();
      Object.assign(document, { startViewTransition: start });
      vi.stubGlobal('matchMedia', () => ({ matches: true }));
      render(<App />);
      choose('a');
      next();
      expect(start).not.toHaveBeenCalled();
      expect(screen.getByText('02 / 07')).toBeInTheDocument();
    });

    it('uses them otherwise', () => {
      const start = vi.fn((cb: () => void) => {
        cb();
        return {};
      });
      Object.assign(document, { startViewTransition: start });
      vi.stubGlobal('matchMedia', () => ({ matches: false }));
      render(<App />);
      choose('a');
      act(() => next());
      expect(start).toHaveBeenCalledTimes(1);
      expect(screen.getByText('02 / 07')).toBeInTheDocument();
    });
  });
});
