import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import http from 'node:http';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const serverSource = path.join(root, 'uhub-api', 'server');
const memeSource = path.join(root, 'includes', 'uhub', 'src', 'features', 'profile', 'TheMemeBoxImplementation001.jsx');
const compile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;

async function moduleFrom(source, imports, globals = {}) {
  const context = vm.createContext({ console, process, Buffer, queueMicrotask, ...globals });
  const module = new vm.SourceTextModule(compile(source), { context });
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

test('multipart media persists URLs, enforces limits, rolls back, serves ranges and cleans files', async () => {
  const directory = await mkdtemp(path.join(root, 'uhub-api', '.meme-media-test-'));
  const previousDirectory = process.env.DATA_DIRECTORY;
  process.env.DATA_DIRECTORY = directory;
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  sqlite.exec(`
    CREATE TABLE MemeImplementation001Posts (
      id INTEGER PRIMARY KEY, user_id INTEGER, title TEXT, description TEXT, upvotes INTEGER, downvotes INTEGER
    );
    CREATE TABLE MemeImplementation001Images (
      id INTEGER PRIMARY KEY, post_id INTEGER REFERENCES MemeImplementation001Posts(id) ON DELETE CASCADE,
      image_url TEXT, title TEXT, description TEXT, display_order INTEGER
    );
  `);
  const db = new Kysely({ dialect: new SqliteDialect({ database: sqlite }) });
  const temporaryDirectories = async () => (await readdir(directory)).filter(name => name.startsWith('uhub-meme-'));
  const initialTemporary = new Set(await temporaryDirectories());
  let server;
  try {
    const upload = await moduleFrom(await readFile(path.join(serverSource, 'meme-upload.ts'), 'utf8'), {
      busboy: await import('busboy'),
      fs: await import('node:fs'), os: { default: { tmpdir: () => directory } }, path: await import('node:path'),
      stream: await import('node:stream'), 'stream/promises': await import('node:stream/promises'),
      './input-validation.js': { validateInput: () => true },
    });
    assert.equal(upload.MAX_MEME_FILE_SIZE, 50 * 1024 ** 3);
    assert.equal(upload.MAX_MEME_FILES, 10);
    const auth = await moduleFrom(await readFile(path.join(serverSource, 'auth-middleware.ts'), 'utf8'), {
      jsonwebtoken: await import('jsonwebtoken'),
    });
    const { default: router } = await moduleFrom(await readFile(path.join(serverSource, 'memes.ts'), 'utf8'), {
      express: await import('express'), './meme-db.js': { memeDb: db }, kysely: await import('kysely'),
      jsonwebtoken: await import('jsonwebtoken'), './auth-middleware.js': auth,
      fs: await import('node:fs'), path: await import('node:path'), crypto: await import('node:crypto'),
      './meme-upload.js': upload,
      './media-sanitizer.js': {
        InvalidMediaError: class extends Error {},
        sanitizeUploadedMedia: async source => source,
      },
      './input-validation.js': { validateInput: () => true },
    });
    const app = express();
    app.use(cookieParser());
    app.use(router);
    app.use('/api/uploads', express.static(path.join(directory, 'uploads')));
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const token = jwt.sign({ userId: 1, username: 'media-test' }, process.env.JWT_SECRET || 'your-super-secret-key');
    const headers = { Cookie: `token=${token}` };
    const send = async (names, extra = {}) => {
      const form = new FormData();
      form.append('title', 'Test meme');
      form.append('description', 'Media test');
      names.forEach(name => form.append('media', new Blob(['test-media-bytes']), name));
      return fetch(`${base}/api/memes/posts`, { method: 'POST', body: form, headers, ...extra });
    };
    assert.equal((await send(['test.mp4'], { headers: {} })).status, 401);
    assert.equal((await send(['test.txt'])).status, 400);
    assert.equal((await send([])).status, 400);
    assert.equal((await send(Array(11).fill('test.png'))).status, 400);
    const response = await send(['test.MP4', 'test.gif', 'test.jpg', 'test.jpeg', 'test.png', ...Array(5).fill('extra.png')]);
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.equal(result.images.length, 10);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM MemeImplementation001Images').get().n, 10);
    assert.ok(result.images.every(url => /^\/api\/uploads\/memes\/[0-9a-f-]+\.(mp4|gif|jpe?g|png)$/.test(url)));
    const range = await fetch(`${base}${result.images[0]}`, { headers: { Range: 'bytes=0-3' } });
    assert.equal(range.status, 206);
    assert.equal(await range.text(), 'test');
    const route = router.stack.find(layer => layer.route?.path === '/api/memes/posts' && layer.route.methods.post);
    const save = route.route.stack.at(-1).handle;
    const boundary = async size => {
      let status;
      const tempFilePath = path.join(directory, `boundary-${size}`);
      await writeFile(tempFilePath, 'boundary');
      await save({
        user: { userId: 1 }, body: { title: 'Boundary' },
        memeUploads: [{ name: 'boundary.mp4', size, tempFilePath }],
      }, { status(value) { status = value; return this; }, json(value) { return value; } });
      await rm(tempFilePath, { force: true });
      return status;
    };
    assert.equal(await boundary(upload.MAX_MEME_FILE_SIZE), 201);
    assert.equal(await boundary(upload.MAX_MEME_FILE_SIZE + 1), 413);
    const beforeFailure = sqlite.prepare('SELECT COUNT(*) AS n FROM MemeImplementation001Posts').get().n;
    const filesBefore = await readdir(path.join(directory, 'uploads', 'memes'));
    sqlite.exec("CREATE TRIGGER reject_image BEFORE INSERT ON MemeImplementation001Images BEGIN SELECT RAISE(ABORT, 'test failure'); END");
    assert.equal((await send(['failure.mp4'])).status, 500);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM MemeImplementation001Posts').get().n, beforeFailure);
    assert.deepEqual(await readdir(path.join(directory, 'uploads', 'memes')), filesBefore);
    sqlite.exec('DROP TRIGGER reject_image');
    const deletion = await fetch(`${base}/api/memes/posts/${result.id}`, { method: 'DELETE', headers });
    assert.equal(deletion.status, 200);
    assert.equal((await fetch(`${base}${result.images[0]}`)).status, 404);
    const aborting = http.request(`${base}/api/memes/posts`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'multipart/form-data; boundary=aborted-test' },
    });
    aborting.on('error', () => {});
    aborting.write('--aborted-test\r\nContent-Disposition: form-data; name="media"; filename="aborted.mp4"\r\nContent-Type: video/mp4\r\n\r\npartial-file');
    await new Promise(resolve => setTimeout(resolve, 150));
    aborting.destroy();
    await new Promise(resolve => setTimeout(resolve, 300));
    assert.deepEqual((await temporaryDirectories()).filter(name => !initialTemporary.has(name)), []);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await db.destroy();
    if (previousDirectory === undefined) delete process.env.DATA_DIRECTORY;
    else process.env.DATA_DIRECTORY = previousDirectory;
    await rm(directory, { recursive: true, force: true });
  }
});

