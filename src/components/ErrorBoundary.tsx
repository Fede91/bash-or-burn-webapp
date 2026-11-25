import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '../i18n';
import SystemState from './SystemState';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="state-page">
        <SystemState
          role="alert"
          title={t('state.error.title')}
          body={t('state.error.body')}
          action={{ label: t('state.error.cta'), onClick: () => window.location.reload() }}
        />
      </main>
    );
  }
}
