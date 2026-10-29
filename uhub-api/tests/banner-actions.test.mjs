import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../../includes/uhub/src/features/profile/MainUhubFeatureV001ForMyProfileModal.tsx', import.meta.url), 'utf8');
const tree = ts.createSourceFile('hub.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function declaration(name) {
  let result;
  const visit = node => {
    if (ts.isVariableDeclaration(node) && node.name.getText(tree) === name) result = node.getText(tree);
    else ts.forEachChild(node, visit);
  };
  visit(tree);
  assert.ok(result, `Missing declaration ${name}`);
  return `const ${result};`;
}
function compile(text, globals) {
  return vm.runInNewContext(ts.transpileModule(text, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React,
  } }).outputText, globals);
}
const React = { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }), Fragment: 'fragment' };
function nodes(node) {
  return !node || typeof node !== 'object' ? [] : Array.isArray(node)
    ? node.flatMap(nodes) : [node, ...nodes(node.props?.children)];
}
function hooks() {
  const values = [], deps = [];
  let cursor = 0;
  return {
    render: callback => { cursor = 0; return callback(); },
    useState: initial => {
      const index = cursor++;
      if (!(index in values)) values[index] = typeof initial === 'function' ? initial() : initial;
      return [values[index], value => { values[index] = typeof value === 'function' ? value(values[index]) : value; }];
    },
    useRef: initial => {
      const index = cursor++;
      return values[index] ||= { current: initial };
    },
    useEffect: (callback, next) => {
      const index = cursor++;
      if (!deps[index] || next.some((value, i) => value !== deps[index][i])) {
        deps[index] = next;
        callback();
      }
    },
    useMemo: (callback, next) => {
      const index = cursor++;
      if (!deps[index] || next.some((value, i) => value !== deps[index][i])) {
        deps[index] = next;
        values[index] = callback();
      }
      return values[index];
    },
    useId: () => 'fixture',
  };
}

test('ads invoke the actual shared button dispatcher independently of the visible button page', () => {
  const events = [], errors = [], flags = { heart: false, palm: false, lion: false, microphone: false };
  const globals = {
    customizableButtonPage: 715, user: { id: 3, is_high_high_high_admin: 0 }, isMobile: false,
    areFeatureIconsActive: flags,
    setAreFeatureIconsActive: update => Object.assign(flags, update(flags)),
    setMobileSection: value => events.push(['mobile', value]),
    setCenterView: value => events.push(['center', value]),
    setBroadcastView: value => events.push(['broadcast', value]),
    setOpenSitePage: value => events.push(['page', value]),
    setAreProfileSurfacesOpaque: value => events.push(['opacity', value]),
    setCustomizableButtonPage: value => events.push(['buttons', value]),
    handleTopLeftButtonClick: value => events.push(['account', value]),
    setIsButton18Active: update => update(false), setIsSnakeModalOpen: value => events.push(['snake', value]),
    setIsQuadrantsModalOpen: value => events.push(['quadrants', value]),
    aboutPage: { page: { enabled: false } }, termsPage: { page: { enabled: false } },
    window: { open: (...args) => events.push(['external', ...args]) }, console: { error: (...args) => errors.push(args) },
  };
  const actions = compile(`${declaration('activateCustomButton')}${declaration('activateBannerButton')}({ button: activateCustomButton, banner: activateBannerButton })`, globals);
  actions.banner(3);
  assert.deepEqual(events, [['mobile', 'front'], ['center', 'broadcasts'], ['broadcast', 'UmiMatch#22']]);
  assert.equal(flags.heart, true);
  events.length = 0;
  actions.button(3, 1);
  assert.equal(events.at(-1)[1], 'UnionNews#14', 'Normal heart button toggles the same state back off');
  actions.banner(5);
  assert.equal(events.at(-1)[1], 'Find-a-Pantry#13');
  assert.equal(flags.heart, false);
  assert.equal(flags.lion, true);
  actions.banner(5);
  assert.equal(events.at(-1)[1], 'UnionNews#14');
  events.length = 0;
  for (const disabled of [4, 6, 9998, 9999]) actions.banner(disabled);
  assert.deepEqual(events, [], 'Ads cannot bypass disabled features or page visibility');
  globals.user = null;
  actions.banner(1);
  actions.banner(7);
  assert.deepEqual(events, [], 'Visitor Friends/Settings restrictions remain enforced');
  globals.user = { id: 1, is_high_high_high_admin: 1 };
  actions.banner(1); actions.banner(7); actions.banner(9998); actions.banner(9999); actions.banner(10000); actions.banner(2); actions.banner(18);
  assert.deepEqual(events.slice(0, 4), [['account', 'friends'], ['account', 'settings'], ['page', 'about'], ['page', 'terms']]);
  assert.equal(events[4][1], 'https://www.uminion.com');
  assert.match(events[5][1], /discussions\/13$/);
  assert.deepEqual(events[6], ['snake', true]);
  for (const invalid of [0, 10001, 1.5, '3']) actions.banner(invalid);
  assert.equal(errors.length, 4);
  assert.ok(source.includes('onClick={() => activateCustomButton(buttonNumber)}'));
  assert.equal((source.match(/onButtonClick=\{activateBannerButton\}/g) || []).length, 2, 'Both cover layouts use the same action');
  assert.ok(source.includes('activateBannerButton(activeBottomPromo.button_number)'));
});

