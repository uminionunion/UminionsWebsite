import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import { migrate } from '../scripts/migrate-testing01.cjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = promisify(execFile);
const schema = await readFile(new URL('./fixtures/testing01-schema.sql', import.meta.url), 'utf8');
const png = await sharp({ create: { width: 12, height: 12, channels: 3, background: '#3498db' } }).png().toBuffer();
const dataImage = `data:image/png;base64,${png.toString('base64')}`;

async function fixture(directory) {
  await mkdir(directory);
  const db = new Database(path.join(directory, 'database.sqlite'));
  db.exec(schema);
  db.exec(`
    ALTER TABLE users ADD COLUMN is_high_high_high_admin INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN is_high_high_admin INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE MainHubUpgradeV001ForProducts ADD COLUMN legacy_note TEXT;
    CREATE INDEX legacy_product_name ON MainHubUpgradeV001ForProducts(name);
    CREATE TABLE legacy_audit(id INTEGER PRIMARY KEY, value TEXT);
    INSERT INTO legacy_audit VALUES(1,'unchanged');
    CREATE TRIGGER legacy_product_audit AFTER UPDATE OF name ON MainHubUpgradeV001ForProducts
      BEGIN UPDATE legacy_audit SET value=NEW.name WHERE id=1; END;
    CREATE TABLE MemeImplementation001Posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id),
      title TEXT NOT NULL, description TEXT, upvotes INTEGER DEFAULT 0, downvotes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE MemeImplementation001Images (
      id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL REFERENCES MemeImplementation001Posts(id),
      image_url TEXT NOT NULL, title TEXT, description TEXT, display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE MemeImplementation001Comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL REFERENCES MemeImplementation001Posts(id),
      user_id INTEGER, title TEXT, description TEXT, image_url TEXT, upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, is_deleted INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db.prepare(`INSERT INTO users(id,username,password,profile_image_url,cover_photo_url,is_high_high_high_admin)
    VALUES(41,?,?,?,?,1)`).run('legacy-owner', await bcrypt.hash('migration-test-password', 4), '/data/profile-images/profile-41-123.png', '/api/uploads/cover.png');
  db.prepare(`INSERT INTO users(id,username,password,is_high_high_admin) VALUES(42,?,?,1)`)
    .run('regional-owner', await bcrypt.hash('regional-password', 4));
  db.prepare(`INSERT INTO MainHubUpgradeV001ForProducts
    (id,name,price,image_url,store_type,user_id,legacy_note) VALUES(51,'Legacy product',12.5,?,'main',41,'keep extra column')`)
    .run('/api/uploads/product.png');
  db.exec(`
    UPDATE sqlite_sequence SET seq=500 WHERE name='MainHubUpgradeV001ForProducts';
    INSERT INTO friends(user_id1,user_id2,status) VALUES(41,42,'accepted');
    INSERT INTO messages(id,content,room,user_id) VALUES(1,'Keep chat','legacy-room',41);
    INSERT INTO MainHubUpgradeV001ForCartItems(user_id,product_id,quantity) VALUES(41,51,2);
    INSERT INTO MainHubUpgradeV001ForBroadcasts(id,user_id,name) VALUES(61,41,'Legacy broadcast');
    INSERT INTO MainHubUpgradeV001ForEpisodes
      (id,broadcast_id,name,subtitle,description,media_url,cover_image_url,scheduled_at)
      VALUES(71,61,'Legacy episode','Subtitle','Description','/api/uploads/episode.mp4','/data/broadcast-images/cover.png','2030-01-01');
    INSERT INTO MainHubUpgradeV001ForEpisodeImages(episode_id,image_url) VALUES(71,'/api/uploads/product.png');
    INSERT INTO MainHubUpgradeV001ForEpisodeTags(episode_id,tag) VALUES(71,'original-tag');
    INSERT INTO MemeImplementation001Posts(id,user_id,title,upvotes) VALUES(81,41,'Legacy meme',7);
    UPDATE sqlite_sequence SET seq=800 WHERE name='MemeImplementation001Posts';
  `);
  db.prepare('INSERT INTO MemeImplementation001Images(post_id,image_url) VALUES(81,?)').run(dataImage);
  db.prepare('INSERT INTO MemeImplementation001Comments(post_id,user_id,description,image_url) VALUES(81,41,?,?)').run('Legacy comment', dataImage);
  db.close();
  for (const [name, bytes] of [
    ['uploads/product.png', png], ['uploads/cover.png', png], ['uploads/episode.mp4', Buffer.from('legacy-media-bytes')],
    ['profile-images/profile-41-123.png', png], ['broadcast-images/cover.png', png], ['extra/keep.bin', Buffer.from('unknown file')],
  ]) {
    const file = path.join(directory, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, bytes);
  }
}

async function startApi(directory) {
  const entry = pathToFileURL(path.join(root, 'dist', 'server', 'index.js')).href;
  const script = `const {startServer}=await import(${JSON.stringify(entry)}); await startServer(0);`;
  // The server logs the requested port, so discover the actual bound port through a small test-only listener.
  const wrapped = `import net from 'node:net'; const original=net.Server.prototype.listen;
    net.Server.prototype.listen=function(...args){this.once('listening',()=>console.log('TEST_PORT='+this.address().port)); return original.apply(this,args);}; ${script}`;
  const child = spawn(process.execPath, ['--input-type=module', '-e', wrapped], {
    cwd: root, env: { ...process.env, DATA_DIRECTORY: directory, NODE_ENV: 'production', JWT_SECRET: 'migration-fixture-secret', UHUB_REQUIRE_MIGRATION: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let errors = '';
  child.stderr.on('data', chunk => { errors = (errors + chunk).slice(-8000); });
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Migration fixture API timed out: ${errors}`)), 15000);
    let output = '';
    child.stdout.on('data', chunk => {
      output = (output + chunk).slice(-8000);
      const match = /TEST_PORT=(\d+)/.exec(output);
      if (match) { clearTimeout(timer); resolve(Number(match[1])); }
    });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Migration fixture exited ${code}: ${errors}`)); });
  }).catch(async error => {
    child.kill();
    throw error;
  });
  return { base: `http://127.0.0.1:${port}`, child };
}

