import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import net from 'node:net';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';

test('startup migrations and the six reported failing API routes work against the shipped schema', { timeout: 60000 }, async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const directory = await mkdtemp(path.join(os.tmpdir(), 'uhub-startup-test-'));
  const fixture = new Database(path.join(directory, 'database.sqlite'));
  const seed = new Database(path.join(root, 'seed', 'database.sqlite'), { readonly: true });
  let child;
  let output = '';
  let errors = '';
  try {
    // Copy schema only: no shipped account records, passwords, messages or other private data.
    const schema = seed.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL").all();
    schema.forEach(row => fixture.exec(row.sql));
    seed.close();
    fixture.prepare('INSERT INTO users(id,username,password,profile_image_url,cover_photo_url) VALUES (?,?,?,?,?)').run(4, 'startup-test-user', 'not-a-real-password', '/data/profile-images/profile-4-123.jpg', '/api/uploads/user-photos/fixture-cover.png');
    fixture.prepare('INSERT INTO users(id,username,password) VALUES (?,?,?)').run(5, 'startup-test-friend', 'not-a-real-password');
    fixture.prepare('INSERT INTO friends(user_id1,user_id2,status) VALUES (?,?,?)').run(4, 5, 'accepted');
    fixture.prepare('INSERT INTO MainHubUpgradeV001ForProducts(name,store_type,user_id) VALUES (?,?,?)').run('Fixture product', 'main', 4);
    fixture.close();
    const env = { ...process.env, DATA_DIRECTORY: directory, NODE_ENV: 'test', JWT_SECRET: 'startup-regression-fixture-secret' };
    await promisify(execFile)(process.execPath, ['scripts/init-data.cjs'], { cwd: root, env });
    await promisify(execFile)(process.execPath, ['scripts/init-data.cjs'], { cwd: root, env });
    const migrated = new Database(path.join(directory, 'database.sqlite'));
    assert.equal(migrated.prepare('SELECT count(*) AS n FROM MainHubUpgradeV001ForProducts').get().n, 1);
    assert.equal(migrated.prepare('SELECT store_id FROM MainHubUpgradeV001ForProducts').get().store_id, 0);
    migrated.prepare('UPDATE users SET is_high_high_high_admin=1 WHERE id=4').run();
    const insertImage = migrated.prepare(`INSERT INTO MainHubUpgradeV001ForBroadcasts
      (id, user_id, name, image_url, display_order) VALUES (?, 4, ?, '/data/broadcast-images/archive-fixture.png', ?)`);
    migrated.transaction(() => {
      for (let id = 1; id <= 368; id++) insertImage.run(id, `Archive fixture ${id}`, id);
    })();
    migrated.close();
    await mkdir(path.join(directory, 'broadcast-images'));
    await writeFile(path.join(directory, 'broadcast-images', 'archive-fixture.png'), 'archived-media-fixture');
    const probe = net.createServer();
    await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
    const port = probe.address().port;
    await new Promise(resolve => probe.close(resolve));
    const entry = pathToFileURL(path.join(root, 'dist', 'server', 'index.js')).href;
    child = spawn(process.execPath, ['--input-type=module', '-e', `const {startServer}=await import(${JSON.stringify(entry)}); await startServer(${port});`], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stderr.on('data', chunk => { errors = (errors + chunk.toString()).slice(-16000); });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Fixture API startup timed out: ${errors}`)), 15000);
      child.stdout.on('data', chunk => {
        output = (output + chunk.toString()).slice(-8000);
        if (output.includes('API Server running')) { clearTimeout(timer); resolve(); }
      });
      child.once('exit', code => { clearTimeout(timer); reject(new Error(`Fixture API exited ${code}: ${errors}`)); });
    });
    const token = jwt.sign({ userId: 4, username: 'startup-test-user' }, env.JWT_SECRET);
    const failures = [];
    for (const endpoint of [
      '/api/products/store/0',
      '/api/broadcasts/union-news-14/images',
      '/api/products/friends/stores/all',
      '/api/chat/unread-status',
      '/api/products/everything/all',
      '/api/products/user/4/stores',
      '/api/user-photos/4',
      '/api/memes/posts/by-user/4',
      '/api/auth/me',
    ]) {
      const response = await fetch(`http://127.0.0.1:${port}${endpoint}`, { headers: { Cookie: `token=${token}` } });
      const body = await response.text();
      if (response.status !== 200) failures.push(`${endpoint}: HTTP ${response.status} ${body}`);
      if (endpoint === '/api/auth/me' && response.ok) {
        const account = JSON.parse(body);
        assert.equal(account.profile_image_url, '/data/profile-images/profile-4-123.jpg');
        assert.equal(account.cover_photo_url, '/api/uploads/user-photos/fixture-cover.png');
        assert.equal(response.headers.get('cache-control'), 'no-store');
      }
    }
    assert.deepEqual(failures, [], `${failures.join('\n')}\n${errors}`);
    const base = `http://127.0.0.1:${port}`;
    const gallery = await (await fetch(`${base}/api/broadcasts/union-news-14/images`)).json();
    assert.equal(gallery.length, 366);
    assert.deepEqual(gallery.slice(0, 2).map(image => image.id), [368, 367]);
    assert.deepEqual(gallery.slice(-2).map(image => image.id), [4, 3]);
    const stored = new Database(path.join(directory, 'database.sqlite'), { readonly: true });
    try {
      assert.deepEqual(stored.prepare('SELECT image_id FROM ArchiveImagesForUnionNews14 ORDER BY image_id').all(), [{ image_id: 1 }, { image_id: 2 }]);
      assert.equal(stored.prepare('SELECT COUNT(*) AS count FROM MainHubUpgradeV001ForBroadcasts').get().count, 368);
    } finally { stored.close(); }
    const archivedMove = await fetch(`${base}/api/broadcasts/union-news-14/images/1/move-left`, {
      method: 'POST', headers: { Cookie: `token=${token}` },
    });
    assert.equal(archivedMove.status, 404);
    const lastMove = await fetch(`${base}/api/broadcasts/union-news-14/images/3/move-right`, {
      method: 'POST', headers: { Cookie: `token=${token}` },
    });
    assert.equal(lastMove.status, 400, 'Last active image cannot swap into the archive');
    assert.equal(await readFile(path.join(directory, 'broadcast-images', 'archive-fixture.png'), 'utf8'), 'archived-media-fixture');
  } finally {
    if (child && child.exitCode === null) {
      child.kill();
      await new Promise(resolve => child.once('exit', resolve));
    }
    if (fixture.open) fixture.close();
    if (seed.open) seed.close();
    await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
