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
  assert.match(css, /\.uhub-root button\.uhub-store-action \{[^}]*background-color: transparent;[^}]*color: #fff;/);
  assert.match(css, /\.uhub-root button\.uhub-store-action:hover \{[^}]*background-color: transparent;[^}]*color: #fff;/);
  const detail = await readFile(new URL('features/profile/MainUhubFeatureV001ForProductDetailModal.tsx', root), 'utf8');
  assert.match(detail, /onClick=\{handleAddToCart\}\s*className="uhub-store-action uhub-detail-cart-button h-12 w-full"/);
  assert.ok(detail.includes('const handleAddToCart = () => addToMainCart(product, Boolean(user));'));
  assert.ok(!/bg-orange-400 hover:bg-orange-500 text-white h-12/.test(detail), 'Detail cart is a transparent white icon, not an orange button');
  assert.ok(!main.includes('getCartUrl'), 'No cart button adds the first product SKU to the external cart');
  assert.ok(!main.includes('page001.uminion.com/cart'));
  assert.equal(main.split('onClick={showMainCart}').length - 1, 3, 'Union Store, Users\' Stores and Store 01-30 header carts open the Main Cart');
  assert.match(css, /\.uhub-root button\.uhub-cart-checkout,[\s\S]*?cursor: not-allowed;/);
  assert.ok(main.includes('void addToMainCart(p, Boolean(user));'), 'Each Store 01-30 product row has a cart button that adds that product');
  assert.match(css, /\.uhub-root \.uhub-cart-toast \{[\s\S]*?background: #3f464f;[\s\S]*?color: #ffffff;/, 'Cart toast matches the gray site toasts with white text');
  assert.ok(main.includes("aria-label={inCart ? 'Remove from cart' : 'Add to cart'}"));
  assert.match(main, /className="uhub-store-action h-7 w-7 flex-shrink-0"[\s\S]*?onClick=/);
});

test('opening mountain browser loads and renders Everything from the supplied product list, including errors and purchase actions', async () => {
  const source = await readFile(new URL('features/profile/MainUhubFeatureV001ForMyProfileModal.tsx', root), 'utf8');
  const ast = ts.createSourceFile('hub.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let initializer;
  const tags = new Set();
  const visit = node => {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'QuadrantsModal') initializer = node.initializer;
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const name = node.tagName.getText(ast);
      if (/^[A-Z]\w*$/.test(name)) tags.add(name);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  assert.ok(initializer);
  const effects = [];
  const added = [];
  const globals = {
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    useState: initial => [initial, () => {}],
    useMemo: callback => callback(),
    useEffect: callback => effects.push(callback),
    addToMainCart: (...args) => added.push(args),
    ...Object.fromEntries([...tags].map(tag => [tag, tag])),
  };
  const compiled = ts.transpileModule(`(${initializer.getText(ast)})`, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const render = vm.runInNewContext(compiled, globals);
  const products = [
    { id: 1, name: 'Purchase URL', image_url: '/api/uploads/one.png', payment_url: 'https://example.invalid/purchase' },
    { id: 2, name: 'SKU product', image_url: '/api/uploads/two.png', sku_id: '123' },
    { id: 3, name: 'Contact seller', image_url: '/api/uploads/three.png' },
  ];
  let mainLoads = 0;
  let everythingLoads = 0;
  let viewed;
  const props = {
    isOpen: true, stores: Array.from({ length: 31 }, (_, id) => ({ id, number: id })),
    everythingProducts: products, loadingStoreIds: new Set(), storeProductErrors: {},
    loadStoreProducts: id => { assert.equal(id, 0); mainLoads++; },
    loadEverythingProducts: () => everythingLoads++,
    onProductView: product => { viewed = product; },
    user: { id: 4 },
  };
  const findList = node => {
    if (node?.type === 'EverythingProductsList') return node;
    return (node?.props?.children || []).flat(Infinity).map(findList).find(Boolean);
  };
  const list = findList(render(props));
  assert.ok(list);
  assert.equal(list.props.products, products, 'actual Quadrants render must pass fetched products, not a default empty alias');
  effects.forEach(callback => callback());
  assert.equal(mainLoads, 1);
  assert.equal(everythingLoads, 1);
  list.props.onAddToCart(products[0]);
  list.props.onAddToCart(products[1]);
  assert.deepEqual(added.map(([product, loggedIn]) => [product, loggedIn]), [[products[0], true], [products[1], true]], 'Everything 🛒 adds to the Main Cart instead of opening external links');
  assert.equal(viewed, undefined, 'The cart button no longer opens product details');
  const loggedOutList = findList(render({ ...props, user: null }));
  loggedOutList.props.onAddToCart(products[2]);
  assert.deepEqual(added[2], [products[2], false], 'Logged-out visitors are routed to login by addToMainCart');
  const failedList = findList(render({ ...props, everythingProductsError: 'HTTP 500' }));
  assert.equal(failedList.props.error, 'HTTP 500');
  assert.equal(failedList.props.onRetry, props.loadEverythingProducts);
  const closed = render({ ...props, isOpen: false });
  assert.equal(closed, null);
  assert.ok(source.includes('everythingProducts={everythingProducts}'));
});

test('Everything renders a thumbnail per product and white cart/search controls without plus or pretend cart state', async () => {
  const source = await readFile(new URL('features/profile/EverythingProductsList.tsx', root), 'utf8');
  const exports = {};
  const React = { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }), useMemo: callback => callback() };
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, {
    exports,
    require(name) {
      if (name === 'react') return React;
      if (name === '../../components/ui/button') return { Button: 'button' };
      if (name === 'lucide-react') return { Search: 'Search', ShoppingCart: 'ShoppingCart', Loader2: 'Loader2' };
      if (name === '../../components/ProductQueuedImage') return { __esModule: true, default: 'ProductQueuedImage' };
      throw new Error(`Unexpected import ${name}`);
    },
  });
  const flatten = node => node && typeof node === 'object'
    ? [node, ...(node.props?.children || []).flat(Infinity).flatMap(flatten)] : [];
  const products = Array.from({ length: 80 }, (_, id) => ({ id, name: `Product ${id}`, image_url: `/api/uploads/product-${id}.png` }));
  let viewed;
  let cart;
  const nodes = flatten(exports.default({
    products, onProductView: product => { viewed = product; }, onAddToCart: product => { cart = product; },
  }));
  assert.equal(nodes.filter(node => node.type === 'ProductQueuedImage').length, 80);
  assert.equal(nodes.filter(node => node.type === 'ShoppingCart').length, 80);
  assert.equal(nodes.filter(node => node.type === 'Search').length, 80);
  let stopped = 0;
  const cartButton = nodes.find(node => node.props.title === 'Add to cart');
  cartButton.props.onClick({ stopPropagation() { stopped++; } });
  assert.ok(products.includes(cart));
  const viewButton = nodes.find(node => node.props.title === 'View product details' && node.type === 'button');
  viewButton.props.onClick({ stopPropagation() { stopped++; } });
  assert.ok(products.includes(viewed));
  assert.equal(stopped, 2);
  assert.ok(!source.includes('<Plus'));
  assert.ok(!source.includes('setInCart'));
  let retries = 0;
  const failure = flatten(exports.default({ products: [], error: 'HTTP 500', onRetry: () => retries++ }));
  assert.ok(failure.some(node => node.props.role === 'alert'));
  failure.find(node => node.type === 'button').props.onClick();
  assert.equal(retries, 1);
  const loading = flatten(exports.default({ products: [], isLoading: true }));
  assert.ok(loading.some(node => node.props['aria-label'] === 'Loading products'));
});