test('picker accepts only requested formats, 10 entries and inclusive 50 GiB without FileReader', async () => {
  const source = await readFile(memeSource, 'utf8');
  const ast = ts.createSourceFile('memes.jsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
  let initializer;
  const visit = node => {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'handleFileSelect') initializer = node.initializer.getText(ast);
    ts.forEachChild(node, visit);
  };
  visit(ast);
  assert.ok(initializer);
  let selected = [];
  const errors = [];
  const ref = { current: [] };
  const handle = vm.runInNewContext(`(${initializer})`, {
    uploadPreviewsRef: ref, MAX_UPLOAD_IMAGES: 10,
    showToast: message => errors.push(message),
    setUploadedImages: value => { selected = value; },
    URL: { createObjectURL: file => `blob:${file.name}` },
  });
  const select = files => handle({ target: { files, value: 'selection' } });
  select(['mp4', 'gif', 'jpg', 'jpeg', 'png'].map(extension => ({ name: `test.${extension}`, size: 50 * 1024 ** 3 })));
  assert.equal(selected.length, 5);
  select([{ name: 'too-big.mp4', size: 50 * 1024 ** 3 + 1 }]);
  select([{ name: 'test.webm', size: 10 }]);
  select(Array(6).fill({ name: 'test.png', size: 10 }));
  assert.equal(errors.length, 3);
  assert.equal(selected.length, 5);
});

