// Seeds DATA_DIRECTORY with the shipped uHub schema/database if it isn't already present
// (mirrors pantry-api's init-db.cjs seeding pattern for a named Docker volume).
const fs = require('fs');
const path = require('path');

const dataDir = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'database.sqlite');
const seedPath = path.join(process.cwd(), 'seed', 'database.sqlite');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dbPath) && fs.existsSync(seedPath)) {
  fs.copyFileSync(seedPath, dbPath);
  console.log('[init-data] Seeded database.sqlite from bundled seed file.');
} else {
  console.log('[init-data] Existing database.sqlite found (or no seed available); leaving as-is.');
}
