import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
export const photoDataDirectory = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
fs.mkdirSync(photoDataDirectory, { recursive: true });
export const photosSqlite = new Database(path.join(photoDataDirectory, 'usersAddedProfileAndCoverImages.sqlite'));
photosSqlite.pragma('foreign_keys = ON');
photosSqlite.pragma('busy_timeout = 10000');
photosSqlite.exec(`
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    filename TEXT,
    caption TEXT NOT NULL DEFAULT '' CHECK(length(caption) <= 1000),
    purpose TEXT NOT NULL CHECK(purpose IN ('profile','cover','library')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, url)
  );
  CREATE INDEX IF NOT EXISTS photos_user ON photos(user_id, id);
  CREATE TABLE IF NOT EXISTS selections (
    user_id INTEGER PRIMARY KEY,
    profile_id INTEGER REFERENCES photos(id) ON DELETE SET NULL,
    cover_id INTEGER REFERENCES photos(id) ON DELETE SET NULL
  );
  CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY);
`);
photosSqlite.prepare('ATTACH DATABASE ? AS accounts').run(path.join(photoDataDirectory, 'database.sqlite'));
// Existing user URLs remain compatibility references; the library and selection records live here.
if (!photosSqlite.prepare('SELECT name FROM migrations WHERE name = ?').get('existing-profile-cover-v1')) {
    photosSqlite.transaction(() => {
        const users = photosSqlite.prepare('SELECT id, profile_image_url, cover_photo_url FROM accounts.users')
            .all();
        for (const user of users) {
            for (const [purpose, url] of [['profile', user.profile_image_url], ['cover', user.cover_photo_url]]) {
                if (!url || /defaultUminion|UminionLogo018\.00\.2024Classic/i.test(url))
                    continue;
                photosSqlite.prepare('INSERT OR IGNORE INTO photos (user_id,url,purpose) VALUES (?,?,?)').run(user.id, url, purpose);
                const photo = photosSqlite.prepare('SELECT id FROM photos WHERE user_id = ? AND url = ?').get(user.id, url);
                photosSqlite.prepare('INSERT OR IGNORE INTO selections(user_id) VALUES (?)').run(user.id);
                photosSqlite.prepare(`UPDATE selections SET ${purpose === 'profile' ? 'profile_id' : 'cover_id'} = ? WHERE user_id = ?`).run(photo.id, user.id);
            }
        }
        const legacyDirectory = path.join(photoDataDirectory, 'profile-images');
        if (fs.existsSync(legacyDirectory)) {
            const userIds = new Set(users.map(user => user.id));
            for (const entry of fs.readdirSync(legacyDirectory, { withFileTypes: true })) {
                const match = /^profile-(\d+)-\d+\.(?:jpe?g|png)$/i.exec(entry.name);
                if (!entry.isFile() || !match || !userIds.has(Number(match[1])))
                    continue;
                photosSqlite.prepare('INSERT OR IGNORE INTO photos(user_id,url,purpose) VALUES (?,?,?)')
                    .run(Number(match[1]), `/data/profile-images/${entry.name}`, 'profile');
            }
        }
        photosSqlite.prepare('INSERT INTO migrations(name) VALUES (?)').run('existing-profile-cover-v1');
    })();
}
export function photoSelection(userId) {
    const selected = photosSqlite.prepare(`
    SELECT p.url AS profile_image_url, c.url AS cover_photo_url
    FROM selections s LEFT JOIN photos p ON p.id = s.profile_id LEFT JOIN photos c ON c.id = s.cover_id
    WHERE s.user_id = ?
  `).get(userId);
    return selected || { profile_image_url: null, cover_photo_url: null };
}