test('site and per-user MemeBox sound stay independent and preferences persist', async () => {
  const source = await readFile(path.join(root, 'includes', 'uhub', 'src', 'lib', 'media-sound.ts'), 'utf8');
  const storage = new Map();
  const sitePlayer = { muted: true, autoplay: true, play: () => Promise.resolve() };
  const memePlayer = { muted: true, autoplay: true, dataset: { memeSoundOwner: '42' }, play: () => Promise.resolve() };
  const create = () => moduleFrom(source, {
    react: { useSyncExternalStore: (_subscribe, snapshot) => snapshot() },
  }, {
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    document: { querySelectorAll: selector => selector === '[data-union-radio-player]' ? [sitePlayer] : [memePlayer] },
  });
  const sound = await create();
  assert.equal(sound.useSiteWideMute().muted, true);
  assert.equal(sound.useMemeMute(42).muted, true);
  sound.useSiteWideMute().toggle();
  assert.equal(sitePlayer.muted, false);
  assert.equal(sound.useMemeMute(42).muted, true);
  sound.useMemeMute(42).setMuted(false);
  sound.useSiteWideMute().toggle();
  assert.equal(sitePlayer.muted, true);
  assert.equal(memePlayer.muted, false);
  assert.equal(sound.useMemeMute(42).muted, false);
  assert.equal(sound.useMemeMute(43).muted, true);
  const reload = await create();
  assert.equal(reload.useMemeMute(42).muted, false);
  assert.equal(reload.useSiteWideMute().muted, true);
  sound.useMemeMute(42).setMuted(true);
  assert.equal((await create()).useMemeMute(42).muted, true);
});

test('all responsive mute buttons and playback surfaces use the correct independent sound state', async () => {
  const mainSource = await readFile(path.join(root, 'includes', 'uhub', 'src', 'features', 'profile', 'MainUhubFeatureV001ForMyProfileModal.tsx'), 'utf8');
  const source = ts.createSourceFile('hub.tsx', mainSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let buttons = 0;
  let radioMedia = 0;
  let insidePlayer = false;
  const visit = node => {
    const previous = insidePlayer;
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'UnionRadioPlayer') insidePlayer = true;
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(source) === 'SiteWideMuteButton') buttons++;
    if (insidePlayer && ts.isJsxOpeningElement(node) && ['audio', 'video'].includes(node.tagName.getText(source))) {
      const attributes = node.attributes.properties.map(prop => prop.getText(source));
      assert.ok(attributes.includes('muted={muted}'));
      assert.ok(attributes.includes('data-union-radio-player'));
      assert.ok(attributes.includes('onVolumeChange={enforceSiteMute}'));
      radioMedia++;
    }
    ts.forEachChild(node, visit);
    insidePlayer = previous;
  };
  visit(source);
  assert.equal(buttons, 3);
  assert.equal(radioMedia, 6);
  const memes = await readFile(memeSource, 'utf8');
  assert.equal((memes.match(/data-meme-sound-owner=\{memeSoundOwner\}/g) || []).length, 3);
  assert.equal((memes.match(/aria-label=\{memeMuted \? "Unmute MemeBox" : "Mute MemeBox"\}/g) || []).length, 3);
});
