import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import vm from 'node:vm';
import Database from 'better-sqlite3';
import ts from 'typescript';

const api = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(api, 'server', 'meme-db.ts'), 'utf8');
const canonicalSchema = /const schema = `([\s\S]+?)`;/m.exec(source)[1];
const tables = [
  'MemeImplementation001Posts', 'MemeImplementation001Images', 'MemeImplementation001Comments',
  'MemeImplementation001PostVotes', 'MemeImplementation001CommentVotes', 'MemeImplementation001Favorites',
];

async function loadDatabaseModule() {
  const context = vm.createContext({ console, process, Buffer });
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = new vm.SourceTextModule(compiled, { context });
  await module.link(async specifier => {
    const values = await import(specifier);
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [name, value] of Object.entries(values)) this.setExport(name, value);
    }, { context });
  });
  await module.evaluate();
  return module.namespace;
}

async function loadMemeRouter(memeDb, fileSystem) {
  const source = await readFile(path.join(api, 'server', 'memes.ts'), 'utf8');
  const context = vm.createContext({ console, process, Buffer });
  const module = new vm.SourceTextModule(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText, { context });
  await module.link(async specifier => {
    let values;
    if (specifier === './meme-db.js') values = { memeDb };
    else if (specifier === 'fs' && fileSystem) values = fileSystem;
    else if (specifier === './auth-middleware.js') values = {
      requireAuth: (req, _res, next) => { req.user = { userId: 7 }; next(); },
    };
    else if (specifier === './meme-upload.js') values = {
      parseMemeUpload: (_req, _res, next) => next(), storeMemeUpload() {},
      MAX_MEME_FILES: 10, MAX_MEME_FILE_SIZE: 50 * 1024 ** 3, MEME_EXTENSIONS: new Set(['.png']),
    };
    else if (specifier === './media-sanitizer.js') {
      const sanitizerSource = await readFile(path.join(api, 'server', 'media-sanitizer.ts'), 'utf8');
      const sanitizer = new vm.SourceTextModule(ts.transpileModule(sanitizerSource, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText, { context });
      await sanitizer.link(async dependency => {
        const exports = await import(dependency);
        return new vm.SyntheticModule(Object.keys(exports), function () {
          for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
        }, { context });
      });
      await sanitizer.evaluate();
      values = sanitizer.namespace;
    }
    else if (specifier === './input-validation.js') values = {
      validateInput: value => typeof value !== 'string' || !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value),
    };
    else values = await import(specifier);
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [name, value] of Object.entries(values)) this.setExport(name, value);
    }, { context });
  });
  await module.evaluate();
  return module.namespace.default;
}

