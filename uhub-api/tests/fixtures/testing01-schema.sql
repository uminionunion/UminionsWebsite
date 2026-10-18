CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL,
  email TEXT, phone_number TEXT, profile_image_url TEXT, cover_photo_url TEXT
);
CREATE TABLE MainHubUpgradeV001ForProducts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, subtitle TEXT, description TEXT,
  price REAL, image_url TEXT, store_type TEXT NOT NULL CHECK(store_type IN ('main', 'user')),
  user_id INTEGER, FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE MainHubUpgradeV001ForCartItems (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1, FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(product_id) REFERENCES MainHubUpgradeV001ForProducts(id)
);
CREATE TABLE MainHubUpgradeV001ForBroadcasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE MainHubUpgradeV001ForEpisodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT, broadcast_id INTEGER NOT NULL, name TEXT NOT NULL,
  subtitle TEXT, description TEXT, media_url TEXT NOT NULL, cover_image_url TEXT, scheduled_at DATETIME,
  FOREIGN KEY(broadcast_id) REFERENCES MainHubUpgradeV001ForBroadcasts(id)
);
CREATE TABLE MainHubUpgradeV001ForEpisodeImages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, episode_id INTEGER NOT NULL, image_url TEXT NOT NULL,
  FOREIGN KEY(episode_id) REFERENCES MainHubUpgradeV001ForEpisodes(id)
);
CREATE TABLE MainHubUpgradeV001ForEpisodeTags (
  id INTEGER PRIMARY KEY AUTOINCREMENT, episode_id INTEGER NOT NULL, tag TEXT NOT NULL,
  FOREIGN KEY(episode_id) REFERENCES MainHubUpgradeV001ForEpisodes(id)
);
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, room TEXT NOT NULL,
  user_id INTEGER, is_anonymous BOOLEAN NOT NULL DEFAULT 0, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  anonymous_username TEXT, FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id1 INTEGER NOT NULL, user_id2 INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'accepted')),
  FOREIGN KEY(user_id1) REFERENCES users(id), FOREIGN KEY(user_id2) REFERENCES users(id),
  UNIQUE(user_id1,user_id2)
);
CREATE TABLE blocked_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, blocker_id INTEGER NOT NULL, blocked_id INTEGER NOT NULL,
  FOREIGN KEY(blocker_id) REFERENCES users(id), FOREIGN KEY(blocked_id) REFERENCES users(id),
  UNIQUE(blocker_id,blocked_id)
);
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT, reporter_id INTEGER NOT NULL, reported_id INTEGER,
  reason TEXT NOT NULL, images TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(reporter_id) REFERENCES users(id), FOREIGN KEY(reported_id) REFERENCES users(id)
);
CREATE TABLE user_chatrooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT, creator_id INTEGER NOT NULL, title TEXT NOT NULL,
  password TEXT, allow_anonymous BOOLEAN NOT NULL DEFAULT 1, background_color TEXT, font_color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(creator_id) REFERENCES users(id)
);
