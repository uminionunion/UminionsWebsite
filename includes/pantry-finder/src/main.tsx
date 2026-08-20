
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import 'leaflet/dist/leaflet.css';

// Always apply dark theme
document.documentElement.classList.add('dark');

const mountPoint = document.getElementById('root') || document.getElementById('emojiLineForGitHubQuest34onFrontPage');

if (!mountPoint) {
  throw new Error('Pantry Finder mount point was not found.');
}

ReactDOM.createRoot(mountPoint).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
