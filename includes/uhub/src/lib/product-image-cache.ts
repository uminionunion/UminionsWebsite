type ProductImageQueue = 'union' | 'users';

const MAX_CONCURRENT_LOADS = 3;
const MAX_CACHED_IMAGES = 48;
const MAX_CACHED_BYTES = 48 * 1024 * 1024;
const LOAD_TIMEOUT_MS = 30_000;
const queues: Record<ProductImageQueue, string[]> = { union: [], users: [] };
const pendingImages = new Map<string, Promise<HTMLImageElement>>();
const imageResolvers = new Map<string, {
  resolve: (image: HTMLImageElement) => void;
  reject: (error: Error) => void;
}>();
const imageCache = new Map<string, { image: HTMLImageElement; bytes: number }>();
let cachedBytes = 0;
let activeLoads = 0;
let lastServedQueue: ProductImageQueue = 'users';

function trimCache() {
  while (imageCache.size > MAX_CACHED_IMAGES || cachedBytes > MAX_CACHED_BYTES) {
    const oldestUrl = imageCache.keys().next().value;
    if (!oldestUrl) return;
    const cached = imageCache.get(oldestUrl);
    if (cached) cachedBytes -= cached.bytes;
    imageCache.delete(oldestUrl);
  }
}

function startImageLoad(url: string) {
  const resolvers = imageResolvers.get(url);
  if (!resolvers) return;
  activeLoads += 1;
  const image = new Image();
  image.decoding = 'async';
  let settled = false;
  const finish = (error?: Error) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    image.onload = null;
    image.onerror = null;
    pendingImages.delete(url);
    imageResolvers.delete(url);
    activeLoads -= 1;
    if (error) {
      image.removeAttribute('src');
      resolvers.reject(error);
    } else {
      const bytes = image.naturalWidth * image.naturalHeight * 4;
      if (bytes <= MAX_CACHED_BYTES) {
        imageCache.set(url, { image, bytes });
        cachedBytes += bytes;
        trimCache();
      }
      resolvers.resolve(image);
    }
    processQueue();
  };
  const timeout = setTimeout(() => finish(new Error(`Product image timed out after 30 seconds: ${url}`)), LOAD_TIMEOUT_MS);
  image.onload = () => finish();
  image.onerror = () => finish(new Error(`Failed to load product image: ${url}`));
  image.src = url;
}

function processQueue() {
  while (activeLoads < MAX_CONCURRENT_LOADS) {
    const preferred = lastServedQueue === 'union' ? 'users' : 'union';
    const queue = queues[preferred].length ? preferred : lastServedQueue;
    const url = queues[queue].shift();
    if (!url) return;
    lastServedQueue = queue;
    startImageLoad(url);
  }
}

export function enqueueProductImageBatch(urls: string[], queue: ProductImageQueue): Promise<void> {
  return Promise.all([...new Set(urls.filter(Boolean))].map(url => preloadProductImage(url, queue)))
    .then(() => undefined);
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

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    imageResolvers.set(url, { resolve, reject });
  });
  pendingImages.set(url, promise);
  queues[queue].push(url);
  processQueue();
  return promise;
}
