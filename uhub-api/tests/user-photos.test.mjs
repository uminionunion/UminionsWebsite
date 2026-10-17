import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';

const directory = await mkdtemp(path.join(os.tmpdir(), 'user-photo-tests-'));
process.env.DATA_DIRECTORY = directory;
process.env.FFMPEG_PATH = ffmpeg;
const main = new Database(path.join(directory, 'database.sqlite'));
main.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, profile_image_url TEXT, cover_photo_url TEXT)');
main.prepare('INSERT INTO users(id,username,profile_image_url) VALUES (?,?,?)').run(1, 'photo-owner', '/data/profile-images/legacy.jpg');
main.prepare('INSERT INTO users(id,username) VALUES (?,?)').run(2, 'other-user');
await mkdir(path.join(directory, 'profile-images'));
const png = await sharp({ create: { width: 24, height: 12, channels: 4, background: '#3498db' } }).png().withMetadata().toBuffer();
await writeFile(path.join(directory, 'profile-images', 'legacy.jpg'), png);
const { default: router } = await import('../dist/server/user-photos.js');
const { photosSqlite, photoSelection } = await import('../dist/server/user-photos-db.js');
const { sanitizeUploadedMedia } = await import('../dist/server/media-sanitizer.js');
const { validateInput, sanitizeRichText, validateRequestInput } = await import('../dist/server/input-validation.js');

