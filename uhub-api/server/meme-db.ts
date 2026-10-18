import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import type { DB } from './db-types.js';
import path from 'path';

const migrationName = 'memebox-separated-v1';
const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;
const schema = `
CREATE TABLE IF NOT EXISTS MemeImplementation001Posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT NOT NULL,
  description TEXT, upvotes INTEGER NOT NULL DEFAULT 0, downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP, is_edited INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS MemeImplementation001Images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES MemeImplementation001Posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, title TEXT, description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS MemeImplementation001Comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES MemeImplementation001Posts(id) ON DELETE CASCADE,
  user_id INTEGER, title TEXT, description TEXT, image_url TEXT,
  upvotes INTEGER NOT NULL DEFAULT 0, downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP, is_deleted INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS MemeImplementation001PostVotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES MemeImplementation001Posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL, vote_type INTEGER NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);
CREATE TABLE IF NOT EXISTS MemeImplementation001CommentVotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL REFERENCES MemeImplementation001Comments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL, vote_type INTEGER NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
);
CREATE TABLE IF NOT EXISTS MemeImplementation001Favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES MemeImplementation001Posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(post_id, user_id)
);
`;

type SchemaObject = { type: string; name: string; tbl_name: string; sql: string | null };

function separateAccountReferences(sql: string) {
  const users = '(?:"users"|`users`|\\[users\\]|users)';
  const actions = '(?:\\s+ON\\s+(?:DELETE|UPDATE)\\s+(?:CASCADE|RESTRICT|NO\\s+ACTION|SET\\s+(?:NULL|DEFAULT)))*';
  // SQLite cannot enforce a foreign key into an attached database. API ownership checks use accounts.users.
  return sql.replace(new RegExp(
    `,\\s*(?:CONSTRAINT\\s+\\S+\\s+)?FOREIGN\\s+KEY\\s*\\([^)]+\\)\\s*REFERENCES\\s+${users}\\s*\\([^)]+\\)${actions}`, 'gi',
  ), '').replace(new RegExp(`\\s+REFERENCES\\s+${users}\\s*\\([^)]+\\)${actions}`, 'gi'), '');
}

