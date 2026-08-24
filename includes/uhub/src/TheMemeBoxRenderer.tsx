import React from 'react';
import ReactDOM from 'react-dom/client';
import TheMemeBoxImplementation001 from './features/profile/TheMemeBoxImplementation001';

const memeBoxRoots = new Map<string, ReactDOM.Root>();

export function renderTheMemeBox(data: any) {
  const boxes = [
    { id: 'TheReactMemeImplementationConnection001', postSource: 'all' as const },
    { id: 'TheReactMemeImplementationConnection002', postSource: 'user-submitted' as const },
  ];

  boxes.forEach(({ id, postSource }) => {
    const container = document.getElementById(id);
    if (!container) return;

    const root = memeBoxRoots.get(id) || ReactDOM.createRoot(container);
    memeBoxRoots.set(id, root);
    root.render(
      <React.StrictMode>
        <TheMemeBoxImplementation001 data={data} postSource={postSource} />
      </React.StrictMode>
    );
  });
}

export function unmountTheMemeBox() {
  memeBoxRoots.forEach(root => root.unmount());
  memeBoxRoots.clear();
}
