import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const sourceDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'includes', 'uhub', 'src', 'features', 'profile');

test('library fetches only when mounted; closing aborts requests and revokes thumbnail URLs', async () => {
  const source = await readFile(path.join(sourceDirectory, 'UserPhotoLibrary.tsx'), 'utf8');
  const parent = await readFile(path.join(sourceDirectory, 'MainUhubFeatureV001ForUserProfileModal.tsx'), 'utf8');
  assert.match(parent, /\{isOpen && <UserPhotoLibrary/);
  assert.match(parent, /h-1\/2 min-h-0 p-4 overflow-y-auto border-b/);
  assert.match(parent, /h-1\/2 min-h-0 p-4 overflow-y-auto"/);
  assert.ok(!source.includes('preloadQueuedImage'));
  const effects = [];
  const calls = [];
  const revoked = [];
  const stateChanges = [];
  const listeners = new Set();
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    Fragment: 'fragment',
    useState: value => [value, next => stateChanges.push(next)],
    useRef: value => ({ current: value }),
    useEffect: callback => effects.push(callback),
  };
  const context = vm.createContext({
    console, AbortController, Blob, FormData,
    window: { addEventListener: (_event, callback) => listeners.add(callback), removeEventListener: (_event, callback) => listeners.delete(callback) },
    URL: { createObjectURL: () => 'blob:library-preview', revokeObjectURL: value => revoked.push(value) },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return url.includes('/thumbnail')
        ? { ok: true, blob: async () => new Blob(['thumbnail']) }
        : { ok: true, json: async () => ({ photos: [{ id: 5, url: '/api/uploads/user-photos/test.png', caption: 'Caption', purpose: 'library' }], profile_image_url: null, cover_photo_url: null }) };
    },
  });
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = new vm.SourceTextModule(compiled, { context });
  await module.link(async specifier => {
    const exports = specifier === 'react' ? { default: react, ...react }
      : specifier === 'lucide-react' ? { Loader2: 'spinner', Plus: 'plus', X: 'close' } : { Button: 'button' };
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  assert.equal(calls.length, 0);
  module.namespace.default({ userId: 42, ownProfile: true, editMode: false, onSelection: () => {} });
  const cleanups = effects.map(effect => effect());
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, '/api/user-photos/42');
  assert.equal(calls[0].options.cache, 'no-store');
  assert.ok(calls[1].url.endsWith('/5/thumbnail'));
  assert.ok(stateChanges.includes(false));
  cleanups.reverse().forEach(cleanup => cleanup?.());
  assert.ok(calls.every(call => call.options.signal.aborted));
  assert.deepEqual(revoked, ['blob:library-preview']);
  assert.equal(listeners.size, 0);
});
