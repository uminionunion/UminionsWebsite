import { useEffect, useRef } from 'react';
import { IMAGE_LOAD_PRIORITY, preloadQueuedImage, retainQueuedImages } from './image-load-queue';

// Added 10/16/26: carousels take turns. Only one rotates at a time, and the queue rests between turns.
const REST_BETWEEN_ROTATIONS_MS = 2000;
const MAX_QUEUED_PER_CAROUSEL = 2;
const PRELOAD_TIMEOUT_MS = 8000;

interface RotationTurn {
  carouselId: string;
  run: () => Promise<void>;
}

const turns: RotationTurn[] = [];
let working = false;

async function work() {
  if (working) return;
  working = true;
  while (turns.length > 0) {
    const turn = turns.shift();
    if (!turn) break;
    try {
      await turn.run();
    } catch {
      // A failed turn must not stop the queue.
    }
    await new Promise(resolve => window.setTimeout(resolve, REST_BETWEEN_ROTATIONS_MS));
  }
  working = false;
}

function enqueueTurn(turn: RotationTurn) {
  // A carousel already waiting twice is not counted again until one of its turns is used.
  if (turns.filter(item => item.carouselId === turn.carouselId).length >= MAX_QUEUED_PER_CAROUSEL) return;
  turns.push(turn);
  void work();
}

interface QueuedRotationOptions {
  carouselId: string;
  urls: string[];
  index: number;
  setIndex: (index: number) => void;
  intervalMs: number | (() => number);
  paused?: boolean;
  pickNext?: (current: number, count: number) => number;
}

export function useQueuedCarouselRotation({ carouselId, urls, index, setIndex, intervalMs, paused = false, pickNext }: QueuedRotationOptions) {
  const indexRef = useRef(index);
  indexRef.current = index;
  const urlsKey = urls.join('|');
  const nextIndex = urls.length > 1 ? (pickNext ? undefined : (index + 1) % urls.length) : undefined;

  // Keep only the visible slide and the upcoming slide in the cache.
  useEffect(() => {
    const keep = [urls[index], nextIndex === undefined ? '' : urls[nextIndex]].filter(Boolean);
    return retainQueuedImages(keep);
  }, [urlsKey, index, nextIndex]);

  useEffect(() => {
    if (paused || urls.length < 2) return;
    let cancelled = false;
    let timer: number;
    const schedule = () => {
      const delay = typeof intervalMs === 'function' ? intervalMs() : intervalMs;
      timer = window.setTimeout(() => {
        enqueueTurn({
          carouselId,
          run: async () => {
            if (cancelled) return;
            const current = indexRef.current;
            const next = pickNext ? pickNext(current, urls.length) : (current + 1) % urls.length;
            const src = urls[next];
            if (src) {
              await Promise.race([
                preloadQueuedImage(src, IMAGE_LOAD_PRIORITY.carousel).catch(() => undefined),
                new Promise(resolve => window.setTimeout(resolve, PRELOAD_TIMEOUT_MS)),
              ]);
            }
            if (!cancelled) setIndex(next);
          },
        });
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [carouselId, urlsKey, paused, intervalMs]);
}
