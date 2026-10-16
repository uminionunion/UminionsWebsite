import { useEffect, useId, useRef } from 'react';
import { IMAGE_LOAD_PRIORITY, preloadQueuedImage, retainQueuedImages } from './image-load-queue';

// Rewritten 10/16/26: carousels no longer have their own timers. One scheduler visits them one at a time,
// loads a random next image into the cache, rotates to it, waits 5 seconds, then moves to the next carousel.
const STEP_MS = 5000;
const LOAD_TIMEOUT_MS = 4000;

interface Registered {
  urls: string[];
  index: number;
  setIndex: (index: number) => void;
  paused: boolean;
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
      const choices = entry.urls.map((_, position) => position).filter(position => position !== entry.index);
      const next = choices[Math.floor(Math.random() * choices.length)];
      const src = entry.urls[next];
      if (src) {
        await Promise.race([
          preloadQueuedImage(src, IMAGE_LOAD_PRIORITY.carousel).catch(() => undefined),
          new Promise(resolve => window.setTimeout(resolve, LOAD_TIMEOUT_MS)),
        ]);
      }
      if (carousels.get(id) === entry) entry.setIndex(next);
    }
  }
  timer = carousels.size ? window.setTimeout(step, STEP_MS) : undefined;
}

interface QueuedRotationOptions {
  carouselId: string;
  urls: string[];
  index: number;
  setIndex: (index: number) => void;
  intervalMs?: number | (() => number);
  paused?: boolean;
  pickNext?: unknown;
}

export function useQueuedCarouselRotation({ carouselId: baseId, urls, index, setIndex, paused = false }: QueuedRotationOptions) {
  // The top and bottom covers share a name, so each instance gets its own id.
  const carouselId = `${baseId}-${useId()}`;
  const urlsKey = urls.join('|');
  const entryRef = useRef<Registered>({ urls, index, setIndex, paused });
  entryRef.current.urls = urls;
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
}
