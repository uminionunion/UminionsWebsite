const MAX_CONCURRENT_IMAGE_LOADS = 4;
const MAX_CACHED_IMAGES = 40;
const MAX_CACHED_IMAGE_BYTES = 48 * 1024 * 1024;

export const IMAGE_LOAD_PRIORITY = {
  critical: 0,
  carousel: 1,
  normal: 2,
} as const;

interface QueuedImageRequest {
  src: string;
  priority: number;
  sequence: number;
  resolve: (image: HTMLImageElement) => void;
  reject: (error: Error) => void;
}

const queue: QueuedImageRequest[] = [];
const queuedRequests = new Map<string, QueuedImageRequest>();
const imagePromises = new Map<string, Promise<HTMLImageElement>>();
const decodedImageCache = new Map<string, { image: HTMLImageElement; bytes: number }>();
const retainedImages = new Map<string, number>();
let activeLoads = 0;
let decodedCacheBytes = 0;
let nextRequestSequence = 0;
let queueScheduled = false;

export function retainQueuedImages(sources: string[]): () => void {
  const uniqueSources = [...new Set(sources.filter(Boolean))];
  uniqueSources.forEach(src => retainedImages.set(src, (retainedImages.get(src) || 0) + 1));
  void Promise.allSettled(uniqueSources.map(src => preloadQueuedImage(src, IMAGE_LOAD_PRIORITY.carousel)));
  return () => {
    uniqueSources.forEach(src => {
      const count = retainedImages.get(src) || 0;
      if (count <= 1) retainedImages.delete(src);
      else retainedImages.set(src, count - 1);
    });
    trimDecodedCache();
  };
}

function trimDecodedCache() {
  while (decodedImageCache.size > MAX_CACHED_IMAGES || decodedCacheBytes > MAX_CACHED_IMAGE_BYTES) {
    const oldestSrc = [...decodedImageCache.keys()].find(src => !retainedImages.has(src));
    if (!oldestSrc) return;
    const cachedImage = decodedImageCache.get(oldestSrc);
    if (cachedImage) decodedCacheBytes -= cachedImage.bytes;
    decodedImageCache.delete(oldestSrc);
    imagePromises.delete(oldestSrc);
  }
}

function processQueue() {
  while (activeLoads < MAX_CONCURRENT_IMAGE_LOADS && queue.length > 0) {
    queue.sort((a, b) => a.priority - b.priority || a.sequence - b.sequence);
    const request = queue.shift();
    if (!request) return;
    queuedRequests.delete(request.src);

    activeLoads += 1;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      image.decode().catch(() => undefined).then(() => {
        const imageBytes = image.naturalWidth * image.naturalHeight * 4;
        if (imageBytes <= MAX_CACHED_IMAGE_BYTES) {
          const previous = decodedImageCache.get(request.src);
          if (previous) decodedCacheBytes -= previous.bytes;
          decodedImageCache.set(request.src, { image, bytes: imageBytes });
          decodedCacheBytes += imageBytes;
          trimDecodedCache();
        } else {
          imagePromises.delete(request.src);
        }
        request.resolve(image);
      }).finally(() => {
        activeLoads -= 1;
        processQueue();
      });
    };
    image.onerror = () => {
      imagePromises.delete(request.src);
      request.reject(new Error(`Failed to load image: ${request.src}`));
      activeLoads -= 1;
      processQueue();
    };
    image.src = request.src;
  }
}

function scheduleQueueProcessing() {
  if (queueScheduled) return;
  queueScheduled = true;
  queueMicrotask(() => {
    queueScheduled = false;
    processQueue();
  });
}

export function preloadQueuedImage(
  src: string,
  priority: number = IMAGE_LOAD_PRIORITY.normal,
  retain = false,
): Promise<HTMLImageElement> {
  if (!src) return Promise.reject(new Error('An image URL is required.'));
  if (retain) retainedImages.set(src, Math.max(1, retainedImages.get(src) || 0));

  const cachedImage = decodedImageCache.get(src);
  if (cachedImage) {
    decodedImageCache.delete(src);
    decodedImageCache.set(src, cachedImage);
    return Promise.resolve(cachedImage.image);
  }

  const existingPromise = imagePromises.get(src);
  if (existingPromise) {
    const queuedRequest = queuedRequests.get(src);
    if (queuedRequest && priority < queuedRequest.priority) {
      queuedRequest.priority = priority;
      scheduleQueueProcessing();
    }
    return existingPromise;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const request = { src, priority, sequence: nextRequestSequence++, resolve, reject };
    queue.push(request);
    queuedRequests.set(src, request);
    scheduleQueueProcessing();
  });
  imagePromises.set(src, promise);
  return promise;
}