async function stop(child) {
  if (child.exitCode === null) {
    const exited = new Promise(resolve => child.once('exit', resolve));
    child.kill();
    await exited;
  }
}

test('Testing01 import preserves all records/media and v3 APIs can read, write and restart', { timeout: 90000 }, async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'testing01-import-test-'));
  const source = path.join(directory, 'v2');
  const destination = path.join(directory, 'v3');
  let child;
  try {
    await fixture(source);
    const before = await readFile(path.join(source, 'database.sqlite'));
    const previousGuard = process.env.UHUB_REQUIRE_MIGRATION;
    let report;
    process.env.UHUB_REQUIRE_MIGRATION = '1';
    try {
      report = await migrate(source, destination);
    } finally {
      if (previousGuard === undefined) delete process.env.UHUB_REQUIRE_MIGRATION;
      else process.env.UHUB_REQUIRE_MIGRATION = previousGuard;
    }
    assert.ok(report.verifiedLocalReferences >= 5);
    assert.deepEqual(await readFile(path.join(source, 'database.sqlite')), before);
    assert.deepEqual(await readFile(path.join(destination, 'extra', 'keep.bin')), Buffer.from('unknown file'));
    const db = new Database(path.join(destination, 'database.sqlite'));
    assert.equal(db.prepare('SELECT count(*) n FROM users').get().n, 2);
    assert.equal(db.prepare('SELECT count(*) n FROM MainHubUpgradeV001ForProducts').get().n, 1);
    assert.equal(db.prepare('SELECT legacy_note FROM MainHubUpgradeV001ForProducts WHERE id=51').get().legacy_note, 'keep extra column');
    assert.equal(db.prepare('SELECT value FROM legacy_audit').get().value, 'unchanged');
    assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE name='legacy_product_name'").get());
    assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE name='legacy_product_audit'").get());
    assert.equal(db.prepare('SELECT count(*) n FROM MainHubUpgradeV001ForCartItems').get().n, 1);
    assert.equal(db.prepare('SELECT count(*) n FROM UserBroadcastEpisodes').get().n, 1);
    assert.equal(db.prepare('SELECT tags FROM UserBroadcastEpisodes').get().tags, 'original-tag');
    assert.equal(db.prepare('SELECT subtitle FROM MainHubUpgradeV001ForEpisodes WHERE id=71').get().subtitle, 'Subtitle');
    db.close();
    let api = await startApi(destination);
    child = api.child;
    const headers = { Cookie: `token=${jwt.sign({ userId: 41, username: 'legacy-owner' }, 'migration-fixture-secret')}` };
    const login = await fetch(`${api.base}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'legacy-owner', password: 'migration-test-password' }),
    });

    assert.equal(login.status, 200);
    assert.equal((await login.json()).id, 41);
    const products = await fetch(`${api.base}/api/products/store/0`);
    assert.equal(products.status, 200);
    assert.match(await products.text(), /Legacy product/);
    const broadcasts = await fetch(`${api.base}/api/broadcasts/by-user/41`);
    assert.match(await broadcasts.text(), /Legacy broadcast/);
    const episodes = await fetch(`${api.base}/api/episodes/by-user/41`);
    assert.match(await episodes.text(), /Legacy episode/);
    const photos = await fetch(`${api.base}/api/user-photos/41`);
    const library = await photos.json();
    assert.equal(library.profile_image_url, '/data/profile-images/profile-41-123.png');
    assert.equal(library.cover_photo_url, '/api/uploads/cover.png');
    const memes = await fetch(`${api.base}/api/memes/posts/by-user/41`);
    assert.match(await memes.text(), /data:image\/png;base64/);
    for (const url of ['/api/uploads/product.png', '/api/uploads/cover.png', '/data/profile-images/profile-41-123.png', '/data/broadcast-images/cover.png']) {
      const response = await fetch(api.base + url);
      assert.equal(response.status, 200, url);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), png, url);
    }
    const galleryForm = new FormData();
    galleryForm.set('title', 'New gallery image');
    galleryForm.set('image', new Blob([png], { type: 'image/png' }), 'gallery.png');
    const galleryCreated = await fetch(`${api.base}/api/broadcasts/union-news-14/images/add`, { method: 'POST', headers, body: galleryForm });
    assert.equal(galleryCreated.status, 200, await galleryCreated.clone().text());
    const gallery = await galleryCreated.json();
    assert.deepEqual(Buffer.from(await (await fetch(api.base + gallery.imageUrl)).arrayBuffer()), png);
    const regionalHeaders = { Cookie: `token=${jwt.sign({ userId: 42, username: 'regional-owner' }, 'migration-fixture-secret')}` };
    const productForm = new FormData();
    productForm.set('name', 'New regional product');
    productForm.set('price', '9');
    productForm.set('store_id', '20');
    productForm.set('image', new Blob([png], { type: 'image/png' }), 'new.png');
    const created = await fetch(`${api.base}/api/products`, { method: 'POST', headers: regionalHeaders, body: productForm });
    assert.equal(created.status, 201, await created.clone().text());
    const { productId } = await created.json();
    assert.ok(productId > 500);
    const written = new Database(path.join(destination, 'database.sqlite'), { readonly: true });
    const newProduct = written.prepare('SELECT * FROM MainHubUpgradeV001ForProducts WHERE id=?').get(productId);
    written.close();
    assert.equal(newProduct.store_type, 'store');
    assert.deepEqual(Buffer.from(await (await fetch(api.base + newProduct.image_url)).arrayBuffer()), png);
    const newMeme = new FormData();
    newMeme.set('title', 'New v3 meme');
    newMeme.append('media', new Blob([png], { type: 'image/png' }), 'new.png');
    const memeCreated = await fetch(`${api.base}/api/memes/posts`, { method: 'POST', headers, body: newMeme });
    assert.equal(memeCreated.status, 201, await memeCreated.clone().text());
    await stop(child);
    child = undefined;
    await run(process.execPath, ['scripts/init-data.cjs'], { cwd: root, env: { ...process.env, DATA_DIRECTORY: destination, UHUB_REQUIRE_MIGRATION: '1' } });
    api = await startApi(destination);
    child = api.child;
    assert.match(await (await fetch(`${api.base}/api/products/store/20`)).text(), /New regional product/);
    const afterRestart = new Database(path.join(destination, 'database.sqlite'), { readonly: true });
    assert.equal(afterRestart.prepare('SELECT count(*) n FROM UserBroadcastEpisodes').get().n, 1);
    afterRestart.close();
    await stop(child);
    child = undefined;
    await migrate(source, destination);
    const retained = new Database(path.join(destination, 'database.sqlite'), { readonly: true });
    assert.equal(retained.prepare('SELECT count(*) n FROM MainHubUpgradeV001ForProducts').get().n, 2, 'Rerun must not erase new v3 records');
    retained.close();
  } finally {
    if (child) await stop(child);
    await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});

test('imports committed WAL records and refuses to reimport a changed source snapshot', { timeout: 60000 }, async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'testing01-wal-test-'));
  const source = path.join(directory, 'v2');
  const destination = path.join(directory, 'v3');
  let writer;
  try {
    await fixture(source);
    writer = new Database(path.join(source, 'database.sqlite'));
    writer.pragma('journal_mode = WAL');
    writer.prepare('INSERT INTO legacy_audit(id,value) VALUES(?,?)').run(2, 'committed WAL record');
    await migrate(source, destination);
    const imported = new Database(path.join(destination, 'database.sqlite'), { readonly: true });
    assert.equal(imported.prepare('SELECT value FROM legacy_audit WHERE id=2').get().value, 'committed WAL record');
    imported.close();
    writer.prepare('INSERT INTO legacy_audit(id,value) VALUES(?,?)').run(3, 'later change');
    await assert.rejects(migrate(source, destination), /different source snapshot/);
  } finally {
    if (writer) writer.close();
    await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});

test('import rejects existing destinations, nested sources, missing media and uncompleted cutover mounts', { timeout: 60000 }, async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'testing01-reject-test-'));
  const source = path.join(directory, 'v2');
  const destination = path.join(directory, 'v3');
  try {
    await fixture(source);
    await mkdir(destination);
    await writeFile(path.join(destination, 'keep.txt'), 'beta data');
    await assert.rejects(migrate(source, destination), /refusing to overwrite/);
    assert.equal(await readFile(path.join(destination, 'keep.txt'), 'utf8'), 'beta data');
    await assert.rejects(migrate(source, path.join(source, 'nested')), /non-nested/);
    await rm(path.join(source, 'uploads', 'product.png'));
    const missing = path.join(directory, 'missing-media');
    await assert.rejects(migrate(source, missing), /Missing referenced legacy media/);
    await assert.rejects(stat(missing), { code: 'ENOENT' });
    assert.ok(!(await readdir(directory)).some(name => name.startsWith('.testing01-import-')));
    await assert.rejects(run(process.execPath, ['scripts/init-data.cjs'], {
      cwd: root, env: { ...process.env, DATA_DIRECTORY: destination, UHUB_REQUIRE_MIGRATION: '1' },
    }));
    assert.deepEqual(await readdir(destination), ['keep.txt'], 'Cutover guard must not create or seed an empty database');
  } finally {
    await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
