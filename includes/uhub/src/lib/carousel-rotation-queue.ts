import { useEffect, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { IMAGE_LOAD_PRIORITY, preloadQueuedImage, retainQueuedImages } from './image-load-queue';

// One scheduler clears and fills a single-image slot at a time, then waits five seconds.
const STEP_MS = 5000;
const LOAD_TIMEOUT_MS = 4000;

interface Registered {
  urls: string[];
  index: number;
  setIndex: (index: number) => void;
  paused: boolean;
  setImageVisible: (visible: boolean) => void;
  firstNextIndex?: number;
}

const carousels = new Map<string, Registered>();
let cursor = 0;
let timer: number | undefined;

async function step() {
  const ids = [...carousels.keys()];
  if (ids.length) {
    const id = ids[cursor++ % ids.length];
    const entry = carousels.get(id);
    if (entry && !entry.paused && entry.urls.length > 1) {
      const urls = entry.urls;
      const choices = entry.urls.map((_, position) => position).filter(position => position !== entry.index);
      const next = entry.firstNextIndex !== undefined && choices.includes(entry.firstNextIndex)
        ? entry.firstNextIndex : choices[Math.floor(Math.random() * choices.length)];
      const src = entry.urls[next];
      flushSync(() => entry.setImageVisible(false));
      if (src) {
        await Promise.race([
          preloadQueuedImage(src, IMAGE_LOAD_PRIORITY.carousel).catch(() => undefined),
          new Promise(resolve => window.setTimeout(resolve, LOAD_TIMEOUT_MS)),
        ]);
      }
      if (carousels.get(id) === entry) {
        flushSync(() => {
          if (entry.urls === urls) {
            entry.firstNextIndex = undefined;
            entry.setIndex(next);
          }
          entry.setImageVisible(true);
        });
      }
    }
  }
  timer = carousels.size ? window.setTimeout(step, STEP_MS) : undefined;
}

interface QueuedImageSlotOptions {
  carouselId: string;
  urls: string[];
  index: number;
  setIndex: (index: number) => void;
  paused?: boolean;
  firstNextIndex?: number;
}

export function useQueuedImageSlot({ carouselId: baseId, urls, index, setIndex, paused = false, firstNextIndex }: QueuedImageSlotOptions) {
  // The top and bottom covers share a name, so each instance gets its own id.
  const carouselId = `${baseId}-${useId()}`;
  const urlsKey = urls.join('|');
  const [imageVisible, setImageVisible] = useState(true);
  const entryRef = useRef<Registered>({ urls, index, setIndex, paused, setImageVisible, firstNextIndex });
  if (entryRef.current.urls.join('|') !== urlsKey) {
    entryRef.current.urls = urls;
    entryRef.current.firstNextIndex = firstNextIndex;
  }
  entryRef.current.index = index;
  entryRef.current.setIndex = setIndex;
  entryRef.current.paused = paused;

  // Every carousel image goes into the cache up front.
  useEffect(() => retainQueuedImages(urls.filter(Boolean)), [urlsKey]);

  useEffect(() => {
    const entry = entryRef.current;
    carousels.set(carouselId, entry);
    if (timer === undefined) timer = window.setTimeout(step, STEP_MS);
    return () => {
      if (carousels.get(carouselId) === entry) carousels.delete(carouselId);
    };
  }, [carouselId]);
  return imageVisible;
}