test('cover starts with the personal cover, then the pantry image opens button 5', () => {
  const h = hooks(), clicks = [], registered = [];
  const items = [{ image_url: '/default.jpg' }, { image_url: '/blue.jpg', button_number: 5 }];
  const render = compile(`${declaration('ManagedCoverImageSlot')} ManagedCoverImageSlot`, {
    ...h, React, defaultCoverImageUrl: '/default.jpg',
    useManagedCarouselItems: () => ({ items }),
    useQueuedImageSlot: options => { registered.push(options); return true; },
    QueuedImage: 'image', IMAGE_LOAD_PRIORITY: { critical: 0 },
  });
  const props = { userCoverUrl: '/personal.jpg', opacity: 1, fallbackToDefault: false, onButtonClick: number => clicks.push(number) };
  let result = h.render(() => render(props));
  assert.equal(result.type, 'image');
  assert.equal(result.props.src, '/personal.jpg');
  assert.ok(result.props.className.includes('object-contain'), 'Personal covers retain their original fitting');
  assert.equal(registered[0].firstNextIndex, 1);
  registered[0].setIndex(1);
  result = h.render(() => render(props));
  assert.equal(result.type, 'button');
  assert.equal(result.props['aria-label'], 'Open button 5');
  result.props.onClick();
  assert.deepEqual(clicks, [5]);
  assert.equal(nodes(result).find(node => node.type === 'image').props.src, '/blue.jpg');
  assert.ok(nodes(result).find(node => node.type === 'image').props.className.includes('object-cover'), 'Saved top banners retain their original full-slot crop');
});

test('bottom banner row is 2.5x taller (40px to 100px) while keeping width limits and cover fitting', () => {
  const linked = source.slice(source.indexOf('? <button type="button" className={`uhub-banner-action relative h-[100px]'));
  const image = linked.slice(0, linked.indexOf('</button>'));
  assert.ok(image.includes("activeBottomPromo.title ? 'max-w-[50%]' : 'w-full max-w-none'"));
  assert.ok(image.includes("'h-[100px] max-w-full rounded object-cover' : 'h-[100px] w-full max-w-none rounded object-cover'"));
  assert.ok(!image.includes('object-contain'));
  assert.ok(!image.includes("'w-1/2'"));
  assert.ok(source.includes('<div className="flex h-[100px] w-full items-center justify-center gap-2 px-9">'));
  assert.ok(!/activeBottomPromo[^\n]*\bh-10\b/.test(source), 'No bottom banner element keeps the old 40px height');
  assert.ok(source.includes('id="MainUhubFeatureV001ForMyProfileSettingsTopMiddleSection" className="md:w-2/5 h-32 md:h-40 '), 'Desktop top banner stays 160px');
});

test('mobile cover appends bottom banner images after the top entries and plays them in order', () => {
  const h = hooks(), clicks = [], registered = [];
  const items = [{ image_url: '/top-a.jpg' }, { image_url: '/blue.jpg', button_number: 5 }];
  const bottom = [{ image_url: '/red.jpg', button_number: 3 }, { image_url: '/bottom-b.jpg' }];
  const render = compile(`${declaration('ManagedCoverImageSlot')} ManagedCoverImageSlot`, {
    ...h, React, defaultCoverImageUrl: '/default.jpg',
    useManagedCarouselItems: () => ({ items }),
    useQueuedImageSlot: options => { registered.push(options); return true; },
    QueuedImage: 'image', IMAGE_LOAD_PRIORITY: { critical: 0 },
  });
  const props = { userCoverUrl: null, opacity: 1, fallbackToDefault: true, onButtonClick: number => clicks.push(number), appendedItems: bottom };
  h.render(() => render(props));
  assert.deepEqual([...registered[0].urls], ['/top-a.jpg', '/blue.jpg', '/red.jpg', '/bottom-b.jpg']);
  assert.equal(registered[0].sequential, true);
  registered[0].setIndex(2);
  const result = h.render(() => render(props));
  assert.equal(result.props['aria-label'], 'Open button 3');
  result.props.onClick();
  assert.deepEqual(clicks, [3]);
  registered.length = 0;
  h.render(() => render({ ...props, appendedItems: undefined }));
  assert.equal(registered[0].sequential, false, 'Desktop cover keeps random rotation');
  assert.ok(source.includes('appendedItems={mobileBottomBannerItems}'));
  assert.ok(source.includes('{!isMobile && <CoverImageRotator userCoverUrl={user?.cover_photo_url || null} opacity={areProfileSurfacesOpaque ? 1 : 0.5} onButtonClick={activateBannerButton} />}'));
});

