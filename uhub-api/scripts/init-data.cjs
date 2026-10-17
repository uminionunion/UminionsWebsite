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

// MemeBox schema/migration is owned by server/meme-db.ts, never recreated in the account database.
const db = new Database(dbPath);

// Older shipped schemas lack fields used by the current store, gallery and unread-status routes.
db.transaction(() => {
  const addColumns = (table, columns) => {
    const existing = new Set(db.prepare(`PRAGMA table_info("${table}")`).all().map(column => column.name));
    for (const [name, definition] of columns) {
      if (existing.has(name)) continue;
      db.exec(`ALTER TABLE "${table}" ADD COLUMN "${name}" ${definition}`);
      console.log(`[init-data] Added missing ${table}.${name}.`);
    }
  };
  db.exec(`
    CREATE TABLE IF NOT EXISTS MainHubUpgradeV001ForProducts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, subtitle TEXT, description TEXT,
      price REAL, image_url TEXT, store_type TEXT, user_id INTEGER
    );
    CREATE TABLE IF NOT EXISTS MainHubUpgradeV001ForBroadcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL, subtitle TEXT, description TEXT, badge_url TEXT, banner_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS chatroom_unread_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id),
      chatroom_room_name TEXT NOT NULL, has_unread INTEGER NOT NULL DEFAULT 0,
      UNIQUE(user_id, chatroom_room_name)
    );
  `);
  addColumns('MainHubUpgradeV001ForProducts', [
    ['store_id', 'INTEGER'], ['user_store_id', 'INTEGER'], ['payment_method', 'TEXT'],
    ['payment_url', 'TEXT'], ['is_in_trash', 'INTEGER NOT NULL DEFAULT 0'],
    ['sku_id', 'TEXT'], ['url', 'TEXT'], ['created_at', 'TEXT'],
  ]);
  addColumns('MainHubUpgradeV001ForBroadcasts', [
    ['image_url', 'TEXT'], ['click_url', 'TEXT'], ['description', 'TEXT'],
    ['display_order', 'INTEGER NOT NULL DEFAULT 0'], ['created_at', 'TEXT'],
  ]);
  for (const table of ['MainHubUpgradeV001ForProducts', 'MainHubUpgradeV001ForBroadcasts']) {
    db.exec(`CREATE TRIGGER IF NOT EXISTS "${table}_created_at_default"
      AFTER INSERT ON "${table}" WHEN NEW.created_at IS NULL
      BEGIN UPDATE "${table}" SET created_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END`);
  }
  db.prepare("UPDATE MainHubUpgradeV001ForProducts SET store_id = 0 WHERE store_type = 'main' AND store_id IS NULL").run();
})();

// Heal older uhub_data volumes that predate the role/admin columns auth.ts relies on for signup/login.
const usersTableExists = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
  .get();

