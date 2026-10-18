const quote = name => `"${name.replace(/"/g, '""')}"`;

function upgradeLegacyProducts(db) {
  const table = 'MainHubUpgradeV001ForProducts';
  const definition = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?").get(table);
  if (!definition) return;
  const legacyCheck = /CHECK\s*\(\s*store_type\s+IN\s*\(\s*'main'\s*,\s*'user'\s*\)\s*\)/i;
  if (!legacyCheck.test(definition.sql)) return;
  const foreignKeys = db.pragma('foreign_keys', { simple: true });
  db.pragma('foreign_keys = OFF');
  try {
    db.transaction(() => {
      const objects = db.prepare("SELECT sql FROM sqlite_master WHERE tbl_name = ? AND type IN ('index','trigger') AND sql IS NOT NULL").all(table);
      const sequence = db.prepare('SELECT seq FROM sqlite_sequence WHERE name = ?').get(table);
      const columns = db.prepare(`PRAGMA table_info(${quote(table)})`).all().filter(column => column.hidden === undefined || column.hidden === 0);
      const temporary = 'Testing01ProductsUpgrade';
      const sql = definition.sql.replace(
        /^CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:"[^"]+"|`[^`]+`|\[[^\]]+\]|[^\s(]+)/i,
        `CREATE TABLE ${quote(temporary)}`,
      ).replace(legacyCheck, "CHECK(store_type IN ('main', 'user', 'store'))");
      db.exec(sql);
      const fields = columns.map(column => quote(column.name)).join(',');
      db.exec(`INSERT INTO ${quote(temporary)} (${fields}) SELECT ${fields} FROM ${quote(table)}`);
      db.exec(`DROP TABLE ${quote(table)}`);
      db.exec(`ALTER TABLE ${quote(temporary)} RENAME TO ${quote(table)}`);
      for (const object of objects) db.exec(object.sql);
      if (sequence) {
        db.prepare('DELETE FROM sqlite_sequence WHERE name = ?').run(table);
        db.prepare('INSERT INTO sqlite_sequence(name,seq) VALUES (?,?)').run(table, sequence.seq);
      }
    })();
    console.log('[init-data] Upgraded legacy product store types without replacing product records.');
  } finally {
    db.pragma(`foreign_keys = ${foreignKeys ? 'ON' : 'OFF'}`);
  }
}