test('sequential rotation walks top then bottom entries and loops', async () => {
  const rotationSource = await readFile(new URL('../../includes/uhub/src/lib/carousel-rotation-queue.ts', import.meta.url), 'utf8');
  const h = hooks(), timers = [], moves = [];
  const exports = {};
  compile(rotationSource, {
    exports, require: name => name === 'react' ? { ...h, useState: initial => [initial, () => {}] }
      : name === 'react-dom' ? { flushSync: callback => callback() } : {
        IMAGE_LOAD_PRIORITY: { carousel: 1 }, retainQueuedImages: () => () => {}, preloadQueuedImage: async () => {},
      },
    window: { setTimeout: (callback, delay) => { timers.push({ callback, delay }); return timers.length; } },
    Math: Object.assign(Object.create(Math), { random: () => 0.99 }),
  });
  let index = 0;
  const options = { carouselId: 'cover', urls: ['/t1.jpg', '/t2.jpg', '/b1.jpg'], firstNextIndex: 1, sequential: true, setIndex: next => { moves.push(next); index = next; } };
  for (let step = 0; step < 4; step++) {
    h.render(() => exports.useQueuedImageSlot({ ...options, index }));
    const timer = timers.find(entry => entry.delay === 5000);
    timers.splice(timers.indexOf(timer), 1);
    await timer.callback();
  }
  assert.deepEqual(moves, [1, 2, 0, 1]);
});

test('on mobile, banner features replace the MemeBox until closed, then it restarts on a random unseen entry', async () => {
  assert.ok(source.includes("const MOBILE_MEMEBOX_REPLACEMENT_VIEWS = ['UmiMatch#22', 'Find-a-Pantry#13', 'Million-Pixel#23', 'Beta-Button-10,011'];"));
  assert.ok(source.includes("renderTheMemeBox(broadcasts['UnionNews#14'], { randomStart: (isMobile && memeBoxReplacedByFeatureRef.current) || memeBoxRandomAfterCartRef.current });"));
  assert.ok(source.includes('isOpen && !isDesktopCartOpen && centerView === \'broadcasts\''), 'The desktop Main Cart replaces the MemeBox while open');
  assert.ok(source.includes('Close &amp; back to MemeBox'));
  const renderer = await readFile(new URL('../../includes/uhub/src/TheMemeBoxRenderer.tsx', import.meta.url), 'utf8');
  assert.ok(renderer.includes('showExternalUploadButton hideFooter randomStart={randomStart}'));
  const memeBox = await readFile(new URL('../../includes/uhub/src/features/profile/TheMemeBoxImplementation001.jsx', import.meta.url), 'utf8');
  assert.ok(memeBox.includes('const mainMemeBoxShownPostIds = new Set();'));
  assert.ok(memeBox.includes('filteredPosts.filter((post) => !mainMemeBoxShownPostIds.has(post.id))'));
});

