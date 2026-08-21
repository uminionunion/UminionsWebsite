import React from 'react';
import ReactDOM from 'react-dom/client';
import TheMemeBoxImplementation001 from './features/profile/TheMemeBoxImplementation001';

export function renderTheMemeBox(data: any) {
  const container = document.getElementById('TheReactMemeImplementationConnection001');
  if (!container) {
    console.error('Container TheReactMemeImplementationConnection001 not found');
    return;
  }

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      {/* Pass broadcast data to component - currently uses sample data */}
      <TheMemeBoxImplementation001 data={data} />
    </React.StrictMode>
  );
}

export function unmountTheMemeBox() {
  const container = document.getElementById('TheReactMemeImplementationConnection001');
  if (container) {
    const root = (container as any)._reactRootContainer;
    if (root) root.unmount();
  }
}
