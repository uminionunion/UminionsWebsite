import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../../includes/uhub/src/features/profile/MainUhubFeatureV001ForMyProfileModal.tsx', import.meta.url), 'utf8');
const tree = ts.createSourceFile('hub.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

test('UnionNews and MemeBox credits spell GGEMMMS with two leading Gs', async () => {
  assert.ok(source.includes("title: 'UnionNews#14 & GGEMMMS#25', creator: 'GGEMMMS#25'"));
  assert.ok(source.includes('by {broadcast.creator}'));
  const footerSources = await Promise.all([
    '../../includes/uhub/src/TheMemeBoxRenderer.tsx',
    '../../includes/uhub/src/features/profile/TheMemeBoxImplementation001.jsx',
  ].map(path => readFile(new URL(path, import.meta.url), 'utf8')));
  for (const footerSource of footerSources) {
    assert.ok(footerSource.includes('A GGEMMMS#25 Creation: "The MemeBox"'));
  }
  for (const creditSource of [source, ...footerSources]) {
    assert.doesNotMatch(creditSource, /(?<!G)GEMMMS#25/);
  }
});

function findNode(predicate) {
  let result;
  const visit = node => {
    if (!result && predicate(node)) result = node;
    if (!result) ts.forEachChild(node, visit);
  };
  visit(tree);
  assert.ok(result, 'Expected source node was not found');
  return result;
}

function compile(sourceText, globals) {
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: { module: ts.ModuleKind.None, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React },
    reportDiagnostics: true,
  });
  assert.deepEqual(compiled.diagnostics, []);
  return vm.runInNewContext(compiled.outputText, globals);
}

