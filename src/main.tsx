import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import { initAnalytics } from './lib/analytics';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Analytics loads after the page is interactive so it never competes with first render.
window.addEventListener('load', () => {
  if ('requestIdleCallback' in window) window.requestIdleCallback(initAnalytics);
  else setTimeout(initAnalytics, 1);
});
