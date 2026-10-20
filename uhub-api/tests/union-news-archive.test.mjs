import { test } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { initializeUnionNewsArchive, addUnionNewsImage } from '../dist/server/union-news-archive.js';

function fixture(t) {
  const directory = mkdtempSync(path.join(tmpdir(), 'union-news-archive-'));
  let db = new Database(path.join(directory, 'database.sqlite'));
  db.exec(`
    CREATE TABLE MainHubUpgradeV001ForBroadcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT NOT NULL,
      image_url TEXT, click_url TEXT, description TEXT, display_order INTEGER DEFAULT 0, created_at TEXT
    );
    CREATE TABLE episodes (id INTEGER PRIMARY KEY, broadcast_id INTEGER REFERENCES MainHubUpgradeV001ForBroadcasts(id));
  `);
  t.after(() => { db.close(); rmSync(directory, { recursive: true, force: true }); });
  const active = () => db.prepare(`SELECT id FROM MainHubUpgradeV001ForBroadcasts WHERE id NOT IN
    (SELECT image_id FROM ArchiveImagesForUnionNews14) ORDER BY display_order DESC, id DESC`).all().map(row => row.id);
  const add = index => addUnionNewsImage(db, {
    userId: 1, title: `Image ${index}`, imageUrl: `/data/broadcast-images/${index}.jpg`,
    clickUrl: `https://example.com/${index}`, description: `Caption ${index}`,
  });
  return { get db() { return db; }, active, add, reopen() { db.close(); db = new Database(path.join(directory, 'database.sqlite')); } };
}

test('366 images fill 183 pages; uploads 367/368 archive overflow with metadata and references intact across restarts', t => {
  const f = fixture(t);
  initializeUnionNewsArchive(f.db);
  for (let id = 1; id <= 366; id++) f.add(id);
  assert.equal(f.active().length, 366);
  assert.deepEqual(f.active().slice(-2), [2, 1]);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS count FROM ArchiveImagesForUnionNews14').get().count, 0);
  f.db.prepare('INSERT INTO episodes VALUES (1, 1)').run();
  const original = f.db.prepare('SELECT * FROM MainHubUpgradeV001ForBroadcasts WHERE id = 1').get();
  f.add(367);
  assert.deepEqual(f.active().slice(0, 2), [367, 366]);
  assert.deepEqual(f.active().slice(-2), [3, 2]);
  assert.equal(f.active().length, 366);
  assert.deepEqual(f.db.prepare('SELECT image_id FROM ArchiveImagesForUnionNews14').all(), [{ image_id: 1 }]);
  f.add(368);
  assert.deepEqual(f.active().slice(-2), [4, 3]);
  assert.deepEqual(f.db.prepare('SELECT image_id FROM ArchiveImagesForUnionNews14 ORDER BY image_id').all(), [{ image_id: 1 }, { image_id: 2 }]);
  assert.deepEqual(f.db.prepare('SELECT * FROM MainHubUpgradeV001ForBroadcasts WHERE id = 1').get(), original);
  assert.equal(f.db.prepare('PRAGMA foreign_key_check').all().length, 0);
  assert.ok(f.db.prepare('SELECT archived_at FROM ArchiveImagesForUnionNews14 WHERE image_id=1').get().archived_at);
  f.reopen();
  initializeUnionNewsArchive(f.db);
  initializeUnionNewsArchive(f.db);
  assert.equal(f.active().length, 366);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS count FROM ArchiveImagesForUnionNews14').get().count, 2);
  assert.deepEqual(f.db.prepare('SELECT * FROM MainHubUpgradeV001ForBroadcasts WHERE id = 1').get(), original);
});

test('existing overflow is archived deterministically and an insert/archive failure rolls back the upload record', t => {
  const f = fixture(t);
  const insert = f.db.prepare('INSERT INTO MainHubUpgradeV001ForBroadcasts (id, name, display_order) VALUES (?, ?, 0)');
  f.db.transaction(() => { for (let id = 1; id <= 370; id++) insert.run(id, `Legacy ${id}`); })();
  initializeUnionNewsArchive(f.db);
  assert.equal(f.active().length, 366);
  assert.deepEqual(f.active().slice(0, 2), [370, 369]);
  assert.deepEqual(f.active().slice(-2), [6, 5]);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS count FROM ArchiveImagesForUnionNews14').get().count, 4);
  f.db.exec(`CREATE TRIGGER fail_archive BEFORE INSERT ON ArchiveImagesForUnionNews14 BEGIN SELECT RAISE(ABORT, 'archive test failure'); END`);
  assert.throws(() => f.add(371), /archive test failure/);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS count FROM MainHubUpgradeV001ForBroadcasts').get().count, 370);
  assert.equal(f.active().length, 366);
});
