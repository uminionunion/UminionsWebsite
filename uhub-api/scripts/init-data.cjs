// Seeds DATA_DIRECTORY with the shipped uHub schema/database if it isn't already present
// (mirrors pantry-api's init-db.cjs seeding pattern for a named Docker volume).
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

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

// Keep older named volumes compatible with the active MemeBox API.
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS MemeImplementation001Posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS MemeImplementation001Images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS MemeImplementation001Comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    image_url TEXT,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_deleted INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS MemeImplementation001PostVotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    vote_type INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS MemeImplementation001CommentVotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    vote_type INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS MemeImplementation001Favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
  );
`);
console.log('[init-data] MemeBox tables verified.');

// Heal older uhub_data volumes that predate the role/admin columns auth.ts relies on for signup/login.
const usersTableExists = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
  .get();

if (usersTableExists) {
  const existingUserColumns = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
  const requiredUserColumns = [
    ['is_high_high_high_admin', 'INTEGER NOT NULL DEFAULT 0'],
    ['is_high_high_admin', 'INTEGER NOT NULL DEFAULT 0'],
    ['is_high_admin', 'INTEGER NOT NULL DEFAULT 0'],
    ['is_special_user', 'INTEGER NOT NULL DEFAULT 0'],
    ['is_special_special_user', 'INTEGER NOT NULL DEFAULT 0'],
    ['is_special_special_special_user', 'INTEGER NOT NULL DEFAULT 0'],
    ['is_blocked', 'INTEGER NOT NULL DEFAULT 0'],
    ['is_banned_from_chatrooms', 'INTEGER NOT NULL DEFAULT 0'],
    ['is_new_user', 'INTEGER NOT NULL DEFAULT 0'],
  ];

  for (const [columnName, columnDefinition] of requiredUserColumns) {
    if (!existingUserColumns.includes(columnName)) {
      db.exec(`ALTER TABLE users ADD COLUMN ${columnName} ${columnDefinition}`);
      console.log(`[init-data] Added missing users.${columnName} column.`);
    }
  }
  console.log('[init-data] users table role/admin columns verified.');
} else {
  console.log('[init-data] users table not found; skipping role/admin column check.');
}

// Heal older uhub_data volumes that predate the "-edited" tracking flag on MemeBox posts.
const memePostsTableExists = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='MemeImplementation001Posts'")
  .get();

if (memePostsTableExists) {
  const existingMemePostColumns = db.prepare('PRAGMA table_info(MemeImplementation001Posts)').all().map((c) => c.name);
  if (!existingMemePostColumns.includes('is_edited')) {
    db.exec("ALTER TABLE MemeImplementation001Posts ADD COLUMN is_edited INTEGER NOT NULL DEFAULT 0");
    console.log('[init-data] Added missing MemeImplementation001Posts.is_edited column.');
  }
}

// Social Media Posts ("My Posts" / "My Feed") tables.
db.exec(`
  CREATE TABLE IF NOT EXISTS SocialMediaPosts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_edited INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS SocialMediaPostVotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    vote_type INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS SocialMediaPostFavorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS SocialMediaPostComments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);
console.log('[init-data] SocialMediaPosts tables verified.');

// Real user-created broadcasts/episodes (separate from MainHubUpgradeV001ForBroadcasts, which is
// already used unfiltered for the UnionNews14 image carousel - reusing it here would leak into that carousel).
db.exec(`
  CREATE TABLE IF NOT EXISTS UserBroadcasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS UserBroadcastEpisodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    broadcast_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    media_url TEXT,
    media_type TEXT,
    cover_image_url TEXT,
    scheduled_at TEXT,
    tags TEXT,
    website TEXT,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    is_edited INTEGER NOT NULL DEFAULT 0,
    last_played_at TEXT,
    play_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS UserBroadcastEpisodePlays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    completed_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS UserBroadcastEpisodeMedia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS UserBroadcastEpisodeVotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    vote_type INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(episode_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS UserBroadcastEpisodeFavorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(episode_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS UserBroadcastEpisodeComments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    user_id INTEGER,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const episodeColumns = db.prepare('PRAGMA table_info(UserBroadcastEpisodes)').all().map((c) => c.name);
if (!episodeColumns.includes('last_played_at')) {
  db.exec('ALTER TABLE UserBroadcastEpisodes ADD COLUMN last_played_at TEXT');
}
if (!episodeColumns.includes('play_count')) {
  db.exec('ALTER TABLE UserBroadcastEpisodes ADD COLUMN play_count INTEGER NOT NULL DEFAULT 0');
}
console.log('[init-data] UserBroadcasts/UserBroadcastEpisodes tables verified.');

db.close();
