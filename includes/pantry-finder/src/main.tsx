
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import 'leaflet/dist/leaflet.css';

const mountPoint = document.getElementById('root') || document.getElementById('emojiLineForGitHubQuest34onFrontPage');

if (!mountPoint) {
  throw new Error('Pantry Finder mount point was not found.');
}

mountPoint.classList.add('pantry-finder-root', 'dark');

ReactDOM.createRoot(mountPoint).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
