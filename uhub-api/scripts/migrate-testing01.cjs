const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { createReadStream } = require('node:fs');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const Database = require('better-sqlite3');

const apiRoot = path.resolve(__dirname, '..');
const reportName = 'testing01-migration.json';
const quote = name => `"${name.replace(/"/g, '""')}"`;
const run = promisify(execFile);

async function hashFile(filename) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filename)) hash.update(chunk);
  return hash.digest('hex');
}

async function inventory(directory, relative = '') {
  const result = [];
  const entries = await fs.readdir(path.join(directory, relative), { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const name = path.join(relative, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Source contains a symbolic link; use a self-contained data copy.');
    if (entry.isDirectory()) result.push(...await inventory(directory, name));
    else if (entry.isFile()) {
      // Shared-memory files are transient, not durable database content.
      if (name.endsWith('.sqlite-shm')) continue;
      result.push({ name, hash: await hashFile(path.join(directory, name)) });
    } else throw new Error('Source contains an unsupported filesystem entry.');
  }
  return result;
}

const fingerprint = files => createHash('sha256').update(JSON.stringify(files)).digest('hex');

function tableSnapshot(db) {
  return db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(({ name }) => {
    const columns = db.prepare(`PRAGMA table_info(${quote(name)})`).all().map(column => column.name);
    return { name, columns, ...tableDigest(db, name, columns, true) };
  });
}

function tableDigest(db, table, columns, normalizeLegacy = false) {
  const hash = createHash('sha256');
  const fields = columns.map(column => normalizeLegacy && table === 'MainHubUpgradeV001ForProducts' && column === 'store_id'
    ? `CASE WHEN store_type='main' AND store_id IS NULL THEN 0 ELSE store_id END AS store_id`
    : quote(column)).join(',');
  const order = columns.includes('id') ? quote('id') : columns.map(quote).join(',');
  let count = 0;
  for (const row of db.prepare(`SELECT ${fields} FROM ${quote(table)} ORDER BY ${order}`).iterate()) {
    hash.update(JSON.stringify(row));
    hash.update('\n');
    count++;
  }
  return { count, digest: hash.digest('hex') };
}

function checkDatabase(db) {
  if (db.pragma('integrity_check', { simple: true }) !== 'ok') throw new Error('Database integrity check failed.');
}

function foreignKeyIssues(db) {
  return db.pragma('foreign_key_check').map(issue => JSON.stringify(issue)).sort();
}

async function checkMedia(directory, db, meme) {
  const local = new Set();
  const hosted = new Set();
  for (const database of [db, meme]) {
    const tables = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    for (const { name } of tables) {
      const columns = database.prepare(`PRAGMA table_info(${quote(name)})`).all()
        .map(column => column.name).filter(column => /(?:_url|images|image[1-5])$/.test(column));
      for (const column of columns) {
        for (const row of database.prepare(`SELECT ${quote(column)} AS value FROM ${quote(name)} WHERE ${quote(column)} IS NOT NULL`).iterate()) {
          const value = row.value;
          if (typeof value !== 'string') continue;
          const values = value.startsWith('[') ? JSON.parse(value) : [value];
          if (!Array.isArray(values)) throw new Error('Invalid legacy media list.');
          for (const url of values) {
            if (typeof url !== 'string' || !url || url.startsWith('data:')) continue;
            if (url.startsWith('/api/uploads/') || url.startsWith('/data/')) {
              const prefix = url.startsWith('/api/uploads/') ? '/api/uploads/' : '/data/';
              const relative = decodeURIComponent(url.slice(prefix.length).split(/[?#]/)[0]);
              const filename = path.resolve(directory, prefix === '/api/uploads/' ? 'uploads' : '.', relative);
              const root = directory + path.sep;
              if (!filename.startsWith(root)) throw new Error('A legacy media path escapes the data directory.');
              const stat = await fs.stat(filename).catch(error => {
                if (error.code === 'ENOENT') throw new Error(`Missing referenced legacy media file: ${path.relative(directory, filename)}`);
                throw error;
              });
              if (!stat.isFile()) throw new Error('A legacy media reference does not point to a file.');
              local.add(url);
            } else hosted.add(url);
          }
        }
      }
    }
  }
  return { verifiedLocalReferences: local.size, hostingReferencesRetained: hosted.size };
}

async function migrate(sourceArgument, destinationArgument) {
  const source = await fs.realpath(sourceArgument);
  const destinationParent = await fs.realpath(path.dirname(path.resolve(destinationArgument)));
  const destination = path.join(destinationParent, path.basename(path.resolve(destinationArgument)));
  const comparable = value => process.platform === 'win32' ? value.toLowerCase() : value;
  const a = comparable(source);
  const b = comparable(destination);
  if (a === b || a.startsWith(b + path.sep) || b.startsWith(a + path.sep)) {
    throw new Error('Source and destination must be separate, non-nested directories.');
  }
  const files = await inventory(source);
  if (!files.some(file => file.name === 'database.sqlite')) throw new Error('Source must contain database.sqlite.');
  const sourceFingerprint = fingerprint(files);
  let destinationExists = false;
  try {
    await fs.lstat(destination);
    destinationExists = true;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (destinationExists) {
    const report = await fs.readFile(path.join(destination, reportName), 'utf8').then(JSON.parse).catch(error => {
      if (error.code === 'ENOENT') throw new Error('Destination already exists; refusing to overwrite or merge accounts, beta data, or uploads.');
      throw error;
    });
    if (report.sourceFingerprint !== sourceFingerprint) throw new Error('Destination belongs to a different source snapshot; refusing to overwrite it.');
    await fs.access(path.join(destination, 'database.sqlite'));
    await fs.access(path.join(destination, 'memebox.sqlite'));
    await fs.access(path.join(destination, 'usersAddedProfileAndCoverImages.sqlite'));
    console.log('[migration] This source snapshot was already imported; no data changed.');
    return report;
  }

  const lockName = destination + '.testing01-lock';
  const lock = await fs.open(lockName, 'wx');
  let stage;
  try {
    stage = await fs.mkdtemp(path.join(destinationParent, '.testing01-import-'));
    for (const file of files) {
      if (/\.sqlite-(?:wal|journal)$/.test(file.name)) continue;
      const target = path.join(stage, file.name);
      await fs.mkdir(path.dirname(target), { recursive: true });
      if (file.name.endsWith('.sqlite')) {
        const sourceDb = new Database(path.join(source, file.name), { readonly: true, fileMustExist: true });
        try {
          checkDatabase(sourceDb);
          await sourceDb.backup(target);
        } finally {
          sourceDb.close();
        }
      } else {
        await fs.copyFile(path.join(source, file.name), target);
        if (await hashFile(target) !== file.hash) throw new Error('A copied source file failed verification.');
      }
    }
    const initial = new Database(path.join(stage, 'database.sqlite'), { readonly: true });
    let tables;
    let originalForeignKeys;
    let sequences;
    try {
      const userColumns = initial.prepare('PRAGMA table_info(users)').all().map(column => column.name);
      if (!['id', 'username', 'password'].every(column => userColumns.includes(column))) throw new Error('Source is not a supported Testing01 account database.');
      tables = tableSnapshot(initial);
      originalForeignKeys = foreignKeyIssues(initial);
      sequences = initial.prepare('SELECT name,seq FROM sqlite_sequence').all();
    } finally {
      initial.close();
    }
    const env = { ...process.env, DATA_DIRECTORY: stage, UHUB_REQUIRE_MIGRATION: '0' };
    await run(process.execPath, [path.join(__dirname, 'init-data.cjs')], { cwd: apiRoot, env });
    // Run exactly the same split-database and photo-library initialization as v3 startup.
    const bootstrap = `await import('./dist/server/db.js'); await import('./dist/server/user-photos-db.js');`;
    await run(process.execPath, ['--input-type=module', '-e', bootstrap], { cwd: apiRoot, env });
    const main = new Database(path.join(stage, 'database.sqlite'), { readonly: true });
    const meme = new Database(path.join(stage, 'memebox.sqlite'), { readonly: true });
    const photos = new Database(path.join(stage, 'usersAddedProfileAndCoverImages.sqlite'), { readonly: true });
    let media;
    try {
      for (const database of [main, meme, photos]) checkDatabase(database);
      for (const table of tables) {
        const database = table.name.startsWith('MemeImplementation001') ? meme : main;
        const actual = tableDigest(database, table.name, table.columns);
        if (actual.count !== table.count || actual.digest !== table.digest) throw new Error(`Legacy records failed preservation verification: ${table.name}`);
      }
      for (const sequence of sequences) {
        const database = sequence.name.startsWith('MemeImplementation001') ? meme : main;
        const actual = database.prepare('SELECT seq FROM sqlite_sequence WHERE name=?').get(sequence.name);
        if (!actual || actual.seq < sequence.seq) throw new Error('A legacy ID sequence was not preserved.');
      }
      const newIssues = foreignKeyIssues(main).filter(issue => !originalForeignKeys.includes(issue));
      if (newIssues.length) throw new Error('Migration introduced foreign-key violations.');
      media = await checkMedia(stage, main, meme);
    } finally {
      main.close();
      meme.close();
      photos.close();
    }
    if (fingerprint(await inventory(source)) !== sourceFingerprint) {
      throw new Error('Source changed during migration; use a stopped or consistent source snapshot and retry into a new destination.');
    }
    const report = {
      version: 1, completedAt: new Date().toISOString(), sourceFingerprint,
      preservedTables: tables.map(({ name, count }) => ({ name, count })),
      preexistingForeignKeyIssues: originalForeignKeys.length, ...media,
    };
    await fs.writeFile(path.join(stage, reportName), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
    await fs.rename(stage, destination);
    stage = undefined;
    console.log(`[migration] Completed: ${tables.length} legacy tables verified; ${media.verifiedLocalReferences} local media references verified.`);
    if (media.hostingReferencesRetained) console.warn(`[migration] Retained ${media.hostingReferencesRetained} hosting/external URL references; their content is not inside the uHub data directory.`);
    if (originalForeignKeys.length) console.warn(`[migration] Preserved source with ${originalForeignKeys.length} pre-existing foreign-key violations; see the report.`);
    return report;
  } finally {
    if (stage) await fs.rm(stage, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    await lock.close();
    await fs.unlink(lockName);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 4 || args[0] !== '--source' || args[2] !== '--destination') {
    console.error('Usage: node scripts/migrate-testing01.cjs --source <v2-data-directory> --destination <new-v3-data-directory>');
    process.exitCode = 1;
  } else migrate(args[1], args[3]).catch(error => {
    console.error('[migration] Failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { migrate };