test('Up and Down editors persist, change and clear optional button associations', async () => {
  for (const slot of ['cover', 'bottom']) {
    const h = hooks(), saved = [], alerts = [];
    const render = compile(`${declaration('ManagedCarouselAdminModal')} ManagedCarouselAdminModal`, {
      ...h, React, Button: 'button', FormData, CustomEvent: class {},
      getManagedCarouselLimit: () => 10, parseCaptionStyle: () => ({}), normalizeCaptionUrl: value => value,
      isAcceptedCaptionUrl: () => true, alert: message => alerts.push(message),
      window: { dispatchEvent() {} },
      fetch: async (url, options) => {
        if (options?.method === 'POST') saved.push(JSON.parse(options.body.get('items')));
        return { ok: true, json: async () => ({ items: [{ id: 1, image_url: '/ad.jpg', button_number: 3 }] }) };
      },
    });
    const draw = () => h.render(() => render({ slot, onClose() {} }));
    draw();
    await new Promise(resolve => setImmediate(resolve));
    let result = draw();
    let numberInput = nodes(result).find(node => node.type === 'input' && node.props.type === 'number');
    assert.equal(numberInput.props.value, 3);
    assert.equal(numberInput.props.min, 1);
    assert.equal(numberInput.props.max, 10000);
    numberInput.props.onChange({ target: { value: '10000' } });
    result = draw();
    await nodes(result).find(node => node.type === 'form').props.onSubmit({ preventDefault() {} });
    assert.equal(saved[0][0].button_number, 10000);
    numberInput = nodes(result).find(node => node.type === 'input' && node.props.type === 'number');
    numberInput.props.onChange({ target: { value: '10001' } });
    await nodes(draw()).find(node => node.type === 'form').props.onSubmit({ preventDefault() {} });
    assert.equal(saved.length, 1);
    assert.equal(alerts.length, 1);
    const choice = nodes(draw()).find(node => node.type === 'label' && nodes(node).some(child => child.type === 'input' && child.props.type === 'checkbox') && JSON.stringify(node).includes('Would you like'));
    nodes(choice).find(node => node.type === 'input').props.onChange({ target: { checked: false } });
    result = draw();
    assert.ok(!nodes(result).some(node => node.type === 'input' && node.props.type === 'number' && node.props.max === 10000));
    await nodes(result).find(node => node.type === 'form').props.onSubmit({ preventDefault() {} });
    assert.equal(saved[1][0].button_number, null);
  }
});

test('shared rotation prioritizes the first cover change once, then resumes random choices at unchanged timing', async () => {
  const rotationSource = await readFile(new URL('../../includes/uhub/src/lib/carousel-rotation-queue.ts', import.meta.url), 'utf8');
  const h = hooks(), timers = [], loads = [], visibility = [], moves = [];
  let latest;
  const exports = {};
  const context = {
    exports, require: name => name === 'react' ? { ...h, useState: initial => [initial, value => visibility.push(value)] }
      : name === 'react-dom' ? { flushSync: callback => callback() } : {
        IMAGE_LOAD_PRIORITY: { carousel: 1 }, retainQueuedImages: () => () => {}, preloadQueuedImage: async src => loads.push(src),
      },
    window: { setTimeout: (callback, delay) => { timers.push({ callback, delay }); return timers.length; } },
    Math: Object.assign(Object.create(Math), { random: () => 0.99 }),
  };
  compile(rotationSource, context);
  const options = { carouselId: 'cover', urls: ['/cover.jpg', '/blue.jpg', '/other.jpg'], index: 0,
    firstNextIndex: 1, setIndex: index => { moves.push(index); latest = index; } };
  h.render(() => exports.useQueuedImageSlot(options));
  assert.equal(timers[0].delay, 5000);
  await timers.shift().callback();
  assert.deepEqual(moves, [1]);
  assert.deepEqual(loads, ['/blue.jpg']);
  h.render(() => exports.useQueuedImageSlot({ ...options, index: latest }));
  const next = timers.find(timer => timer.delay === 5000);
  timers.splice(timers.indexOf(next), 1);
  await next.callback();
  assert.deepEqual(moves, [1, 2], 'Second change is random, not pinned to the pantry');
  assert.deepEqual(visibility, [false, true, false, true]);
  h.render(() => exports.useQueuedImageSlot({ ...options, index: latest, paused: true }));
  const pausedVisit = timers.find(timer => timer.delay === 5000);
  timers.splice(timers.indexOf(pausedVisit), 1);
  await pausedVisit.callback();
  assert.deepEqual(moves, [1, 2], 'Paused carousels still skip their normal scheduled visit');
  h.render(() => exports.useQueuedImageSlot({ ...options, index: 0, urls: ['/new.jpg', '/new-blue.jpg'] }));
  await timers.find(timer => timer.delay === 5000).callback();
  assert.equal(loads.at(-1), '/new-blue.jpg', 'A new saved image collection gets its own first transition');
  assert.ok(timers.every(timer => [4000, 5000].includes(timer.delay)));
});

test('mobile cover overlay lets taps reach linked banner images', async () => {
  const css = await readFile(new URL('../../includes/uhub/src/index.css', import.meta.url), 'utf8');
  assert.match(css, /\.uhub-mobile-cover::after \{[^}]*pointer-events: none;/, 'The decorative ::after layer must not block banner taps on mobile');
});
