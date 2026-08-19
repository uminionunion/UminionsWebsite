import fs from 'fs';
import path from 'path';
import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
const DATA_DIRECTORY = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIRECTORY)) {
    fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
}
const DB_FILE = path.join(DATA_DIRECTORY, 'database.sqlite');
const dialect = new SqliteDialect({
    database: new Database(DB_FILE),
});
export const db = new Kysely({
    dialect,
    log: ['query', 'error'],
});
