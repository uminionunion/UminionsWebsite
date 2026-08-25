
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import 'leaflet/dist/leaflet.css';

const mountPoint = document.getElementById('root') || document.getElementById('emojiLineForGitHubQuest54onFrontPage');

if (!mountPoint) {
  throw new Error('Pantry Finder mount point was not found.');
}

mountPoint.classList.add('pantry-finder-root', 'dark');
mountPoint.style.setProperty('display', 'inline-block', 'important');
mountPoint.style.setProperty('width', 'fit-content', 'important');
mountPoint.style.setProperty('height', 'auto', 'important');
mountPoint.style.setProperty('min-height', '0', 'important');
mountPoint.style.setProperty('margin', '0', 'important');
mountPoint.style.setProperty('padding', '0', 'important');
mountPoint.style.setProperty('background', 'transparent', 'important');

ReactDOM.createRoot(mountPoint).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