test('profile/cover/library: real sanitized upload, ownership, captions, limits, deletion and defaults', async () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(validateRequestInput);
  app.use(router);
  app.use('/api/uploads', express.static(path.join(directory, 'uploads')));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = (id = 1) => ({ Cookie: `token=${jwt.sign({ userId: id, username: id === 1 ? 'photo-owner' : 'other-user' }, process.env.JWT_SECRET || 'your-super-secret-key')}` });
  const upload = async (purpose, media = png, name = 'image.png', id = 1) => {
    const form = new FormData();
    form.append('media', new Blob([media]), name);
    form.append('purpose', purpose);
    return fetch(`${base}/api/user-photos`, { method: 'POST', headers: headers(id), body: form });
  };
  try {
    let response = await fetch(`${base}/api/user-photos/1`);
    assert.equal(response.status, 200);
    const legacy = await response.json();
    assert.equal(legacy.photos.length, 1);
    assert.equal(legacy.profile_image_url, '/data/profile-images/legacy.jpg');
    response = await upload('profile');
    assert.equal(response.status, 201);
    const saved = await response.json();
    assert.equal(main.prepare('SELECT profile_image_url FROM users WHERE id = 1').get().profile_image_url, saved.photo.url);
    assert.equal(photoSelection(1).profile_image_url, saved.photo.url);
    assert.equal(photosSqlite.prepare('SELECT count(*) AS n FROM photos').get().n, 2);
    assert.equal(main.prepare("SELECT count(*) AS n FROM sqlite_master WHERE name = 'photos'").get().n, 0);
    const stored = await sharp(path.join(directory, 'uploads', 'user-photos', path.basename(saved.photo.url))).metadata();
    assert.equal(stored.width, 24);
    assert.equal(stored.height, 12);
    assert.equal(stored.exif, undefined);
    response = await fetch(`${base}/api/user-photos/image/${saved.photo.id}/thumbnail`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.ok((await response.arrayBuffer()).byteLength > 0);
    response = await upload('cover');
    assert.equal(response.status, 201);
    const cover = await response.json();
    assert.equal(main.prepare('SELECT cover_photo_url FROM users WHERE id = 1').get().cover_photo_url, cover.photo.url);
    response = await fetch(`${base}/api/user-photos/${saved.photo.id}`, {
      method: 'PUT', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: 'x'.repeat(1000) }),
    });
    assert.equal(response.status, 200);
    response = await fetch(`${base}/api/user-photos/${saved.photo.id}`, {
      method: 'PUT', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: 'x'.repeat(1001) }),
    });
    assert.equal(response.status, 400);
    const injection = "'; DROP TABLE users; -- <script>alert(1)</script>";
    response = await fetch(`${base}/api/user-photos/${saved.photo.id}`, {
      method: 'PUT', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: injection }),
    });
    assert.equal(response.status, 200);
    assert.equal(main.prepare('SELECT count(*) AS n FROM users').get().n, 2);
    assert.equal(photosSqlite.prepare('SELECT caption FROM photos WHERE id = ?').get(saved.photo.id).caption, injection);
    for (const method of ['PUT', 'DELETE']) {
      response = await fetch(`${base}/api/user-photos/${saved.photo.id}`, {
        method, headers: { ...headers(2), 'Content-Type': 'application/json' }, body: method === 'PUT' ? '{"caption":"not mine"}' : undefined,
      });
      assert.equal(response.status, 404);
    }
    assert.equal((await upload('library', Buffer.from('<script>malicious</script>'), 'fake.png')).status, 400);
    assert.equal((await upload('library', png, 'fake.gif')).status, 400);
    const createRoute = router.stack.find(layer => layer.route?.path === '/api/user-photos' && layer.route.methods.post).route.stack.at(-1).handle;
    const boundary = async size => {
      const tempFilePath = path.join(directory, `photo-boundary-${size}`);
      await writeFile(tempFilePath, png);
      const result = {};
      await createRoute({
        user: { userId: 2 }, body: { purpose: 'library' },
        memeUploads: [{ name: 'boundary.png', size, tempFilePath }],
      }, {
        status(value) { result.status = value; return this; },
        json(value) { result.body = value; return this; },
      });
      return result;
    };
    const exactBoundary = await boundary(25 * 1024 ** 3);
    assert.equal(exactBoundary.status, 201);
    assert.equal((await boundary(25 * 1024 ** 3 + 1)).status, 413);
    assert.equal((await fetch(`${base}/api/user-photos/${exactBoundary.body.photo.id}`, { method: 'DELETE', headers: headers(2) })).status, 200);
    const before = (await readdir(path.join(directory, 'uploads', 'user-photos'))).sort();
    const insert = photosSqlite.prepare('INSERT INTO photos(user_id,url,purpose) VALUES (?,?,?)');
    const count = photosSqlite.prepare('SELECT count(*) AS n FROM photos WHERE user_id=1').get().n;
    photosSqlite.transaction(() => { for (let i = count; i < 100; i++) insert.run(1, `/test/${i}`, 'library'); })();
    assert.equal((await upload('library')).status, 409);
    assert.deepEqual((await readdir(path.join(directory, 'uploads', 'user-photos'))).sort(), before);
    photosSqlite.prepare("DELETE FROM photos WHERE url LIKE '/test/%'").run();
    const records = photosSqlite.prepare('SELECT id FROM photos WHERE user_id = 1').all();
    for (const record of records) assert.equal((await fetch(`${base}/api/user-photos/${record.id}`, { method: 'DELETE', headers: headers() })).status, 200);
    assert.deepEqual(photoSelection(1), { profile_image_url: null, cover_photo_url: null });
    assert.deepEqual(main.prepare('SELECT profile_image_url, cover_photo_url FROM users WHERE id=1').get(), photoSelection(1));
    assert.equal((await fetch(`${base}${saved.photo.url}`)).status, 404);
    const restartEntry = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'server', 'user-photos-db.js')).href;
    const restart = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', `const {photosSqlite}=await import(${JSON.stringify(restartEntry)}); console.log(photosSqlite.prepare('SELECT count(*) AS n FROM photos').get().n); photosSqlite.close();`], { env: { ...process.env, DATA_DIRECTORY: directory } });
    assert.equal(restart.stdout.trim(), '0');
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('media content inspection, stripped metadata, animated GIF and MP4 stream remux', async () => {
  const original = path.join(directory, 'source.png');
  await writeFile(original, png);
  const safe = await sanitizeUploadedMedia(original, '.png');
  const metadata = await sharp(safe).metadata();
  assert.equal(metadata.width, 24);
  assert.equal(metadata.height, 12);
  assert.equal(metadata.exif, undefined);
  await assert.rejects(() => sanitizeUploadedMedia(original, '.jpg'), /contents do not match/);
  const animation = path.join(directory, 'animated.gif');
  const frames = Buffer.alloc(12 * 24 * 3);
  for (let pixel = 0; pixel < 12 * 24; pixel++) frames[pixel * 3 + (pixel < 12 * 12 ? 0 : 2)] = 255;
  await sharp(frames, { raw: { width: 12, height: 24, channels: 3, pageHeight: 12 } }).gif({ delay: [100, 200], loop: 0 }).toFile(animation);
  const safeAnimation = await sanitizeUploadedMedia(animation, '.gif');
  assert.equal((await sharp(safeAnimation, { animated: true }).metadata()).pages, 2);
  const mp4 = path.join(directory, 'video.mp4');
  await promisify(execFile)(ffmpeg, ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=32x24:d=0.2', '-metadata', 'title=Private metadata', '-y', mp4]);
  const safeMp4 = await sanitizeUploadedMedia(mp4, '.mp4');
  assert.ok((await readFile(safeMp4)).length > 0);
  const info = await new Promise(resolve => {
    const child = execFile(ffmpeg, ['-hide_banner', '-i', safeMp4], (_error, _stdout, stderr) => resolve(stderr));
    child.on('error', () => {});
  });
  assert.ok(!info.includes('Private metadata'));
  await assert.rejects(() => sanitizeUploadedMedia(original, '.mp4'), /not an MP4/);
});

test('plain text stays parameterized and rich HTML strips executable content', () => {
  assert.equal(validateInput({ content: "'; DROP TABLE users;--", caption: '<script>x</script>' }), true);
  assert.equal(validateInput({ content: { $ne: null } }), false);
  assert.equal(validateInput(JSON.parse('{"__proto__":{"admin":true}}')), false);
  assert.equal(validateInput({ content: 'bad\0input' }), false);
  const safe = sanitizeRichText('<h1 style="text-align:center">Title</h1><script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(1)"><a href="&#106;avascript:alert(1)">click</a><p>Safe</p>');
  assert.ok(safe.includes('<h1'));
  assert.ok(safe.includes('<p>Safe</p>'));
  assert.ok(!/script|onerror|javascript/i.test(safe));
});

test.after(async () => {
  photosSqlite.close();
  main.close();
  await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
});