function ensureLegacyCore(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL,
      email TEXT, phone_number TEXT, profile_image_url TEXT, cover_photo_url TEXT
    );
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id1 INTEGER NOT NULL REFERENCES users(id),
      user_id2 INTEGER NOT NULL REFERENCES users(id), status TEXT NOT NULL, UNIQUE(user_id1,user_id2)
    );
    CREATE TABLE IF NOT EXISTS blocked_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, blocker_id INTEGER NOT NULL REFERENCES users(id),
      blocked_id INTEGER NOT NULL REFERENCES users(id), UNIQUE(blocker_id,blocked_id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, room TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id), is_anonymous INTEGER NOT NULL DEFAULT 0,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP, anonymous_username TEXT
    );
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT, reporter_id INTEGER NOT NULL REFERENCES users(id),
      reported_id INTEGER REFERENCES users(id), reason TEXT NOT NULL, images TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS user_chatrooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT, creator_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL, password TEXT, allow_anonymous INTEGER NOT NULL DEFAULT 1,
      background_color TEXT, font_color TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_active_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS chat_message_archives (
      id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT NOT NULL, archived_messages TEXT NOT NULL,
      archived_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS chat_reset_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT NOT NULL UNIQUE, timezone TEXT NOT NULL,
      last_reset_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS anonymous_counter (
      id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT NOT NULL UNIQUE, count INTEGER NOT NULL DEFAULT 0,
      last_reset_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS MainHubUpgradeV001ForProductTrash (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
      deleted_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS MainHubUpgradeV001ForInternalCart (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1, added_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS MainHubUpgradeV001ForCartItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS MainHubUpgradeV001ForLookingFor (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, store_id INTEGER NOT NULL,
      item_name TEXT NOT NULL, description TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS MainHubUpgradeV001ForStores (
      id INTEGER PRIMARY KEY AUTOINCREMENT, store_number INTEGER NOT NULL, store_name TEXT NOT NULL,
      store_type TEXT NOT NULL, chatroom_id INTEGER, description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function importLegacyEpisodes(db) {
  const exists = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='MainHubUpgradeV001ForEpisodes'").get();
  if (!exists) return;
  db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS Testing01BroadcastMap (
        legacy_id INTEGER PRIMARY KEY, broadcast_id INTEGER NOT NULL UNIQUE
      );
      CREATE TABLE IF NOT EXISTS Testing01EpisodeMap (
        legacy_id INTEGER PRIMARY KEY, episode_id INTEGER NOT NULL UNIQUE
      );
    `);
    const tableExists = name => !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name);
    for (const episode of db.prepare('SELECT * FROM MainHubUpgradeV001ForEpisodes ORDER BY id').all()) {
      if (db.prepare('SELECT 1 FROM Testing01EpisodeMap WHERE legacy_id=?').get(episode.id)) continue;
      const broadcast = db.prepare('SELECT * FROM MainHubUpgradeV001ForBroadcasts WHERE id=?').get(episode.broadcast_id);
      if (!broadcast || !db.prepare('SELECT 1 FROM users WHERE id=?').get(broadcast.user_id)) {
        throw new Error(`Legacy episode ${episode.id} has no valid broadcast owner; migration stopped.`);
      }
      let mapping = db.prepare('SELECT broadcast_id FROM Testing01BroadcastMap WHERE legacy_id=?').get(broadcast.id);
      if (!mapping) {
        const inserted = db.prepare('INSERT INTO UserBroadcasts(user_id,name) VALUES (?,?)').run(broadcast.user_id, broadcast.name);
        mapping = { broadcast_id: inserted.lastInsertRowid };
        db.prepare('INSERT INTO Testing01BroadcastMap VALUES (?,?)').run(broadcast.id, mapping.broadcast_id);
      }
      const tags = tableExists('MainHubUpgradeV001ForEpisodeTags')
        ? db.prepare('SELECT tag FROM MainHubUpgradeV001ForEpisodeTags WHERE episode_id=? ORDER BY id').all(episode.id).map(row => row.tag)
        : [];
      const images = tableExists('MainHubUpgradeV001ForEpisodeImages')
        ? db.prepare('SELECT image_url FROM MainHubUpgradeV001ForEpisodeImages WHERE episode_id=? ORDER BY id').all(episode.id)
        : [];
      const mediaType = /\.(mp4|webm|mov)(?:[?#]|$)/i.test(episode.media_url) ? 'video' : 'audio';
      const inserted = db.prepare(`INSERT INTO UserBroadcastEpisodes
        (broadcast_id,user_id,name,description,media_url,media_type,cover_image_url,scheduled_at,tags)
        VALUES (?,?,?,?,?,?,?,?,?)`).run(mapping.broadcast_id, broadcast.user_id, episode.name,
        episode.description, episode.media_url, mediaType, episode.cover_image_url, episode.scheduled_at, tags.join(', ') || null);
      const media = [{ url: episode.media_url, type: mediaType }, ...images.map(image => ({ url: image.image_url, type: 'image' }))];
      media.forEach((item, index) => db.prepare(`INSERT INTO UserBroadcastEpisodeMedia
        (episode_id,media_url,media_type,display_order) VALUES (?,?,?,?)`).run(inserted.lastInsertRowid, item.url, item.type, index));
      db.prepare('INSERT INTO Testing01EpisodeMap VALUES (?,?)').run(episode.id, inserted.lastInsertRowid);
    }
  })();
}

module.exports = { ensureLegacyCore, upgradeLegacyProducts, importLegacyEpisodes };
