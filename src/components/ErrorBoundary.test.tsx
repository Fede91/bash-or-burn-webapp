import { render, screen } from '@testing-library/react';
import { DEFAULT_LANG, setLang, t } from '../i18n';
import ErrorBoundary from './ErrorBoundary';

function Boom(): never {
  throw new Error('boom');
}

beforeEach(() => setLang(DEFAULT_LANG));

describe('ErrorBoundary', () => {
  it('shows the generic error state with a reload button', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText(t('state.error.title'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('state.error.cta') })).toBeInTheDocument();
    spy.mockRestore();
  });
});