test('Main Cart helper sends products and carousel entries to the internal cart and routes logged-out visitors to login', async () => {
  const source = await readFile(new URL('lib/internal-cart.ts', root), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const events = [];
  const requests = [];
  const module = { exports: {} };
  const context = {
    module, exports: module.exports,
    require: () => ({ useCallback: f => f, useEffect: () => {}, useState: value => [value, () => {}] }),
    CustomEvent: class { constructor(type) { this.type = type; } },
    window: { dispatchEvent: event => events.push(event.type), setTimeout: () => 0, clearTimeout: () => {} },
    fetch: async (url, init) => { requests.push([url, init.method, init.body]); return { ok: true, status: 200, json: async () => ({}) }; },
  };
  vm.runInNewContext(compiled, context);
  const cart = module.exports;
  assert.equal(await cart.addToMainCart({ id: 7 }, false), false);
  assert.deepEqual([...events], ['uhub-request-login']);
  assert.equal(requests.length, 0, 'Logged-out visitors never call the cart API');
  assert.equal(await cart.addToMainCart({ id: 7 }, true), true);
  assert.equal(await cart.addToMainCart({ carousel_item_id: 12 }, true), true);
  assert.deepEqual(requests.map(request => [...request]), [
    ['/api/products/cart/add', 'POST', '{"product_id":7}'],
    ['/api/products/cart/add', 'POST', '{"carousel_item_id":12}'],
  ]);
  assert.deepEqual([...events].slice(1), ['uhub-cart-updated', 'uhub-cart-updated']);
  const carouselProduct = cart.cartEntryToProduct({ product: null, carousel_item_id: 12, name: 'Poster', price: '$12', image_url: '/p.png', sku: 'P12' });
  assert.deepEqual([carouselProduct.carousel_item_id, carouselProduct.price_label, carouselProduct.sku_id], [12, '$12', 'P12']);
  assert.deepEqual(['$69.95', '$1,499.95 BYO Tapestry', '25', 'u24.gov.ua', '', null].map(cart.isCartPriceLabel), [true, true, true, false, false, false]);
});
