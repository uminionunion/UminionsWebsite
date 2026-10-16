type ProductImageQueue = 'union' | 'users';

interface ProductImageBatch {
  queue: ProductImageQueue;
  priority: number;
  urls: string[];
  index: number;
  sequence: number;
  loadedAtSliceEnd?: number;
}

const loadedByQueue: Record<ProductImageQueue, number> = { union: 0, users: 0 };
const queueByUrl = new Map<string, ProductImageQueue>();

const MAX_CONCURRENT_LOADS = 3;
const MAX_CACHED_IMAGES = 48;
const MAX_CACHED_BYTES = 48 * 1024 * 1024;
const SLICE_DURATION_MS = 7000;
const batches: ProductImageBatch[] = [];
const queuedUrls = new Set<string>();
const pendingImages = new Map<string, Promise<HTMLImageElement>>();
const imageResolvers = new Map<string, {
  resolve: (image: HTMLImageElement) => void;
  reject: (error: Error) => void;
}>();
const imageCache = new Map<string, { image: HTMLImageElement; bytes: number }>();
let cachedBytes = 0;
let activeLoads = 0;
let currentBatches: ProductImageBatch[] = [];
let currentSliceStartedAt = 0;
let sequence = 0;
let turn = 0;
let queueActive = false;

const queueOrder: Record<ProductImageQueue, number> = { union: 0, users: 1 };

function trimCache() {
  while (imageCache.size > MAX_CACHED_IMAGES || cachedBytes > MAX_CACHED_BYTES) {
    const oldestUrl = imageCache.keys().next().value;
    if (!oldestUrl) return;
    const cached = imageCache.get(oldestUrl);
    if (cached) cachedBytes -= cached.bytes;
    imageCache.delete(oldestUrl);
  }
}

function startImageLoad(url: string, resolve: (image: HTMLImageElement) => void, reject: (error: Error) => void) {
  activeLoads += 1;
  const image = new Image();
  image.decoding = 'async';
  image.onload = () => {
    image.decode().catch(() => undefined).then(() => {
      const bytes = image.naturalWidth * image.naturalHeight * 4;
      if (bytes <= MAX_CACHED_BYTES) {
        const previous = imageCache.get(url);
        if (previous) cachedBytes -= previous.bytes;
        imageCache.set(url, { image, bytes });
        cachedBytes += bytes;
        trimCache();
      }
      pendingImages.delete(url);
      queuedUrls.delete(url);
      imageResolvers.delete(url);
      const loadedQueue = queueByUrl.get(url);
      if (loadedQueue) loadedByQueue[loadedQueue] += 1;
      resolve(image);
    }).finally(() => {
      activeLoads -= 1;
      processQueue();
    });
  };
  image.onerror = () => {
    pendingImages.delete(url);
    queuedUrls.delete(url);
    imageResolvers.delete(url);
    reject(new Error(`Failed to load product image: ${url}`));
    activeLoads -= 1;
    processQueue();
  };
  image.src = url;
}

function takeNextBatch(queue: ProductImageQueue) {
  while (true) {
    const position = batches.findIndex(batch => batch.queue === queue);
    if (position === -1) return null;
    const batch = batches.splice(position, 1)[0];
    // Returning batch: if nothing new arrived since its last slice, log it and stop retrying (spinner stays up).
    if (batch.loadedAtSliceEnd !== undefined && loadedByQueue[queue] === batch.loadedAtSliceEnd) {
      console.warn(`[PRODUCT IMAGES] ${queue === 'union' ? 'Union Store' : "Users' Stores"}: no new images arrived since the last 7-second slice (${batch.urls.length - batch.index} still waiting). Not retrying in the background; the loading spinner stays on.`);
      continue;
    }
    return batch;
  }
}

function finishSlice() {
  currentBatches.forEach(batch => {
    if (batch.index < batch.urls.length) {
      batch.priority = queueOrder[batch.queue];
      batch.sequence = sequence++;
      batch.loadedAtSliceEnd = loadedByQueue[batch.queue];
      batches.push(batch);
    }
  });
  currentBatches = [];
  currentSliceStartedAt = 0;
}

// Union Store and Users' Stores share each 7-second slice and alternate loads under the shared load cap.
function processQueue() {
  if (!queueActive) return;
  if (!currentBatches.length) {
    batches.sort((a, b) => a.priority - b.priority || a.sequence - b.sequence);
    currentBatches = (['union', 'users'] as ProductImageQueue[])
      .map(takeNextBatch)
      .filter((batch): batch is ProductImageBatch => batch !== null);
    currentSliceStartedAt = currentBatches.length ? Date.now() : 0;
  }
  if (!currentBatches.length) return;

  const sliceExpired = () => Date.now() - currentSliceStartedAt >= SLICE_DURATION_MS;
  if (sliceExpired() && activeLoads === 0) {
    finishSlice();
    processQueue();
    return;
  }

  while (activeLoads < MAX_CONCURRENT_LOADS && !sliceExpired()) {
    const pending = currentBatches.filter(batch => batch.index < batch.urls.length);
    if (!pending.length) break;
    const batch = pending[turn++ % pending.length];
    const url = batch.urls[batch.index++];
    const promise = pendingImages.get(url);
    if (!promise) continue;
    if (imageCache.get(url)) {
      pendingImages.delete(url);
      continue;
    }
    const resolvers = imageResolvers.get(url);
    if (resolvers) startImageLoad(url, resolvers.resolve, resolvers.reject);
  }

  if (currentBatches.every(batch => batch.index >= batch.urls.length) && activeLoads === 0) {
    currentBatches = [];
    currentSliceStartedAt = 0;
    processQueue();
  }
}
export function setProductImageQueueActive(active: boolean) {
  queueActive = active;
  if (active) {
    if (currentBatches.length) currentSliceStartedAt = Date.now();
    processQueue();
  }
}

export function enqueueProductImageBatch(urls: string[], queue: ProductImageQueue): Promise<void> {
  const uniqueUrls = [...new Set(urls.filter(Boolean))].filter(url => !imageCache.has(url) && !queuedUrls.has(url));
  if (!uniqueUrls.length) return Promise.resolve();
  uniqueUrls.forEach(url => { queuedUrls.add(url); queueByUrl.set(url, queue); });
  const batch: ProductImageBatch = { queue, priority: queueOrder[queue], urls: uniqueUrls, index: 0, sequence: sequence++ };
  batches.push(batch);

  const completion = Promise.all(uniqueUrls.map(url => preloadProductImage(url, queue))).then(() => undefined);
  completion.catch(() => undefined);
  processQueue();
  return completion;
}

export function preloadProductImage(url: string, queue: ProductImageQueue): Promise<HTMLImageElement> {
  if (!url) return Promise.reject(new Error('A product image URL is required.'));
  const cached = imageCache.get(url);
  if (cached) {
    imageCache.delete(url);
    imageCache.set(url, cached);
    return Promise.resolve(cached.image);
  }
  const existing = pendingImages.get(url);
  if (existing) return existing;

  let resolveRequest: (image: HTMLImageElement) => void = () => undefined;
  let rejectRequest: (error: Error) => void = () => undefined;
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    resolveRequest = resolve;
    rejectRequest = reject;
  });
  imageResolvers.set(url, { resolve: resolveRequest, reject: rejectRequest });
  pendingImages.set(url, promise);

  if (!queuedUrls.has(url)) {
    queuedUrls.add(url);
    queueByUrl.set(url, queue);
    batches.push({ queue, priority: queueOrder[queue], urls: [url], index: 0, sequence: sequence++ });
  }
  processQueue();
  return promise;
}
