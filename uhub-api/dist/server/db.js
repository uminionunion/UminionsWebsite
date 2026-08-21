import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
const dataDir = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'database.sqlite');
const sqliteDb = new Database(dbPath);
export const db = new Kysely({
    dialect: new SqliteDialect({
        database: sqliteDb,
    }),
    log: ['query', 'error'],
});
