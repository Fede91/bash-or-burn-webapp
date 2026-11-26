import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './components/ErrorBoundary';
import PrivacyPage from './components/PrivacyPage';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

// No initAnalytics here: the notice page sends no events (track() is a no-op without a client).
createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <PrivacyPage />
    </ErrorBoundary>
  </StrictMode>,
);
