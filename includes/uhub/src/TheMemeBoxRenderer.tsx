import React from 'react';
import ReactDOM from 'react-dom/client';
import TheMemeBoxImplementation001 from './features/profile/TheMemeBoxImplementation001';

let memeBoxRoot: ReactDOM.Root | null = null;

export function renderTheMemeBox(data: any) {
  const container = document.getElementById('TheReactMemeImplementationConnection001');
  if (!container) return;

  memeBoxRoot ||= ReactDOM.createRoot(container);
  memeBoxRoot.render(
    <React.StrictMode>
      <div className="uhub-meme-box-stack">
        <TheMemeBoxImplementation001 data={data} postSource="all" embedded showExternalUploadButton hideFooter />
        <TheMemeBoxImplementation001 data={data} postSource="user-submitted" embedded hideFooter />
        <TheMemeBoxImplementation001 data={data} postSource="all" embedded hideFooter />
        <TheMemeBoxImplementation001 data={data} postSource="user-submitted" embedded hideFooter />
        <TheMemeBoxImplementation001 data={data} postSource="all" embedded hideFooter />
        <TheMemeBoxImplementation001 data={data} postSource="user-submitted" embedded hideFooter />
        <div className="uhub-meme-box-shared-footer">A GEMMMS#25 Creation: "The MemeBox"</div>
      </div>
    </React.StrictMode>
  );
}

export function unmountTheMemeBox() {
  memeBoxRoot?.unmount();
  memeBoxRoot = null;
}
