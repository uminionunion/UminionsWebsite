
import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import type { DB } from './db-types.js';
import path from 'path';
import fs from 'fs';
import { initializeMemeDatabase } from './meme-db.js';
import { initializeUnionNewsArchive, addUnionNewsImage } from './union-news-archive.js';

const dataDir = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');

const sqliteDb = new Database(dbPath);
initializeMemeDatabase(sqliteDb, dbPath);
initializeUnionNewsArchive(sqliteDb);

export const insertUnionNewsImage = (image: Parameters<typeof addUnionNewsImage>[1]) => addUnionNewsImage(sqliteDb, image);

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error'],
});
