
// Import the React library.
import * as React from 'react';
// Import the ReactDOM library for rendering React components in the DOM.
import * as ReactDOM from 'react-dom/client';
// Import the main App component.
import App from './App';

// Import the main CSS file for global styles.
import './index.css';

declare global {
  interface Window {
    __uhubFirstLoadRefreshScheduled?: boolean;
  }
}

function scheduleFirstLoadRefresh() {
  if (window.__uhubFirstLoadRefreshScheduled) return;
  window.__uhubFirstLoadRefreshScheduled = true;
  const key = 'uhub:first-load-refresh:v1';
  try {
    const navigation = window.performance.getEntriesByType('navigation')[0];
    if (navigation && 'type' in navigation && navigation.type === 'reload') {
      window.sessionStorage.setItem(key, 'completed');
      return;
    }
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, 'scheduled');
    window.setTimeout(() => {
      try {
        if (window.sessionStorage.getItem(key) !== 'scheduled') return;
        window.sessionStorage.setItem(key, 'completed');
      } catch (error) {
        console.error('[STARTUP] Unable to complete the one-time refresh marker; refresh cancelled to avoid a reload loop.', error);
        return;
      }
      window.location.reload();
    }, 6000);
  } catch (error) {
    console.error('[STARTUP] Unable to persist the one-time refresh marker; refresh not scheduled to avoid a reload loop.', error);
  }
}

scheduleFirstLoadRefresh();

// Mount into page001's dedicated placeholder div (falls back to '#root' for local dev).
const mountPoint = document.getElementById('emojiLineForGitHubQuest34onFrontPage001') || document.getElementById('root');

if (!mountPoint) {
  throw new Error('uHub mount point was not found.');
}

mountPoint.classList.add('uhub-root', 'dark');
mountPoint.style.setProperty('display', mountPoint.id === 'emojiLineForGitHubQuest34onFrontPage001' ? 'contents' : 'inline-flex', 'important');
mountPoint.style.setProperty('align-items', 'center', 'important');
mountPoint.style.setProperty('width', 'fit-content', 'important');
mountPoint.style.setProperty('height', 'auto', 'important');
mountPoint.style.setProperty('min-height', '0', 'important');
mountPoint.style.setProperty('margin', '0', 'important');
mountPoint.style.setProperty('background', 'transparent', 'important');

const root = ReactDOM.createRoot(mountPoint);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
