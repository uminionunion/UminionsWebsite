import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TheMemeBoxImplementation001 from './features/profile/TheMemeBoxImplementation001';

let memeBoxRoot: ReactDOM.Root | null = null;
let memeBoxContainer: HTMLElement | null = null;

const AdditionalMemeBoxes: React.FC<{ data: any }> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <button
        type="button"
        className="uhub-meme-box-expand"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(expanded => !expanded)}
      >
        {isExpanded ? 'Hide additional MemeBoxes' : 'Show MemeBoxes 2–6'}
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isExpanded && (
        <>
          <TheMemeBoxImplementation001 data={data} postSource="user-submitted" embedded hideFooter />
          <TheMemeBoxImplementation001 data={data} postSource="all" embedded hideFooter />
          <TheMemeBoxImplementation001 data={data} postSource="user-submitted" embedded hideFooter />
          <TheMemeBoxImplementation001 data={data} postSource="all" embedded hideFooter />
          <TheMemeBoxImplementation001 data={data} postSource="user-submitted" embedded hideFooter />
        </>
      )}
      <div className="uhub-meme-box-shared-footer">A GGEMMMS#25 Creation: "The MemeBox"</div>
    </>
  );
};

export function renderTheMemeBox(data: any, { randomStart = false }: { randomStart?: boolean } = {}) {
  const container = document.getElementById('TheReactMemeImplementationConnection001');
  if (!container) {
    unmountTheMemeBox();
    return;
  }

  if (memeBoxContainer !== container) {
    unmountTheMemeBox();
    memeBoxContainer = container;
    memeBoxRoot = ReactDOM.createRoot(container);
  }
  memeBoxRoot.render(
    <React.StrictMode>
      <div className="uhub-meme-box-stack">
        <TheMemeBoxImplementation001 data={data} postSource="all" embedded showExternalUploadButton hideFooter randomStart={randomStart} />
        <div className="uhub-additional-memes"><AdditionalMemeBoxes data={data} /></div>
      </div>
    </React.StrictMode>
  );
}

export function unmountTheMemeBox() {
  memeBoxRoot?.unmount();
  memeBoxRoot = null;
  memeBoxContainer = null;
}