async function fixture(run) {
  const directory = path.join(api, `.test-meme-db-${randomUUID()}`);
  await mkdir(directory);
  const mainPath = path.join(directory, 'database.sqlite');
  const main = new Database(mainPath);
  main.pragma('foreign_keys = ON');
  main.exec(`
    CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT NOT NULL);
    INSERT INTO users VALUES (7, 'original-user');
    ${canonicalSchema}
    CREATE INDEX meme_created_index ON MemeImplementation001Posts(created_at);
    CREATE TABLE unrelated (id INTEGER PRIMARY KEY, value TEXT);
    INSERT INTO unrelated VALUES (1, 'keep');
    CREATE TRIGGER meme_title_trim AFTER UPDATE OF title ON MemeImplementation001Posts BEGIN
      UPDATE MemeImplementation001Posts SET title = trim(NEW.title) WHERE id = NEW.id;
    END;
    INSERT INTO MemeImplementation001Posts (id, user_id, title, description, upvotes) VALUES (41, 7, 'kept', 'caption', 6);
    INSERT INTO MemeImplementation001Images (id, post_id, image_url) VALUES (42, 41, '/api/uploads/memes/kept.png');
    INSERT INTO MemeImplementation001Comments (id, post_id, user_id, description) VALUES (43, 41, 7, 'comment');
    INSERT INTO MemeImplementation001PostVotes (id, post_id, user_id, vote_type) VALUES (44, 41, 7, 1);
    INSERT INTO MemeImplementation001CommentVotes (id, comment_id, user_id, vote_type) VALUES (45, 43, 7, 1);
    INSERT INTO MemeImplementation001Favorites (id, post_id, user_id) VALUES (46, 41, 7);
    UPDATE sqlite_sequence SET seq = 100 WHERE name = 'MemeImplementation001Posts';
  `);
  try {
    await run({ directory, mainPath, main, memePath: path.join(directory, 'memebox.sqlite') });
  } finally {
    if (main.open) main.close();
    await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
}

test('populated migration moves every record, IDs, sequences, schema, indexes and joins without retaining main copies', async () => {
  await fixture(async ({ main, mainPath, memePath }) => {
    const expected = tables.map(table => main.prepare(`SELECT * FROM ${table}`).all());
    const module = await loadDatabaseModule();
    module.initializeMemeDatabase(main, mainPath);
    await module.memeDb.selectFrom(tables[0]).select('id').execute();
    const meme = new Database(memePath);
    try {
      tables.forEach((table, index) => assert.deepEqual(meme.prepare(`SELECT * FROM ${table}`).all(), expected[index]));
      assert.equal(main.prepare("SELECT count(*) AS n FROM sqlite_master WHERE name GLOB 'MemeImplementation001*'").get().n, 0);
      assert.equal(main.prepare('SELECT username FROM users WHERE id = 7').get().username, 'original-user');
      assert.equal(main.prepare('SELECT value FROM unrelated').get().value, 'keep');
      assert.ok(meme.prepare("SELECT 1 FROM sqlite_master WHERE name = 'meme_created_index'").get());
      assert.ok(meme.prepare("SELECT 1 FROM sqlite_master WHERE name = 'meme_title_trim'").get());
      meme.exec("UPDATE MemeImplementation001Posts SET title = ' trimmed ' WHERE id = 41");
      assert.equal(meme.prepare('SELECT title FROM MemeImplementation001Posts WHERE id = 41').get().title, 'trimmed');
      assert.equal(meme.prepare('SELECT seq FROM sqlite_sequence WHERE name = ?').get(tables[0]).seq, 100);
      assert.deepEqual(meme.pragma('foreign_key_check'), []);
      assert.equal(meme.pragma('foreign_key_list(MemeImplementation001Images)')[0].on_delete, 'CASCADE');
      assert.equal(main.pragma('foreign_keys', { simple: true }), 1);
      const joined = await module.memeDb.selectFrom('MemeImplementation001Comments as comments')
        .innerJoin('accounts.users as users', 'comments.user_id', 'users.id')
        .select(['comments.id', 'users.username']).executeTakeFirst();
      assert.deepEqual(joined, { id: 43, username: 'original-user' });
      main.prepare("UPDATE users SET username = 'renamed-user' WHERE id = 7").run();
      const account = await module.memeDb.withSchema('accounts').selectFrom('users').select('username').where('id', '=', 7).executeTakeFirst();
      assert.equal(account.username, 'renamed-user');
      assert.equal(meme.prepare("SELECT count(*) AS n FROM sqlite_master WHERE name = 'users'").get().n, 0);
      assert.throws(() => meme.prepare('INSERT INTO MemeImplementation001Favorites(post_id,user_id) VALUES (41,7)').run(), /UNIQUE/);
      await module.memeDb.deleteFrom('MemeImplementation001Posts').where('id', '=', 41).execute();
      for (const table of tables) assert.equal(meme.prepare(`SELECT count(*) AS n FROM ${table}`).get().n, 0);
      const inserted = await module.memeDb.insertInto('MemeImplementation001Posts').values({ user_id: 7, title: 'next' }).executeTakeFirst();
      assert.equal(Number(inserted.insertId), 101);
    } finally {
      meme.close();
      await module.memeDb.destroy();
    }
  });
});

test('repeated migrations do not resurrect deleted memes, including legacy tables recreated by old startup scripts', async () => {
  await fixture(async ({ main, memePath }) => {
    const module = await loadDatabaseModule();
    module.migrateMemeDatabase(main, memePath);
    const meme = new Database(memePath);
    try {
      meme.pragma('foreign_keys = ON');
      meme.prepare('DELETE FROM MemeImplementation001Posts WHERE id = 41').run();
      for (let attempt = 0; attempt < 2; attempt++) {
        main.exec(canonicalSchema);
        main.prepare("INSERT INTO MemeImplementation001Posts(id,user_id,title) VALUES (41,7,'stale-backup')").run();
        module.migrateMemeDatabase(main, memePath);
        assert.equal(meme.prepare('SELECT count(*) AS n FROM MemeImplementation001Posts').get().n, 0);
        assert.equal(main.prepare("SELECT count(*) AS n FROM sqlite_master WHERE name GLOB 'MemeImplementation001*'").get().n, 0);
      }
      assert.equal(meme.prepare('SELECT count(*) AS n FROM MigrationHistory').get().n, 1);
    } finally {
      meme.close();
    }
  });
});

test('untracked destination conflicts abort atomically without deleting source data', async () => {
  await fixture(async ({ main, memePath }) => {
    const module = await loadDatabaseModule();
    const meme = new Database(memePath);
    meme.exec('CREATE TABLE MemeImplementation001Images (id INTEGER PRIMARY KEY)');
    try {
      assert.throws(() => module.migrateMemeDatabase(main, memePath), /Refusing to overwrite/);
      for (const table of tables) assert.equal(main.prepare(`SELECT count(*) AS n FROM ${table}`).get().n, 1);
      assert.equal(meme.prepare("SELECT count(*) AS n FROM sqlite_master WHERE name = 'MemeImplementation001Posts'").get().n, 0);
      assert.equal(main.pragma('foreign_keys', { simple: true }), 1);
      assert.equal(main.prepare('PRAGMA database_list').all().length, 1);
    } finally {
      meme.close();
    }
  });
});

test('fresh schema is dedicated and legacy no-FK schema upgrades without dropping media or comments', async () => {
  await fixture(async ({ main, mainPath, memePath }) => {
    main.pragma('foreign_keys = OFF');
    for (const table of [...tables].reverse()) main.exec(`DROP TABLE ${table}`);
    main.exec(canonicalSchema.replace(/ REFERENCES MemeImplementation001\w+\(id\) ON DELETE CASCADE/g, '').replace(', is_edited INTEGER NOT NULL DEFAULT 0', ''));
    main.exec(`
      INSERT INTO MemeImplementation001Posts(id,user_id,title) VALUES (1,7,'legacy');
      INSERT INTO MemeImplementation001Comments(id,post_id,user_id,description) VALUES (2,1,7,'legacy-comment');
      INSERT INTO MemeImplementation001CommentVotes(comment_id,user_id,vote_type) VALUES (2,7,1);
    `);
    const module = await loadDatabaseModule();
    module.initializeMemeDatabase(main, mainPath);
    try {
      const post = await module.memeDb.selectFrom(tables[0]).selectAll().executeTakeFirst();
      assert.equal(post.is_edited, 0);
      await module.memeDb.deleteFrom(tables[0]).where('id', '=', 1).execute();
      assert.equal((await module.memeDb.selectFrom(tables[4]).selectAll().execute()).length, 0);
    } finally {
      await module.memeDb.destroy();
    }
  });
});

test('MemeBox routes join live main users and validate captions/comments after migration', async () => {
  await fixture(async ({ main, mainPath, directory }) => {
    const previousDirectory = process.env.DATA_DIRECTORY;
    process.env.DATA_DIRECTORY = directory;
    const module = await loadDatabaseModule();
    module.initializeMemeDatabase(main, mainPath);
    const { default: express } = await import('express');
    const app = express();
    app.use(express.json());
    const nativeFs = await import('node:fs');
    let simulateCleanupFailure = false;
    let simulatedCleanupFailures = 0;
    app.use(await loadMemeRouter(module.memeDb, {
      ...nativeFs,
      promises: {
        ...nativeFs.promises,
        async rm(filename, options) {
          await nativeFs.promises.rm(filename, options);
          if (simulateCleanupFailure && path.basename(filename).startsWith('.comment-')) {
            simulateCleanupFailure = false;
            simulatedCleanupFailures++;
            throw Object.assign(new Error('Simulated Windows cleanup lock'), { code: 'EPERM' });
          }
        },
      },
    }));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (url, method, body) => fetch(`${base}${url}`, {
      method, headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    try {
      const comments = await (await fetch(`${base}/api/memes/posts/41/comments`)).json();
      assert.equal(comments[0].username, 'original-user');
      const viral = await (await fetch(`${base}/api/memes/posts/viral`)).json();
      assert.equal(viral[0].username, 'original-user');
      assert.deepEqual(viral[0].images, ['/api/uploads/memes/kept.png']);
      assert.equal((await request('/api/memes/posts/41', 'PUT', { title: {}, description: 'bad' })).status, 400);
      const longTitle = 'x'.repeat(501);
      const longDescription = 'y'.repeat(65537);
      assert.equal((await request('/api/memes/posts/41', 'PUT', { title: longTitle, description: longDescription })).status, 200);
      const longPost = await module.memeDb.selectFrom(tables[0]).select(['title', 'description']).where('id', '=', 41).executeTakeFirst();
      assert.equal(longPost.title, longTitle);
      assert.equal(longPost.description, longDescription);
      assert.equal((await request('/api/memes/posts/41/comments', 'POST', { title: longTitle, description: longDescription })).status, 201);
      assert.equal((await request('/api/memes/posts/41/comments', 'POST', { title: {}, description: 'bad' })).status, 400);
      assert.equal((await request('/api/memes/posts/41/comments', 'POST', { description: 'bad\u0000text' })).status, 400);
      for (const image of [
        'https://example.com/unvalidated.png',
        'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
        `data:image/png;base64,${Buffer.from('<script>bad</script>').toString('base64')}`,
        'data:image/png;base64,invalid=',
      ]) {
        assert.equal((await request('/api/memes/posts/41/comments', 'POST', { description: 'image', image })).status, 400);
      }
      const { default: sharp } = await import('sharp');
      simulateCleanupFailure = true;
      for (const format of ['png', 'jpeg', 'gif']) {
        const bytes = await sharp({ create: { width: 2, height: 3, channels: 3, background: 'red' } })
          .toFormat(format).toBuffer();
        const response = await request('/api/memes/posts/41/comments', 'POST', {
          description: 'valid', image: `data:image/${format};base64,${bytes.toString('base64')}`,
        });
        assert.equal(response.status, 201);
        const saved = await response.json();
        const encoded = saved.image_url.split(',')[1];
        const metadata = await sharp(Buffer.from(encoded, 'base64')).metadata();
        assert.equal(metadata.format, format);
        assert.equal(metadata.width, 2);
        assert.equal(metadata.height, 3);
      }
      assert.equal(simulatedCleanupFailures, 1);
      assert.equal((await request('/api/memes/posts/999/comments', 'POST', { title: 'missing post' })).status, 404);
      assert.equal((await request('/api/memes/posts/999', 'DELETE')).status, 404);
      assert.equal((await request('/api/memes/comments/999', 'DELETE')).status, 404);
      assert.equal((await request('/api/memes/posts/41', 'PUT', { title: ' edited ', description: null })).status, 200);
      assert.equal((await module.memeDb.selectFrom(tables[0]).select('title').where('id', '=', 41).executeTakeFirst()).title, 'edited');
    } finally {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
      await module.memeDb.destroy();
      if (previousDirectory === undefined) delete process.env.DATA_DIRECTORY;
      else process.env.DATA_DIRECTORY = previousDirectory;
    }
  });
});

test('new installs create all MemeBox tables only in the dedicated file', async () => {
  await fixture(async ({ main, mainPath, memePath }) => {
    main.pragma('foreign_keys = OFF');
    for (const table of [...tables].reverse()) main.exec(`DROP TABLE ${table}`);
    main.exec('DROP TABLE users');
    const module = await loadDatabaseModule();
    module.initializeMemeDatabase(main, mainPath);
    await module.memeDb.selectFrom(tables[0]).select('id').execute();
    const meme = new Database(memePath);
    try {
      for (const table of tables) assert.equal(meme.prepare(`SELECT count(*) AS n FROM ${table}`).get().n, 0);
      assert.equal(main.prepare("SELECT count(*) AS n FROM sqlite_master WHERE name GLOB 'MemeImplementation001*'").get().n, 0);
      assert.deepEqual(meme.pragma('foreign_key_check'), []);
    } finally {
      meme.close();
      await module.memeDb.destroy();
    }
  });
});
