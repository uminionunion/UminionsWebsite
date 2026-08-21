
// Import the React library.
import * as React from 'react';
// Import the ReactDOM library for rendering React components in the DOM.
import * as ReactDOM from 'react-dom/client';
// Import the main App component.
import App from './App';

// Import the main CSS file for global styles.
import './index.css';

// Mount into page001's dedicated placeholder div (falls back to '#root' for local dev).
const mountPoint = document.getElementById('emojiLineForGitHubQuest34onFrontPage001') || document.getElementById('root');

if (!mountPoint) {
  throw new Error('uHub mount point was not found.');
}

mountPoint.classList.add('uhub-root', 'dark');
mountPoint.style.setProperty('display', 'inline-flex', 'important');
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

