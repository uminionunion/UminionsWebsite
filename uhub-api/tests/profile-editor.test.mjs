import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const frontend = path.join(root, 'includes', 'uhub', 'src');
const editorSource = await readFile(path.join(frontend, 'features', 'profile', 'ProfilePhotoEditor.tsx'), 'utf8');
const authSource = await readFile(path.join(frontend, 'hooks', 'useAuth.tsx'), 'utf8');

async function moduleFrom(source, imports, globals = {}) {
  const context = vm.createContext({ console, Error, ...globals });
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React },
  }).outputText;
  const module = new vm.SourceTextModule(compiled, { context });
  await module.link(async specifier => {
    const values = imports[specifier];
    assert.ok(values, `Unexpected import: ${specifier}`);
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [name, value] of Object.entries(values)) this.setExport(name, value);
    }, { context });
  });
  await module.evaluate();
  return module.namespace;
}

function hookRenderer() {
  const states = [];
  let cursor = 0;
  let pending = [];
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [states[index].value, value => {
        states[index].value = typeof value === 'function' ? value(states[index].value) : value;
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = { current: initial };
      return states[index];
    },
    useId: () => `test-${cursor++}`,
    useEffect(callback, dependencies) {
      const index = cursor++;
      const previous = states[index];
      if (!previous || !dependencies || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        pending.push(() => {
          previous?.cleanup?.();
          states[index] = { dependencies, cleanup: callback() };
        });
      }
    },
  };
  return {
    react,
    render(component, props) {
      cursor = 0;
      const tree = component(props);
      const effects = pending;
      pending = [];
      effects.forEach(effect => effect());
      return tree;
    },
    unmount() {
      states.forEach(state => state?.cleanup?.());
    },
  };
}

function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...(node.props?.children || []).flat(Infinity).flatMap(nodes)];
}

function text(node) {
  return typeof node === 'string' ? node : (node?.props?.children || []).flat(Infinity).map(text).join('');
}

async function editorHarness(purpose = 'profile') {
  const renderer = hookRenderer();
  const requests = [];
  const updates = [];
  const events = [];
  const saved = [];
  const created = [];
  const revoked = [];
  let closed = 0;
  let tree;
  let response = { ok: true, status: 201, json: async () => ({
    photo: { id: 1, url: '/new.png', caption: null },
    profile_image_url: '/new.png',
    cover_photo_url: '/cover.png',
  }) };
  let fetchError;
  const exports = await moduleFrom(editorSource, {
    react: { default: renderer.react, ...renderer.react },
    'lucide-react': { X: 'X' },
    '../../components/ui/button': { Button: 'Button' },
    '../../hooks/useAuth': { useAuth: () => ({
      user: { id: 7 },
      updateUser: update => updates.push(update),
    }) },
    '../../lib/profile-photo-events': { notifyProfilePhotosChanged: detail => events.push(detail) },
  }, {
    window: { setTimeout: () => 1, clearTimeout() {} },
    document: { activeElement: null },
    URL: {
      createObjectURL(file) {
        const url = `blob:profile-${created.length}`;
        created.push({ file, url });
        return url;
      },
      revokeObjectURL: url => revoked.push(url),
    },
    FormData: class {
      fields = new Map();
      append(name, value) { this.fields.set(name, value); }
    },
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (fetchError) throw fetchError;
      return response;
    },
  });
  const props = {
    userId: 7, purpose, currentImageUrl: '/old.png',
    onClose: () => closed++,
    onSaved: result => saved.push(result),
  };
  const render = () => { tree = renderer.render(exports.default, props); };
  const find = predicate => nodes(tree).find(predicate);
  const button = label => find(node => node.type === 'Button' && text(node) === label);
  render();
  return {
    requests, updates, events, saved, created, revoked, props, render, find, button,
    get closed() { return closed; },
    get error() { return text(find(node => node.props?.role === 'alert')); },
    response: value => { response = value; },
    rejectFetch: value => { fetchError = value; },
    choose(file) {
      find(node => node.type === 'input').props.onChange({ target: { files: file ? [file] : [] } });
      render();
      render();
    },
    previewLoaded() {
      const preview = find(node => node.type === 'img' && node.props.alt.startsWith('New '));
      assert.ok(preview);
      preview.props.onLoad();
      render();
      return preview;
    },
    async save() {
      const save = button('Save');
      assert.ok(save);
      assert.equal(save.props.disabled, false);
      save.props.onClick();
      await new Promise(resolve => setImmediate(resolve));
      render();
    },
    unmount: () => renderer.unmount(),
  };
}

const file = (name = 'photo.png', type = 'image/png', size = 100) => ({ name, type, size });

test('initial Cancel closes; selection previews without uploading; only Save persists and publishes', async () => {
  const editor = await editorHarness();
  assert.equal(text(editor.find(node => node.type === 'figcaption')), 'Present Profile Picture');
  assert.equal(editor.button('Save'), undefined);
  editor.button('Cancel').props.onClick();
  assert.equal(editor.closed, 1);
  editor.choose(file());
  assert.equal(editor.requests.length, 0);
  assert.equal(editor.button('Save').props.disabled, true);
  const preview = editor.previewLoaded();
  assert.match(preview.props.className, /object-contain/);
  assert.match(preview.props.className, /rounded-full/);
  assert.equal(editor.requests.length, 0);
  await editor.save();
  assert.equal(editor.requests.length, 1);
  const request = editor.requests[0];
  assert.equal(request.url, '/api/user-photos');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.credentials, 'include');
  assert.equal(request.options.body.fields.get('purpose'), 'profile');
  assert.equal(request.options.body.fields.get('media').name, 'photo.png');
  assert.equal(editor.saved.length, 1);
  assert.equal(editor.updates[0].profile_image_url, '/new.png');
  assert.equal(editor.events[0].userId, 7);
  editor.unmount();
});

