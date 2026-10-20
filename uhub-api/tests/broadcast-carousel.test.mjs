import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const profile = '../../includes/uhub/src/features/profile/';
const source = await readFile(new URL(`${profile}BroadcastCarousel.tsx`, import.meta.url), 'utf8');
const zoomSource = await readFile(new URL(`${profile}BroadcastCarouselZoomModal.tsx`, import.meta.url), 'utf8');
const mainSource = await readFile(new URL(`${profile}MainUhubFeatureV001ForMyProfileModal.tsx`, import.meta.url), 'utf8');

function harness(sourceText, name) {
  const tree = ts.createSourceFile('component.tsx', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaration = tree.statements.filter(ts.isVariableStatement)
    .flatMap(statement => [...statement.declarationList.declarations])
    .find(node => node.name.getText(tree) === name);
  assert.ok(declaration);
  const values = [];
  const dependencies = [];
  let cursor = 0;
  let effects = [];
  const useState = initial => {
    const index = cursor++;
    if (!(index in values)) values[index] = initial;
    return [values[index], next => { values[index] = typeof next === 'function' ? next(values[index]) : next; }];
  };
  const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useEffect(callback, deps) {
      const index = cursor++;
      if (!dependencies[index] || deps.some((value, i) => value !== dependencies[index][i])) {
        dependencies[index] = deps;
        effects.push(callback);
      }
    },
  };
  const result = ts.transpileModule(`const ${declaration.getText(tree)}; ${name}`, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  const render = vm.runInNewContext(result.outputText, {
    React, useState, Button: 'button', QueuedImage: 'image', ChevronLeft: 'icon', ChevronRight: 'icon',
    ZoomIn: 'icon', ZoomOut: 'icon', Dialog: 'dialog', DialogContent: 'content', DialogTitle: 'title',
    console, alert: message => assert.fail(message),
  });
  return props => {
    cursor = 0;
    effects = [];
    let output = render(props);
    if (effects.length) {
      effects.forEach(effect => effect());
      cursor = 0;
      effects = [];
      output = render(props);
    }
    return output;
  };
}

function all(node, predicate) {
  if (Array.isArray(node)) return node.flatMap(child => all(child, predicate));
  if (!node || typeof node !== 'object') return [];
  return [...(predicate(node) ? [node] : []), ...all(node.props?.children, predicate)];
}
const images = tree => all(tree, node => node.type === 'image');
const button = (tree, label) => {
  const result = all(tree, node => node.props?.['aria-label'] === label)[0];
  assert.ok(result, `Missing control: ${label}`);
  return result;
};
const item = id => ({ id, title: `Image ${id}`, imageUrl: `/data/${id}.jpg`, clickUrl: '' });

test('one through five uploads occupy exactly two slots per page in newest-first order', () => {
  const render = harness(source, 'BroadcastCarousel');
  for (let count = 1; count <= 5; count++) {
    const items = Array.from({ length: count }, (_, index) => item(count - index));
    let tree = render({ items });
    for (let page = 0; page < Math.ceil(count / 2); page++) {
      assert.deepEqual(images(tree).map(node => node.props.src), items.slice(page * 2, page * 2 + 2).map(value => value.imageUrl));
      button(tree, 'Next carousel page').props.onClick();
      tree = render({ items });
    }
    assert.deepEqual(images(tree).map(node => node.props.src), items.slice(0, 2).map(value => value.imageUrl));
    button(tree, 'Previous carousel page').props.onClick();
    tree = render({ items });
    assert.deepEqual(images(tree).map(node => node.props.src), items.slice(Math.floor((count - 1) / 2) * 2).map(value => value.imageUrl));
  }
});

test('new uploads reset to the first pair and deletions clamp the current page', () => {
  const render = harness(source, 'BroadcastCarousel');
  let items = [5, 4, 3, 2, 1].map(item);
  let tree = render({ items });
  button(tree, 'Next carousel page').props.onClick();
  tree = render({ items });
  assert.equal(images(tree)[0].props.src, '/data/3.jpg');
  items = [item(6), ...items];
  tree = render({ items });
  assert.deepEqual(images(tree).map(node => node.props.src), ['/data/6.jpg', '/data/5.jpg']);
  button(tree, 'Next carousel page').props.onClick();
  tree = render({ items });
  button(tree, 'Next carousel page').props.onClick();
  tree = render({ items: items.slice(0, 2) });
  assert.deepEqual(images(tree).map(node => node.props.src), ['/data/6.jpg', '/data/5.jpg']);
});

test('UnionNews page 183 contains images 2 and 1; there is no page 184', () => {
  const render = harness(source, 'BroadcastCarousel');
  const items = Array.from({ length: 366 }, (_, index) => item(366 - index));
  const props = { items, visibleItemCount: 2, maxPages: 183 };
  let tree = render(props);
  for (let page = 1; page < 183; page++) {
    button(tree, 'Next carousel page').props.onClick();
    tree = render(props);
  }
  assert.deepEqual(images(tree).map(node => node.props.src), ['/data/2.jpg', '/data/1.jpg']);
  button(tree, 'Next carousel page').props.onClick();
  tree = render(props);
  assert.deepEqual(images(tree).map(node => node.props.src), ['/data/366.jpg', '/data/365.jpg']);
  button(tree, 'Previous carousel page').props.onClick();
  tree = render(props);
  assert.deepEqual(images(tree).map(node => node.props.src), ['/data/2.jpg', '/data/1.jpg']);
});

test('images fill both halves without arrow columns, padding, gaps or full-image admin overlays', () => {
  const render = harness(source, 'BroadcastCarousel');
  const tree = render({ items: [item(2), item(1)], isAdmin: true, onReorderLeft() {}, onReorderRight() {} });
  assert.match(tree.props.className, /w-full h-48/);
  const grid = all(tree, node => node.props?.className?.includes('grid-cols-2'))[0];
  assert.match(grid.props.className, /gap-0 w-full h-full/);
  for (const image of images(tree)) assert.match(image.props.className, /h-full w-full object-cover/);
  assert.match(button(tree, 'Enlarge Image 2').props.className, /p-0 border-0/);
  for (const direction of ['Previous', 'Next']) {
    assert.match(button(tree, `${direction} carousel page`).props.className, /absolute/);
  }
  assert.ok(!source.includes('absolute inset-0'));
  assert.ok(!source.includes('window.innerWidth'));
  const one = render({ items: [item(1)] });
  assert.equal(images(one).length, 1);
  assert.equal(button(one, 'Next carousel page').props.disabled, true);
});

test('UnionNews uses black behind empty, single and paired images without changing other carousels', () => {
  const render = harness(source, 'BroadcastCarousel');
  for (const items of [[], [item(1)], [item(2), item(1)]]) {
    const tree = render({ items, backgroundClassName: 'bg-black' });
    assert.match(tree.props.className, /\bbg-black\b/);
    assert.ok(!tree.props.className.includes('bg-muted'));
    assert.match(render({ items }).props.className, /\bbg-muted\b/);
  }
  assert.match(mainSource, /backgroundClassName=\{broadcastView === 'UnionNews#14' \? 'bg-black' : undefined\}/);
  assert.match(mainSource, /maxPages=\{183\}\s+backgroundClassName="bg-black"/);
});

test('admin and non-admin images open zoom even when linked; links remain separate and reorder buttons still work', async () => {
  for (const isAdmin of [true, false]) {
    const render = harness(source, 'BroadcastCarousel');
    let selected;
    let moved;
    const items = [{ ...item(2), clickUrl: 'https://example.com' }, item(1)];
    const tree = render({
      items, isAdmin,
      onImageZoom: (...args) => { selected = args; },
      onReorderRight: async id => { moved = id; },
      onReorderLeft: async id => { moved = id; },
    });
    button(tree, 'Enlarge Image 2').props.onClick();
    assert.equal(selected[0], '/data/2.jpg');
    assert.equal(selected[2], items);
    assert.equal(selected[3], 0);
    assert.equal(all(tree, node => node.type === 'a')[0].props.href, 'https://example.com');
    if (isAdmin) {
      assert.equal(button(tree, 'Move Image 2 left').props.disabled, true);
      assert.equal(button(tree, 'Move Image 1 right').props.disabled, true);
      await button(tree, 'Move Image 2 right').props.onClick();
      assert.equal(moved, 2);
    } else {
      assert.equal(all(tree, node => node.props?.['aria-label']?.startsWith('Move ')).length, 0);
    }
  }
});

test('image viewer fits the complete image with no magnification controls and closes through the shared dialog', () => {
  const render = harness(zoomSource, 'BroadcastCarouselZoomModal');
  let closed = false;
  const props = { imageUrl: '/data/1.jpg', title: 'Image 1', onClose: () => { closed = true; } };
  let tree = render(props);
  assert.equal(tree.type, 'dialog');
  const img = all(tree, node => node.type === 'img')[0];
  assert.match(img.props.className, /w-full max-h-\[72vh\] object-contain/);
  assert.equal(img.props.src, props.imageUrl);
  assert.equal(all(tree, node => node.type === 'button').length, 0);
  assert.ok(!zoomSource.includes('setZoom'));
  assert.ok(!zoomSource.includes('300'));
  img.props.onError();
  tree = render(props);
  assert.equal(all(tree, node => node.props?.role === 'alert').length, 1);
  assert.equal(all(tree, node => node.props?.role === 'status').length, 0);
  tree.props.onOpenChange(false);
  assert.equal(closed, true);
});

test('UnionNews desktop/mobile use pairs, share the image setter and retain API display order', () => {
  assert.match(mainSource, /visibleItemCount=\{broadcastView === 'UnionNews#14' \? 2 :/);
  assert.match(mainSource, /items=\{unionNews14Images\}\s+visibleItemCount=\{2\}/);
  assert.match(mainSource, /setUnionNews14Images=\{setUnionNews14Images\}/);
  assert.match(mainSource, /unionNews14Images,\s+setUnionNews14Images,/);
  assert.ok(!mainSource.includes('const sortedData = data.sort('));
});
