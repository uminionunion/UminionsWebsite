import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const root = new URL('../../includes/uhub/src/', import.meta.url);
const source = await readFile(new URL('lib/product-image-cache.ts', root), 'utf8');

function scheduler() {
  const requests = [];
  const timers = new Map();
  let timerId = 0;
  let concurrent = 0;
  let peak = 0;
  class Image {
    naturalWidth = 100;
    naturalHeight = 100;
    set src(url) {
      this.url = url;
      requests.push(this);
      concurrent++;
      peak = Math.max(peak, concurrent);
    }
    removeAttribute() { concurrent--; }
    succeed() { concurrent--; this.onload?.(); }
    fail() { concurrent--; this.onerror?.(); }
  }
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, Image,
    setTimeout(callback, duration) { const id = ++timerId; timers.set(id, { callback, duration }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  return { ...exports, requests, timers, peak: () => peak };
}

test('all product URLs start and settle across large batches without activation, slice loss or decode waits', async () => {
  const queue = scheduler();
  const union = Array.from({ length: 75 }, (_, i) => `union-${i}`);
  const users = Array.from({ length: 75 }, (_, i) => `users-${i}`);
  const completion = Promise.all([
    queue.enqueueProductImageBatch(union, 'union'),
    queue.enqueueProductImageBatch(users, 'users'),
  ]);
  assert.equal(queue.requests.length, 3);
  for (let index = 0; index < 150; index++) {
    assert.ok(queue.requests[index], `URL ${index} must be requested without a view switch or timer`);
    queue.requests[index].succeed();
    await Promise.resolve();
  }
  await completion;
  assert.equal(new Set(queue.requests.map(image => image.url)).size, 150);
  assert.equal(queue.peak(), 3);
  assert.equal(queue.timers.size, 0);
  assert.equal(queue.requests[3].url, 'users-0', 'newly waiting user store gets the next slot');
});

test('failures and timeouts release slots, settle callers and allow retry without blocking other products', async () => {
  const queue = scheduler();
  const failed = queue.preloadProductImage('bad', 'union');
  const timedOut = queue.preloadProductImage('stalled', 'users');
  const good = queue.preloadProductImage('good', 'users');
  const waiting = queue.preloadProductImage('waiting', 'union');
  const failureCheck = assert.rejects(failed, /Failed to load product image/);
  const timeoutCheck = assert.rejects(timedOut, /timed out after 30 seconds/);
  queue.requests[0].fail();
  assert.equal(queue.requests[3].url, 'waiting');
  const timeout = [...queue.timers.values()][0];
  assert.equal(timeout.duration, 30_000);
  timeout.callback();
  queue.requests[2].succeed();
  queue.requests[3].succeed();
  await Promise.all([failureCheck, timeoutCheck, good, waiting]);
  const retry = queue.preloadProductImage('bad', 'users');
  assert.equal(queue.requests[4].url, 'bad');
  queue.requests[4].succeed();
  await retry;
});

test('duplicate URLs share requests; cache hits avoid requests and LRU eviction reloads old entries', async () => {
  const queue = scheduler();
  const first = queue.preloadProductImage('same', 'union');
  assert.equal(queue.preloadProductImage('same', 'users'), first);
  queue.requests[0].succeed();
  const image = await first;
  assert.equal(await queue.preloadProductImage('same', 'users'), image);
  assert.equal(queue.requests.length, 1);
  for (let i = 0; i < 50; i++) {
    const request = queue.preloadProductImage(`other-${i}`, 'users');
    queue.requests.at(-1).succeed();
    await request;
  }
  const evicted = queue.preloadProductImage('same', 'union');
  assert.equal(queue.requests.length, 52);
  queue.requests.at(-1).succeed();
  await evicted;
});

test('decoded-image cache enforces the exact 48-image and 48-MiB limits', async () => {
  const queue = scheduler();
  for (let index = 0; index < 48; index++) {
    const pending = queue.preloadProductImage(`small-${index}`, 'union');
    queue.requests.at(-1).succeed();
    await pending;
  }
  await queue.preloadProductImage('small-0', 'users');
  assert.equal(queue.requests.length, 48, '48 cached images are allowed');
  const extra = queue.preloadProductImage('extra', 'users');
  queue.requests.at(-1).succeed();
  await extra;
  await queue.preloadProductImage('small-0', 'users');
  assert.equal(queue.requests.length, 49, 'recently used image is retained');
  const evicted = queue.preloadProductImage('small-1', 'union');
  assert.equal(queue.requests.length, 50);
  queue.requests.at(-1).succeed();
  await evicted;
  const boundary = queue.preloadProductImage('48MiB', 'users');
  queue.requests.at(-1).naturalWidth = 4096;
  queue.requests.at(-1).naturalHeight = 3072;
  queue.requests.at(-1).succeed();
  const boundaryImage = await boundary;
  assert.equal(await queue.preloadProductImage('48MiB', 'union'), boundaryImage);
  const oversized = queue.preloadProductImage('oversized', 'users');
  queue.requests.at(-1).naturalWidth = 4096;
  queue.requests.at(-1).naturalHeight = 3073;
  queue.requests.at(-1).succeed();
  await oversized;
  const count = queue.requests.length;
  const notCached = queue.preloadProductImage('oversized', 'users');
  assert.equal(queue.requests.length, count + 1, 'images over 48MiB are not cached');
  queue.requests.at(-1).succeed();
  await notCached;
});

test('product thumbnails clear old URLs, show loading/failure and retry without triggering product clicks', async () => {
  const component = await readFile(new URL('components/ProductQueuedImage.tsx', root), 'utf8');
  const pending = [];
  const errors = [];
  const state = [];
  let effect;
  let dependencies;
  let cleanup;
  let cursor;
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    },
    useEffect(callback, next) {
      if (!dependencies || next.some((value, index) => value !== dependencies[index])) {
        cleanup?.();
        effect = callback;
        dependencies = next;
      }
    },
  };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(component, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, {
    exports, console: { error: (...args) => errors.push(args) },
    require(name) {
      if (name === 'react') return { ...hooks, createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) };
      if (name === '../lib/product-image-cache') return {
        preloadProductImage: url => new Promise((resolve, reject) => pending.push({ url, resolve, reject })),
      };
      throw new Error(`Unexpected import ${name}`);
    },
  });
  const render = src => {
    cursor = 0;
    const result = exports.default({ src, queue: 'users', alt: 'Product', className: 'w-8 h-8' });
    if (effect) { const run = effect; effect = null; cleanup = run(); }
    return result;
  };
  assert.equal(render('first').props.role, 'status');
  pending[0].resolve();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(render('first').props.src, 'first');
  assert.equal(render('second').props.src, undefined);
  pending[1].reject(new Error('image missing'));
  await new Promise(resolve => setImmediate(resolve));
  const retry = render('second');
  assert.equal(retry.type, 'button');
  assert.equal(errors.length, 1);
  let stopped = false;
  retry.props.onClick({ stopPropagation() { stopped = true; } });
  render('second');
  assert.equal(stopped, true);
  assert.equal(pending.length, 3);
  pending[2].resolve();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(render('second').props.src, 'second');
  render('third');
  cleanup();
  pending[3].resolve();
  await new Promise(resolve => setImmediate(resolve));
  assert.notEqual(state[0], 'third', 'unmounted consumers must not update state');
});

test('all store row/detail and cart controls retain handlers with explicit scoped colors', async () => {
  const main = await readFile(new URL('features/profile/MainUhubFeatureV001ForMyProfileModal.tsx', root), 'utf8');
  assert.ok(!main.includes('setProductImageQueueActive'));
  const css = await readFile(new URL('index.css', root), 'utf8');
  assert.match(css, /\.uhub-root button\.uhub-store-action,[\s\S]*?background-color: #fb923c;[\s\S]*?color: #000;/);
  const detail = await readFile(new URL('features/profile/MainUhubFeatureV001ForProductDetailModal.tsx', root), 'utf8');
  assert.match(detail, /onClick=\{handleAddToCart\}[\s\S]*?className="uhub-store-action w-full h-12 text-lg"/);
  assert.ok(main.includes("aria-label={inCart ? 'Remove from cart' : 'Add to cart'}"));
  assert.match(main, /className="uhub-store-action h-7 w-7 flex-shrink-0"[\s\S]*?onClick=/);
});