/** Moves legacy tables, rather than retaining a second source of truth in the account database. */
export function migrateMemeDatabase(main: Database.Database, memePath: string) {
  const foreignKeys = main.pragma('foreign_keys', { simple: true });
  const journalMode = String(main.pragma('journal_mode', { simple: true }));
  const synchronous = main.pragma('synchronous', { simple: true });
  if (main.inTransaction) throw new Error('MemeBox migration must run before application transactions.');
  main.pragma('foreign_keys = OFF');
  // SQLite's super-journal makes the attached-file move atomic, including crash recovery.
  main.pragma('journal_mode = DELETE');
  main.pragma('synchronous = FULL');
  let attached = false;
  try {
    main.prepare('ATTACH DATABASE ? AS memebox_move').run(memePath);
    attached = true;
    main.pragma('memebox_move.journal_mode = DELETE');
    main.pragma('memebox_move.synchronous = FULL');
    main.transaction(() => {
      main.exec('CREATE TABLE IF NOT EXISTS memebox_move.MigrationHistory (name TEXT PRIMARY KEY, completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
      const migrated = main.prepare('SELECT 1 FROM memebox_move.MigrationHistory WHERE name = ?').get(migrationName);
      const objects = main.prepare(`
        SELECT type, name, tbl_name, sql FROM main.sqlite_master
        WHERE substr(tbl_name, 1, 21) = 'MemeImplementation001'
        ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 ELSE 2 END
      `).all() as SchemaObject[];
      const tables = objects.filter(object => object.type === 'table');
      if (!migrated) {
        for (const table of tables) {
          if (!table.sql) throw new Error(`Missing schema for ${table.name}`);
          const existing = main.prepare('SELECT 1 FROM memebox_move.sqlite_master WHERE type = ? AND name = ?').get('table', table.name);
          if (existing) throw new Error(`Refusing to overwrite untracked MemeBox table ${table.name}`);
          const create = separateAccountReferences(table.sql).replace(
            /^CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:"[^"]+"|`[^`]+`|\[[^\]]+\]|[^\s(]+)/i,
            `CREATE TABLE memebox_move.${quote(table.name)}`,
          );
          main.exec(create);
          const references = main.prepare(`PRAGMA memebox_move.foreign_key_list(${quote(table.name)})`).all() as { table: string }[];
          if (references.some(reference => reference.table.toLowerCase() === 'users')) {
            throw new Error(`Unsupported cross-database user reference in ${table.name}`);
          }
          main.exec(`INSERT INTO memebox_move.${quote(table.name)} SELECT * FROM main.${quote(table.name)}`);
        }
        const hasSequence = main.prepare("SELECT 1 FROM main.sqlite_master WHERE name = 'sqlite_sequence'").get();
        if (hasSequence) {
          for (const table of tables) {
            const sequence = main.prepare('SELECT seq FROM main.sqlite_sequence WHERE name = ?').get(table.name) as { seq: number } | undefined;
            if (sequence) {
              main.prepare('DELETE FROM memebox_move.sqlite_sequence WHERE name = ?').run(table.name);
              main.prepare('INSERT INTO memebox_move.sqlite_sequence(name, seq) VALUES (?, ?)').run(table.name, sequence.seq);
            }
          }
        }
        for (const object of objects.filter(object => object.type !== 'table' && object.sql)) {
          main.exec(object.sql!.replace(
            /^CREATE\s+(UNIQUE\s+)?(INDEX|TRIGGER|VIEW)\s+(?:IF NOT EXISTS\s+)?(?:"[^"]+"|`[^`]+`|\[[^\]]+\]|[^\s(]+)/i,
            (_match, unique = '', type) => `CREATE ${unique}${type} memebox_move.${quote(object.name)}`,
          ));
        }
        main.prepare('INSERT INTO memebox_move.MigrationHistory(name) VALUES (?)').run(migrationName);
      }
      // A completed marker deliberately prevents old startup scripts/backups resurrecting deleted memes.
      for (const table of tables.reverse()) main.exec(`DROP TABLE main.${quote(table.name)}`);
    }).immediate();
  } finally {
    if (attached) main.exec('DETACH DATABASE memebox_move');
    main.pragma(`journal_mode = ${journalMode}`);
    main.pragma(`synchronous = ${synchronous}`);
    main.pragma(`foreign_keys = ${foreignKeys ? 'ON' : 'OFF'}`);
  }
}

export let memeDb: Kysely<DB>;

export function initializeMemeDatabase(main: Database.Database, mainPath: string) {
  if (memeDb) return;
  const memePath = path.join(path.dirname(mainPath), 'memebox.sqlite');
  migrateMemeDatabase(main, memePath);
  const sqlite = new Database(memePath);
  try {
    sqlite.exec(schema);
    const columns = sqlite.prepare('PRAGMA table_info(MemeImplementation001Posts)').all() as { name: string }[];
    if (!columns.some(column => column.name === 'is_edited')) {
      sqlite.exec('ALTER TABLE MemeImplementation001Posts ADD COLUMN is_edited INTEGER NOT NULL DEFAULT 0');
    }
    // Legacy volumes had no foreign keys: keep their schema/data, but still cascade future deletions.
    sqlite.exec(`
      CREATE TRIGGER IF NOT EXISTS memebox_delete_post AFTER DELETE ON MemeImplementation001Posts BEGIN
        DELETE FROM MemeImplementation001Images WHERE post_id = OLD.id;
        DELETE FROM MemeImplementation001Comments WHERE post_id = OLD.id;
        DELETE FROM MemeImplementation001PostVotes WHERE post_id = OLD.id;
        DELETE FROM MemeImplementation001Favorites WHERE post_id = OLD.id;
      END;
      CREATE TRIGGER IF NOT EXISTS memebox_delete_comment AFTER DELETE ON MemeImplementation001Comments BEGIN
        DELETE FROM MemeImplementation001CommentVotes WHERE comment_id = OLD.id;
      END;
    `);
    sqlite.pragma('foreign_keys = ON');
    sqlite.prepare('ATTACH DATABASE ? AS accounts').run(mainPath);
    memeDb = new Kysely<DB>({ dialect: new SqliteDialect({ database: sqlite }) });
  } catch (error) {
    sqlite.close();
    throw error;
  }
}
