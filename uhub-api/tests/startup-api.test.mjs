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

test('startup migrations, banner associations and existing API routes work against the shipped schema', { timeout: 90000 }, async () => {
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
    const defaults = new Database(path.join(directory, 'database.sqlite'));
    const covers = defaults.prepare("SELECT * FROM UhubManagedCarouselItems WHERE slot='cover' ORDER BY display_order").all();
    assert.deepEqual(covers.map(item => [item.image_url, item.button_number]), [
      ['/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg', null],
      ['/uhub/dist/food-clothing-pantry-banner.jpg', 5],
    ]);
    assert.equal(defaults.prepare("SELECT button_number FROM UhubManagedCarouselItems WHERE image_url='/uhub/dist/umimatch-banner.jpg'").get().button_number, 3);
    // Simulate the pre-upgrade table while retaining unrelated admin entries.
    defaults.prepare("DELETE FROM UhubCarouselDefaultsImported WHERE slot='banner-button-links-v1'").run();
    defaults.prepare("DELETE FROM UhubManagedCarouselItems WHERE image_url='/uhub/dist/food-clothing-pantry-banner.jpg'").run();
    defaults.prepare("UPDATE UhubManagedCarouselItems SET image_url='/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' WHERE image_url='/uhub/dist/umimatch-banner.jpg'").run();
    defaults.prepare("INSERT INTO UhubManagedCarouselItems(slot,image_url,title,display_order) VALUES ('cover','/custom-banner.jpg','Keep me',1)").run();
    defaults.exec('ALTER TABLE UhubManagedCarouselItems DROP COLUMN button_number');
    defaults.close();
    await promisify(execFile)(process.execPath, ['scripts/init-data.cjs'], { cwd: root, env });
    const migrated = new Database(path.join(directory, 'database.sqlite'));
    const selectBanners = "SELECT * FROM UhubManagedCarouselItems WHERE slot IN ('cover','bottom') ORDER BY slot,display_order";
    const bannerSnapshot = migrated.prepare(selectBanners).all();
    assert.deepEqual(bannerSnapshot.filter(item => item.slot === 'cover').map(item => [item.image_url, item.button_number]), [
      ['/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg', null],
      ['/uhub/dist/food-clothing-pantry-banner.jpg', 5],
      ['/custom-banner.jpg', null],
    ]);
    await promisify(execFile)(process.execPath, ['scripts/init-data.cjs'], { cwd: root, env });
    assert.deepEqual(migrated.prepare(selectBanners).all(), bannerSnapshot, 'Repeated startup retains IDs, edits and ordering');
    migrated.prepare("DELETE FROM UhubManagedCarouselItems WHERE image_url='/uhub/dist/food-clothing-pantry-banner.jpg'").run();
    await promisify(execFile)(process.execPath, ['scripts/init-data.cjs'], { cwd: root, env });
    assert.equal(migrated.prepare("SELECT count(*) AS n FROM UhubManagedCarouselItems WHERE image_url='/uhub/dist/food-clothing-pantry-banner.jpg'").get().n, 0, 'Intentionally removed ads stay removed');
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
      const timer = setTimeout(() => reject(new Error(`Fixture API startup timed out: ${output}\n${errors}`)), 45000);
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
    const getItems = async slot => (await (await fetch(`${base}/api/carousels/${slot}/items`)).json()).items;
    const replace = (slot, items, cookie = `token=${token}`, upload) => {
      const body = new FormData();
      body.append('items', JSON.stringify(items));
      if (upload) body.append('images', new Blob([Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')], { type: 'image/gif' }), 'banner.gif');
      return fetch(`${base}/api/carousels/${slot}/items/replace`, { method: 'POST', headers: cookie ? { Cookie: cookie } : {}, body });
    };
    const original = await getItems('cover');
    assert.equal((await replace('cover', original, '')).status, 401);
    const memberToken = jwt.sign({ userId: 5, username: 'startup-test-friend' }, env.JWT_SECRET);
    assert.equal((await replace('cover', original, `token=${memberToken}`)).status, 403);
    for (const invalid of [0, -1, 10001, 3.5, '3', true]) {
      assert.equal((await replace('cover', original.map(item => ({ ...item, button_number: invalid })))).status, 400);
    }
    assert.deepEqual(await getItems('cover'), original, 'Invalid choices do not change saved images or associations');
    for (const number of [1, 3, 5, 10000]) {
      assert.equal((await replace('cover', original.map(item => ({ ...item, button_number: number })))).status, 201);
      assert.ok((await getItems('cover')).every(item => item.button_number === number));
    }
    const omitted = original.map(({ button_number, ...item }) => item).reverse();
    assert.equal((await replace('cover', omitted)).status, 201);
    assert.deepEqual((await getItems('cover')).map(item => [item.id, item.button_number]), omitted.map(item => [item.id, 10000]), 'Legacy saves preserve associations and reorder existing IDs');
    assert.equal((await replace('cover', original.map(item => ({ ...item, button_number: null })))).status, 201);
    assert.ok((await getItems('cover')).every(item => item.button_number === null), 'Explicit null unlinks an ad');
    assert.equal((await replace('bottom', [{ uploadIndex: 0, button_number: 3 }], `token=${token}`, true)).status, 201);
    const uploaded = await getItems('bottom');
    assert.equal(uploaded[0].button_number, 3);
    assert.match(uploaded[0].image_url, /^\/api\/uploads\/managed-carousels\/bottom\/.*\.gif$/);
    assert.ok((await readFile(path.join(directory, 'uploads', 'managed-carousels', 'bottom', path.basename(uploaded[0].image_url)))).length > 0);
    assert.equal((await replace('bottom', [{ title: 'Caption only', button_number: 5 }])).status, 400);
    const center = await getItems('center');
    assert.equal((await replace('center', center.map(item => ({ ...item, button_number: 5 })))).status, 400);
    const persisted = new Database(path.join(directory, 'database.sqlite'), { readonly: true });
    assert.equal(persisted.prepare('SELECT button_number FROM UhubManagedCarouselItems WHERE id=?').get(uploaded[0].id).button_number, 3);
    persisted.close();
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
    // 30BKG: uHome-Hub #01-#30 titles and background images.
    const hubButtons = async () => (await (await fetch(`${base}/api/uhome-hub-buttons`)).json()).buttons;
    const saveHub = (buttons, cookie = `token=${token}`, upload) => {
      const body = new FormData();
      body.append('buttons', JSON.stringify(buttons));
      if (upload) body.append('images', new Blob([Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')], { type: 'image/gif' }), 'hub.gif');
      return fetch(`${base}/api/uhome-hub-buttons`, { method: 'POST', headers: cookie ? { Cookie: cookie } : {}, body });
    };
    let hub = await hubButtons();
    assert.equal(hub.length, 30);
    assert.ok(hub.every((button, index) => button.number === index + 1 && button.title === '' && button.image_url === ''));
    assert.equal((await saveHub([{ number: 1, title: 'x' }], '')).status, 401);
    assert.equal((await saveHub([{ number: 1, title: 'x' }], `token=${memberToken}`)).status, 403);
    for (const invalid of [[{ number: 0 }], [{ number: 31 }], [{ number: 1.5 }], [{ number: 2 }, { number: 2 }], [{ number: 3, title: 'x'.repeat(41) }], [{ number: 3, uploadIndex: 0 }]]) {
      assert.equal((await saveHub(invalid)).status, 400, JSON.stringify(invalid));
    }
    assert.equal((await saveHub([{ number: 1, title: '  Union Hall  ' }, { number: 30, title: 'Last', uploadIndex: 0 }], `token=${token}`, true)).status, 200);
    hub = await hubButtons();
    assert.deepEqual([hub[0].title, hub[0].image_url, hub[29].title], ['Union Hall', '', 'Last']);
    assert.match(hub[29].image_url, /^\/api\/uploads\/managed-carousels\/uhome-hub-buttons\/button-30-.*\.gif$/);
    const hubImagePath = path.join(directory, 'uploads', 'managed-carousels', 'uhome-hub-buttons', path.basename(hub[29].image_url));
    assert.ok((await readFile(hubImagePath)).length > 0);
    assert.equal((await getItems('left')).some(item => item.slot === 'uhome-hub-buttons'), false);
    assert.equal((await saveHub([{ number: 30, title: 'Last', removeImage: true }])).status, 200);
    hub = await hubButtons();
    assert.deepEqual([hub[0].title, hub[29].title, hub[29].image_url], ['Union Hall', 'Last', ''], 'Removing an image keeps other buttons and titles');
    await assert.rejects(readFile(hubImagePath), 'Removed background images are deleted from disk');
    // Main Cart: store products and header/footer carousel entries, saved for later, ownership and removal.
    const cartRequest = (route, method = 'GET', body, cookie = `token=${token}`) => fetch(`${base}/api/products/cart${route}`, {
      method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined,
    });
    assert.equal((await cartRequest('', 'GET', undefined, '')).status, 401, 'Logged-out visitors cannot read a cart');
    assert.equal((await cartRequest('/add', 'POST', { product_id: 1 }, '')).status, 401, 'Logged-out visitors cannot add to a cart');
    assert.equal((await cartRequest('/add', 'POST', {})).status, 400);
    assert.equal((await cartRequest('/add', 'POST', { product_id: 999 })).status, 404);
    const cartFixture = new Database(path.join(directory, 'database.sqlite'));
    const carouselId = Number(cartFixture.prepare("INSERT INTO UhubManagedCarouselItems(slot,image_url,title,price,website,display_order) VALUES ('left','/cart-poster.png','Cart poster','$12','https://page001.uminion.com/cart/?add-to-cart=POSTER12',99)").run().lastInsertRowid);
    const bannerId = Number(cartFixture.prepare("INSERT INTO UhubManagedCarouselItems(slot,image_url,display_order) VALUES ('bottom','/banner.png',99)").run().lastInsertRowid);
    const websiteLabelId = Number(cartFixture.prepare("INSERT INTO UhubManagedCarouselItems(slot,image_url,title,price,website,display_order) VALUES ('left','/ukraine.png','Ukraine Poster','u24.gov.ua','https://u24.gov.ua',98)").run().lastInsertRowid);
    cartFixture.prepare("UPDATE MainHubUpgradeV001ForProducts SET price=19.5, sku_id='FIX-1', image_url='/fixture.png' WHERE id=1").run();
    cartFixture.close();
    assert.equal((await cartRequest('/add', 'POST', { carousel_item_id: bannerId })).status, 404, 'Banners are not cart products');
    assert.equal((await cartRequest('/add', 'POST', { carousel_item_id: websiteLabelId })).status, 404, 'Website-link buttons are not cart products');
    assert.equal((await cartRequest('/add', 'POST', { product_id: 1 })).status, 200);
    assert.equal((await cartRequest('/add', 'POST', { product_id: 1 })).status, 200);
    assert.equal((await cartRequest('/add', 'POST', { carousel_item_id: carouselId })).status, 200);
    let cart = await (await cartRequest('')).json();
    assert.equal(cart.saved.length, 0);
    const productEntry = cart.items.find(item => item.product_id === 1);
    const posterEntry = cart.items.find(item => item.carousel_item_id === carouselId);
    assert.deepEqual([productEntry.name, productEntry.price, productEntry.sku, productEntry.seller_name, productEntry.quantity, productEntry.image_url, productEntry.product.id],
      ['Fixture product', '$19.50', 'FIX-1', 'startup-test-user', 2, '/fixture.png', 1]);
    assert.deepEqual([posterEntry.name, posterEntry.price, posterEntry.sku, posterEntry.seller_name, posterEntry.product], ['Cart poster', '$12', 'POSTER12', 'Uminion Union', null]);
    assert.equal((await cartRequest(`/${productEntry.id}`, 'PATCH', { saved_for_later: 'yes' })).status, 400);
    assert.equal((await cartRequest(`/${productEntry.id}`, 'PATCH', { saved_for_later: true })).status, 200);
    cart = await (await cartRequest('')).json();
    assert.deepEqual([cart.items.map(item => item.id), cart.saved.map(item => item.id)], [[posterEntry.id], [productEntry.id]]);
    assert.equal((await cartRequest('/add', 'POST', { product_id: 1 })).status, 200, 'Re-adding moves a saved entry back into the cart');
    cart = await (await cartRequest('')).json();
    assert.deepEqual([cart.items.length, cart.saved.length, cart.items.find(item => item.id === productEntry.id).quantity], [2, 0, 3]);
    const strangerCookie = `token=${jwt.sign({ userId: 5, username: 'startup-test-friend' }, env.JWT_SECRET)}`;
    assert.equal((await cartRequest(`/${posterEntry.id}`, 'DELETE', undefined, strangerCookie)).status, 403);
    assert.equal((await cartRequest(`/${posterEntry.id}`, 'PATCH', { saved_for_later: true }, strangerCookie)).status, 403);
    assert.deepEqual((await (await cartRequest('', 'GET', undefined, strangerCookie)).json()), { items: [], saved: [] });
    assert.equal((await cartRequest(`/${posterEntry.id}`, 'DELETE')).status, 200);
    cart = await (await cartRequest('')).json();
    assert.deepEqual(cart.items.map(item => item.id), [productEntry.id]);
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