test('save failures are explicit and never trigger success, auth updates, or events', async () => {
  for (const failure of ['http', 'malformed', 'network']) {
    const editor = await editorHarness();
    editor.choose(file());
    editor.previewLoaded();
    if (failure === 'http') editor.response({ ok: false, status: 500, json: async () => ({ error: 'Server rejected photo' }) });
    if (failure === 'malformed') editor.response({ ok: true, status: 201, json: async () => ({}) });
    if (failure === 'network') editor.rejectFetch(new Error('Network unavailable'));
    await editor.save();
    assert.match(editor.error, failure === 'http' ? /Server rejected/ : failure === 'network' ? /Network unavailable/ : /did not confirm/);
    assert.equal(editor.saved.length, 0);
    assert.equal(editor.updates.length, 0);
    assert.equal(editor.events.length, 0);
    editor.unmount();
  }
});

test('formats, empty files, and exact 25 GiB boundary are validated without upload', async () => {
  const editor = await editorHarness();
  for (const invalid of [file('photo.gif', 'image/gif'), file('photo.png', 'text/plain'), file('photo', 'image/png')]) {
    editor.choose(invalid);
    assert.match(editor.error, /JPG, JPEG, or PNG/);
    assert.equal(editor.button('Save'), undefined);
  }
  editor.choose(file('empty.png', 'image/png', 0));
  assert.match(editor.error, /empty/);
  editor.choose(file('large.png', 'image/png', 25 * 1024 ** 3 + 1));
  assert.match(editor.error, /25 GiB/);
  for (const valid of [
    file('photo.JPG', 'image/jpeg'), file('photo.jpeg', 'image/jpeg'),
    file('photo.png', ''), file('boundary.png', 'image/png', 25 * 1024 ** 3),
  ]) {
    editor.choose(valid);
    assert.equal(editor.error, '');
    assert.ok(editor.button('Save'));
  }
  assert.equal(editor.requests.length, 0);
  editor.unmount();
});

test('object URLs are revoked on replacement, Cancel, invalid replacement, and unmount', async () => {
  const editor = await editorHarness();
  editor.choose(file('first.png'));
  editor.choose(file('second.png'));
  assert.deepEqual(editor.revoked, [editor.created[0].url]);
  editor.button('Cancel').props.onClick();
  editor.render();
  assert.deepEqual(editor.revoked, editor.created.map(entry => entry.url));
  assert.equal(editor.button('Save'), undefined);
  editor.choose(file('third.png'));
  editor.choose(file('bad.gif', 'image/gif'));
  assert.deepEqual(editor.revoked, editor.created.map(entry => entry.url));
  editor.choose(file('fourth.png'));
  editor.unmount();
  assert.deepEqual(editor.revoked, editor.created.map(entry => entry.url));
  assert.equal(editor.requests.length, 0);
});

test('cover editor labels and saves a cover without requiring an existing profile image', async () => {
  const editor = await editorHarness('cover');
  assert.equal(text(editor.find(node => node.type === 'figcaption')), 'Present Cover Photo');
  editor.choose(file());
  const preview = editor.previewLoaded();
  assert.match(preview.props.className, /object-contain/);
  editor.response({ ok: true, status: 201, json: async () => ({
    photo: { id: 2, url: '/cover.png' }, profile_image_url: null, cover_photo_url: '/cover.png',
  }) });
  await editor.save();
  assert.equal(editor.requests[0].options.body.fields.get('purpose'), 'cover');
  assert.equal(editor.updates[0].profile_image_url, null);
  assert.equal(editor.saved.length, 1);
  editor.unmount();
});

test('global auth photo listener applies matching null resets and preserves roles', async () => {
  const callbacks = new Map();
  let registrations = 0;
  const auth = await moduleFrom(authSource, {
    react: { useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot() },
    '../lib/profile-photo-events': { PROFILE_PHOTOS_CHANGED_EVENT: 'uhub:profile-photos-changed' },
  }, {
    window: { addEventListener(name, callback) { registrations++; callbacks.set(name, callback); } },
    fetch: () => new Promise(() => {}),
  });
  auth.useAuth().login({
    id: 7, username: 'photo-test', profile_image_url: '/old.png', cover_photo_url: '/old-cover.png',
    is_high_high_high_admin: 1, is_high_high_admin: 1, is_high_admin: 1,
  });
  const dispatch = detail => callbacks.get('uhub:profile-photos-changed')({ detail });
  dispatch({ userId: 8, profile_image_url: null, cover_photo_url: null });
  assert.equal(auth.useAuth().user.profile_image_url, '/old.png');
  dispatch({ userId: 7, profile_image_url: '/new.png', cover_photo_url: '/new-cover.png' });
  assert.equal(auth.useAuth().user.profile_image_url, '/new.png');
  dispatch({ userId: 7, profile_image_url: null, cover_photo_url: null });
  let user = auth.useAuth().user;
  assert.equal(user.profile_image_url, null);
  assert.equal(user.cover_photo_url, null);
  assert.equal(user.username, 'photo-test');
  assert.equal(user.is_high_high_high_admin, 1);
  assert.equal(user.is_high_high_admin, 1);
  assert.equal(user.is_high_admin, 1);
  auth.updateAuthUser({ cover_photo_url: '/partial.png' });
  dispatch({ userId: 7 });
  user = auth.useAuth().user;
  assert.equal(user.profile_image_url, null);
  assert.equal(user.cover_photo_url, '/partial.png');
  assert.equal(registrations, 1);
  auth.useAuth().login(null);
  dispatch({ userId: 7, profile_image_url: '/ignored.png' });
  assert.equal(auth.useAuth().user, null);
});