test('broadcast carousel shows the launch message only when it has no images', async () => {
  const carouselSource = await readFile(new URL('../../includes/uhub/src/features/profile/BroadcastCarousel.tsx', import.meta.url), 'utf8');
  const carouselTree = ts.createSourceFile('carousel.tsx', carouselSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaration = carouselTree.statements
    .filter(ts.isVariableStatement)
    .flatMap(statement => [...statement.declarationList.declarations])
    .find(node => node.name.getText(carouselTree) === 'BroadcastCarousel');
  assert.ok(declaration);
  const render = compile(`const ${declaration.getText(carouselTree)}; BroadcastCarousel`, {
    React: {
      createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
      useEffect() {},
    },
    useState: initial => [initial, () => {}],
    Button: 'button', QueuedImage: 'image', ChevronLeft: 'left', ChevronRight: 'right',
    window: { innerWidth: 400 },
  });
  const text = node => typeof node === 'string' ? node : (node?.props?.children ?? []).flat(Infinity).map(text).join('');
  for (const props of [{}, { items: [] }]) {
    assert.equal(text(render(props)).trim(), 'Coming Soon This Week!!!');
  }
  const populated = render({ items: [{ id: 1, title: 'Existing image', imageUrl: '/data/image.png', clickUrl: '' }] });
  assert.ok(!text(populated).includes('Coming Soon This Week!!!'));
  assert.ok(JSON.stringify(populated).includes('/data/image.png'));
});

test('mobile viewport follows breakpoint changes and removes its listener on unmount', () => {
  const hook = findNode(node => ts.isFunctionDeclaration(node) && node.name?.text === 'useMobileViewport');
  let state;
  let listener;
  let cleanup;
  let initialized = false;
  const query = {
    matches: true,
    addEventListener(event, callback) { assert.equal(event, 'change'); listener = callback; },
    removeEventListener(event, callback) { assert.equal(event, 'change'); assert.equal(callback, listener); listener = undefined; },
  };
  const useHook = compile(`${hook.getText(tree)}; useMobileViewport`, {
    window: { matchMedia(value) { assert.equal(value, '(max-width: 767px)'); return query; } },
    useState(initial) {
      if (!initialized) { state = initial(); initialized = true; }
      return [state, value => { state = value; }];
    },
    useEffect(callback) { cleanup ??= callback(); },
  });
  assert.equal(useHook(), true);
  query.matches = false;
  listener();
  assert.equal(useHook(), false);
  query.matches = true;
  listener();
  assert.equal(useHook(), true);
  cleanup();
  assert.equal(listener, undefined);
});

test('mobile footer orders Front Page, Stores, disabled Coming Soon and More', () => {
  const nav = findNode(node => ts.isJsxElement(node) && node.openingElement.tagName.getText(tree) === 'nav' && node.openingElement.getText(tree).includes('Mobile sections'));
  const createElement = (type, props, ...children) => ({ type, props: { ...props, children } });
  const render = compile(`function navigation(mobileSection, setMobileSection, setCenterView, setBroadcastView, unreadChatrooms) { return (${nav.getText(tree)}); }; navigation`, {
    React: { createElement }, Megaphone: 'Megaphone', Anvil: 'Anvil', ShoppingCart: 'ShoppingCart', MoreHorizontal: 'MoreHorizontal',
  });
  let section = 'front';
  let center = 'settings';
  let broadcast = 'UnionRadio#15';
  const renderNav = () => render(section, value => { section = value; }, value => { center = value; }, value => { broadcast = value; }, new Set([1]));
  const buttons = renderNav().props.children.flat().filter(node => node?.type === 'button');
  assert.equal(buttons.length, 4);
  assert.equal(buttons.filter(node => node.props['aria-current'] === 'page').length, 1);
  assert.equal(buttons[2].props.disabled, true);
  assert.equal(buttons[2].props.onClick, undefined);
  assert.equal(buttons[2].props.id, 'uhub-mobile-coming-soon-footer');
  assert.deepEqual(buttons.map(button => button.props.children[1].props.children[0]), ['Front Page', 'Stores', 'Coming Soon', 'More']);
  for (const [index, expected] of [[0, 'front'], [1, 'stores'], [3, 'more']]) {
    buttons[index].props.onClick();
    assert.equal(section, expected);
    assert.equal(renderNav().props.children.flat().filter(node => node?.props?.['aria-current'] === 'page').length, 1);
  }
  buttons[0].props.onClick();
  assert.equal(center, 'broadcasts');
  assert.equal(broadcast, 'UnionNews#14');
});

test('only the mobile front-page broadcast moves its shared navigation below the MemeBox', () => {
  const placement = findNode(node => ts.isVariableDeclaration(node) && node.name.getText(tree) === 'moveNavigationBelowMemeBox');
  const shouldMove = compile(`(isMobile, broadcastView) => (${placement.initializer.getText(tree)})`, {});
  assert.equal(shouldMove(true, 'UnionNews#14'), true);
  for (const view of ['UnionNews#14', 'UnionRadio#15', 'MyBroadcasts', 'Find-a-Pantry#13']) {
    assert.equal(shouldMove(false, view), false);
    if (view !== 'UnionNews#14') assert.equal(shouldMove(true, view), false);
  }
  assert.ok(source.includes('{!moveNavigationBelowMemeBox && broadcastNavigation}'));
  assert.ok(source.includes('bottomNavigation={moveNavigationBelowMemeBox ? broadcastNavigation : null}'));
  const broadcast = findNode(node => ts.isVariableDeclaration(node) && node.name.getText(tree) === 'BroadcastView');
  const mobileReturn = broadcast.initializer.body.statements.find(node => ts.isIfStatement(node) && node.expression.getText(tree) === 'isMobile').getText(tree);
  assert.ok(mobileReturn.indexOf('{bottomNavigation}') > mobileReturn.indexOf('id="TheReactMemeImplementationConnection001"'));
});

test('broadcast hooks execute before alternate-view returns, including UnionRadio', () => {
  const broadcast = findNode(node => ts.isVariableDeclaration(node) && node.name.getText(tree) === 'BroadcastView');
  const statements = broadcast.initializer.body.statements;
  const effectIndex = statements.findIndex(node => ts.isExpressionStatement(node) && ts.isCallExpression(node.expression) && node.expression.expression.getText(tree) === 'useEffect');
  const radioIndex = statements.findIndex(node => ts.isIfStatement(node) && node.expression.getText(tree).includes("'UnionRadio#15'"));
  assert.ok(effectIndex >= 0);
  assert.ok(radioIndex > effectIndex, 'Switching to radio must not skip a previously executed hook');
});

test('mobile header orders Profile, hub, radio, separate disabled anvil and feature page', () => {
  const nav = findNode(node => ts.isJsxElement(node) && node.openingElement.tagName.getText(tree) === 'nav' && node.openingElement.getText(tree).includes('Mobile shortcuts'));
  const actions = [];
  const render = compile(`(${nav.getText(tree)})`, {
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    Button: 'button', MessageSquare: 'icon', Anvil: 'icon', Radio: 'icon', Home: 'icon',
    user: { id: 1 }, mobileSection: 'front', unreadChatrooms: new Set(),
    setMobileSection: value => actions.push(['section', value]),
    setCenterView: value => actions.push(['center', value]),
    setBroadcastView: value => actions.push(['broadcast', value]),
    setIsQuadrantsModalOpen: value => actions.push(['stores', value]),
    handleMicrophoneButtonClick: () => actions.push(['radio']),
    setIsHomeModalOpen: value => actions.push(['home', value]),
  });
  const buttons = render.props.children;
  assert.equal(buttons.length, 5);
  assert.deepEqual(buttons.map(button => button.props.children[1].props.children[0]), ['Profile', 'uHome-Hub', 'UnionRadio', 'Coming Soon', '10,000']);
  assert.equal(buttons[3].props.disabled, true);
  assert.equal(buttons[3].props.id, 'uhub-mobile-coming-soon-top');
  buttons.filter(button => button.props.onClick).forEach(button => button.props.onClick());
  assert.deepEqual(actions, [['home', true], ['section', 'hub'], ['radio'], ['section', 'features']]);
  assert.equal(buttons[4].props.children[0].props.src, '/uhub/dist/mobile-custom-buttons-logo.png');
});

test('More stacks matching Friends, social toggle and Close rows while preserving actions and visitor gating', async () => {
  const nav = findNode(node => ts.isJsxElement(node) && node.openingElement.tagName.getText(tree) === 'div' && node.openingElement.getText(tree).includes('More options'));
  const rows = nav.children.filter(node => ts.isJsxExpression(node) && node.expression && ts.isBinaryExpression(node.expression) && node.expression.left.getText(tree) === 'isMobile');
  const calls = [];
  const render = compile(`(user) => ([${rows.map(node => node.expression.right.getText(tree)).join(',')}])`, {
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    X: 'close-icon', ChevronUp: 'up-icon', ChevronDown: 'down-icon', pendingFriendRequests: [{ id: 1 }, { id: 2 }],
    mobileFooterOpen: false, setMobileFooterOpen: updater => calls.push(updater(false)),
    handleTopLeftButtonClick: value => calls.push(value), onClose: () => calls.push('close'),
  });
  const output = render({ id: 1 });
  assert.equal(output.length, 3);
  assert.equal(output[1].props.children[0], 'Social Links & Promotions');
  output.forEach(button => assert.ok(button.props.className.includes('uhub-mobile-footer-toggle')));
  output.forEach(button => button.props.onClick());
  assert.deepEqual(calls, ['friends', true, 'close']);
  assert.equal(output[0].props.disabled, false);
  assert.equal(render(null)[0].props.disabled, true);
  assert.deepEqual(output[0].props.children[0].props.children[1].props.children, [2]);
  assert.equal(output[2].props.children[1].type, 'close-icon');
  const css = await readFile(new URL('../../includes/uhub/src/index.css', import.meta.url), 'utf8');
  assert.match(css, /\.uhub-mobile-friends-row \{\s*order: -3;/);
  assert.match(css, /\.uhub-mobile-close-row \{\s*order: 1;/);
  assert.ok(!source.includes('mobileButtonsOpen'));
});

test('mobile draft is controlled in memory and only successful submission clears it', async () => {
  const social = findNode(node => ts.isVariableDeclaration(node) && node.name.getText(tree) === 'FrontPageSocial');
  let content = 'Unsent mobile draft';
  const requests = [];
  const alerts = [];
  let succeed = false;
  const render = compile(`const ${social.getText(tree)}; FrontPageSocial`, {
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    useState: initial => [initial, () => {}], WorldFeed: 'feed', Button: 'button',
    fetch: async (url, options) => { requests.push([url, JSON.parse(options.body)]); return { ok: succeed, json: async () => ({ error: 'Fixture failure' }) }; },
    window: { alert: message => alerts.push(message) },
  });
  const props = () => ({ user: { id: 1 }, compact: true, draft: { content, onChange: value => { content = value; } } });
  const composer = () => render(props()).props.children[1];
  composer().props.children[0].props.onChange({ target: { value: 'Keep this when collapsed' } });
  assert.equal(content, 'Keep this when collapsed');
  assert.equal(requests.length, 0, 'Typing does not write to the server');
  await composer().props.children[1].props.children[1].props.onClick();
  assert.equal(content, 'Keep this when collapsed');
  assert.deepEqual(alerts, ['Fixture failure']);
  succeed = true;
  await composer().props.children[1].props.children[1].props.onClick();
  assert.equal(content, '');
  assert.deepEqual(requests, [
    ['/api/social-posts', { content: 'Keep this when collapsed' }],
    ['/api/social-posts', { content: 'Keep this when collapsed' }],
  ]);
  const app = await readFile(new URL('../../includes/uhub/src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /setMobileWorldFeedDraft\(''\);[\s\S]*?\}, \[user\?\.id\]\)/);
  assert.ok(app.includes('mobileWorldFeedDraft={mobileWorldFeedDraft}'));
});

test('mobile feed expands on click, keyboard focus or typing and cleans up outside listeners without touching drafts', () => {
  const component = findNode(node => ts.isVariableDeclaration(node) && node.name.getText(tree) === 'MobileWorldFeed');
  const listeners = new Map();
  const removed = [];
  const expansion = [];
  let cleanup;
  class FakeNode {}
  class FakeTextarea extends FakeNode {}
  const inside = new FakeNode();
  const render = compile(`const ${component.getText(tree)}; MobileWorldFeed`, {
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    FrontPageSocial: 'social', Node: FakeNode, HTMLTextAreaElement: FakeTextarea, HTMLInputElement: class extends FakeNode {},
    useRef: () => ({ current: { contains: node => node === inside } }),
    useEffect: effect => { cleanup = effect(); },
    document: {
      addEventListener: (event, callback) => listeners.set(event, callback),
      removeEventListener: (event, callback) => { assert.equal(callback, listeners.get(event)); removed.push(event); },
    },
  });
  const output = render({ user: { id: 1 }, draft: 'Keep me', onDraftChange: () => assert.fail('Expansion/collapse must not change the draft'), expanded: true, onExpandedChange: value => expansion.push(value) });
  assert.deepEqual([...listeners.keys()], ['pointerdown', 'focusin']);
  output.props.onClickCapture();
  output.props.onInputCapture();
  output.props.onFocusCapture({ target: new FakeTextarea() });
  listeners.get('pointerdown')({ target: inside });
  listeners.get('pointerdown')({ target: new FakeNode() });
  listeners.get('focusin')({ target: new FakeNode() });
  assert.deepEqual(expansion, [true, true, true, false, false]);
  assert.equal(output.props.onPointerDownCapture, undefined, 'Pointer-down expansion would move buttons before their click completes');
  cleanup();
  assert.deepEqual(removed, ['pointerdown', 'focusin']);
  assert.equal(output.props.children[1].props.draft.content, 'Keep me');
});

test('MemeBox side rails reuse existing handlers in the requested order, including favorites double-click', async () => {
  const memeSource = await readFile(new URL('../../includes/uhub/src/features/profile/TheMemeBoxImplementation001.jsx', import.meta.url), 'utf8');
  const memeTree = ts.createSourceFile('meme.jsx', memeSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
  let shell;
  const visit = node => {
    if (ts.isJsxElement(node) && node.openingElement.getText(memeTree).includes('className="meme-mobile-shell"')) shell = node;
    ts.forEachChild(node, visit);
  };
  visit(memeTree);
  assert.ok(shell);
  const actions = [];
  const handlers = ['showPreviousPost', 'openUploadDialog', 'handleUpvote', 'openViewCommentsDialog', 'showNextPost', 'handlePageNavigation', 'handleDownvote', 'handleFavoriteButtonClick', 'handleFavoriteButtonDoubleClick'];
  const globals = Object.fromEntries(handlers.map(name => [name, () => actions.push(name)]));
  const render = compile(`function rails(displayPost) { return (${shell.getText(memeTree)}); }; rails`, {
    ...globals, embedded: true, EMOJIS: {}, getPageTitle: () => 'User Posts',
    renderPostViewer: () => 'existing-media-viewer',
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
  });
  const output = render({ upvotes: 2, downvotes: 1, comments: [], isFavorited: true });
  assert.equal(output.props.children[1], 'existing-media-viewer');
  const buttons = [output.props.children[0], output.props.children[2]].flatMap(rail => rail.props.children.filter(child => child.type === 'button'));
  assert.deepEqual(buttons.map(button => button.props['aria-label']), ['Previous meme', 'Upload meme', 'Upvote meme', 'Meme comments', 'Next meme', 'Meme user posts', 'Downvote meme', 'Meme favorites']);
  buttons.forEach(button => button.props.onClick());
  buttons[7].props.onDoubleClick();
  assert.deepEqual(actions, handlers);
  const css = await readFile(new URL('../../includes/uhub/src/index.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /\.meme-mobile-rail button\[aria-label="(?:Upvote meme|Meme comments|Downvote meme|Meme favorites)"\][^{]*\{[^}]*transform:/);
  assert.match(css, /\.meme-mobile-rail-spacer \{\s*display: block;\s*flex: 1;/);
  assert.match(css, /\.meme-embedded \.meme-images-stack \{\s*grid-column: 2;\s*grid-row: 1;/);
  assert.match(css, /\.meme-embedded \.meme-post-info \{\s*grid-column: 2;\s*grid-row: 2;/);
  assert.match(css, /\.meme-mobile-rail \{[^}]*grid-row: 1;/);
  assert.match(css, /\.meme-mobile-rail button \{[\s\S]*?height: 40px;/);
  const empty = render(null);
  for (const rail of [empty.props.children[0], empty.props.children[2]]) {
    const controls = rail.props.children.filter(child => child.type === 'button');
    assert.ok(controls.slice(2).every(button => button.props.disabled));
  }
});