if (usersTableExists) {
  const existingUserColumns = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
  const requiredUserColumns = [
    ['profile_image_url', 'TEXT'],
    ['cover_photo_url', 'TEXT'],
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
  CREATE TABLE IF NOT EXISTS UserPrivacySettings (
    user_id INTEGER PRIMARY KEY,
    allow_logged_in_friends_list INTEGER NOT NULL DEFAULT 1,
    allow_anonymous_posts INTEGER NOT NULL DEFAULT 1,
    allow_anonymous_interactions INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS SocialMediaPostAnonymousVotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    visitor_id TEXT NOT NULL,
    vote_type INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, visitor_id)
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

db.exec(`
  CREATE TABLE IF NOT EXISTS UhubManagedCarouselItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot TEXT NOT NULL,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    price TEXT,
    website TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);
console.log('[init-data] UhubManagedCarouselItems table verified.');

// Import previously hard-coded display entries once. The marker preserves intentionally empty collections.
db.exec('CREATE TABLE IF NOT EXISTS UhubCarouselDefaultsImported (slot TEXT PRIMARY KEY)');
const defaultCover = '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg';
const today = new Date();
const eventDate = new Date(today.getFullYear(), today.getMonth() + (today.getDate() >= 25 ? 1 : 0), 24);
const defaults = {
  'left-top': [
    { image_url: '/includes/Uminionad001.png', title: `Next Union Event: ${eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 9am to 9pm` },
    { image_url: '/includes/WYSad001.png', title: 'AD - Sponsored By: WhatsYorStory.com', website: 'https://WhatsYorStory.com' },
    { image_url: '/includes/Uminionad001.png', title: `Next Union Event: ${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (9am to 9pm)` },
    { image_url: '/includes/WYSad001.png', title: 'AD - Sponsored By: WhatsYorStory.com', website: 'https://WhatsYorStory.com' },
  ],
  left: [
    { image_url: '/StoreProductsAndImagery/UkraineLogo001.png', title: 'Ukraine Poster', price: 'u24.gov.ua', website: 'https://u24.gov.ua' },
    { image_url: '/StoreProductsAndImagery/TapestryVersion001.png', title: 'BYO Tapestry', price: '$1,499.95 BYO Tapestry', website: 'https://page001.uminion.com/cart/?add-to-cart=UStoreButton005.001AAAAA' },
    { image_url: '/StoreProductsAndImagery/Tshirtbatchversion001.png', title: 'Union Shirts' },
  ],
  right: [14, 15, 16].map((number, index) => ({
    image_url: `/StoreProductsAndImagery/UminionLogo0${number}.00.2024Classic.png`,
    title: `Sister Union #${number}: ${['Union News', 'Union Radio', 'Union Drive'][index]} - 2024 Classic`,
    price: '$69.95',
    website: `https://page001.uminion.com/cart/?add-to-cart=UStoreButton005.0${26 + index}.01A`,
  })),
  cover: [{ image_url: defaultCover }],
  center: [{ image_url: '/uhub/dist/UminionAnchor.png' }],
  bottom: [
    { image_url: '', title: 'Become an Official Member of the Union via getting your Union Card Today!', website: 'https://page001.uminion.com/product/official-uminion-union-card/' },
    { image_url: defaultCover },
  ],
};
db.transaction(() => {
  const imported = db.prepare('SELECT slot FROM UhubCarouselDefaultsImported WHERE slot = ?');
  const existing = db.prepare('SELECT COUNT(*) AS count FROM UhubManagedCarouselItems WHERE slot = ?');
  const insert = db.prepare('INSERT INTO UhubManagedCarouselItems (slot, image_url, title, description, price, website, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const [slot, entries] of Object.entries(defaults)) {
    if (imported.get(slot)) continue;
    const additive = ['cover', 'center', 'bottom'].includes(slot);
    if (additive || existing.get(slot).count === 0) {
      if (additive) db.prepare('UPDATE UhubManagedCarouselItems SET display_order = display_order + ? WHERE slot = ?').run(entries.length, slot);
      entries.forEach((item, index) => insert.run(slot, item.image_url, item.title || null, null, item.price || null, item.website || null, index));
    }
    db.prepare('INSERT INTO UhubCarouselDefaultsImported (slot) VALUES (?)').run(slot);
  }
})();
console.log('[init-data] Editable carousel defaults imported (existing collections preserved).');

db.exec(`
  CREATE TABLE IF NOT EXISTS UmiMatchProfiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    bio TEXT DEFAULT '',
    city TEXT DEFAULT '',
    gender TEXT DEFAULT '',
    interested_in TEXT DEFAULT '',
    max_distance INTEGER DEFAULT 100,
    allow_anyone INTEGER NOT NULL DEFAULT 0,
    image1 TEXT,
    image2 TEXT,
    image3 TEXT,
    image4 TEXT,
    image5 TEXT,
    is_enrolled INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS UmiMatchSwipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_user_id)
  );
  CREATE TABLE IF NOT EXISTS UmiMatchMessages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS DeletedUmiMatchAccounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    profile_json TEXT,
    swipes_json TEXT,
    messages_json TEXT,
    deleted_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS DeletedUserAccounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    user_json TEXT,
    deleted_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);
const umiMatchProfileColumns = db.prepare('PRAGMA table_info(UmiMatchProfiles)').all().map((c) => c.name);
if (!umiMatchProfileColumns.includes('is_enrolled')) db.exec('ALTER TABLE UmiMatchProfiles ADD COLUMN is_enrolled INTEGER NOT NULL DEFAULT 0');
if (!umiMatchProfileColumns.includes('deleted_at')) db.exec('ALTER TABLE UmiMatchProfiles ADD COLUMN deleted_at TEXT');
console.log('[init-data] UmiMatch tables verified.');

db.exec(`
  CREATE TABLE IF NOT EXISTS MillionPixels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    color TEXT NOT NULL DEFAULT '#ffffff',
    change_count INTEGER NOT NULL DEFAULT 0,
    next_cost_tickets INTEGER NOT NULL DEFAULT 1,
    last_changed_by INTEGER,
    last_changed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(x, y)
  );
  CREATE TABLE IF NOT EXISTS MillionPixelHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pixel_x INTEGER NOT NULL,
    pixel_y INTEGER NOT NULL,
    change_number INTEGER NOT NULL,
    color TEXT NOT NULL,
    changed_by_user_id INTEGER NOT NULL,
    changed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pixel_x, pixel_y, change_number)
  );
  CREATE TABLE IF NOT EXISTS MillionPixelUserTickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    total_pixeltickets INTEGER NOT NULL DEFAULT 1000,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);
console.log('[init-data] MillionPixel tables verified.');

db.close();
