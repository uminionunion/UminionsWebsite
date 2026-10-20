import type Database from 'better-sqlite3';

export const UNION_NEWS_14_MAX_PAGES = 183;
export const UNION_NEWS_14_ACTIVE_IMAGES = UNION_NEWS_14_MAX_PAGES * 2;

function archiveOverflow(database: Database.Database) {
  database.prepare(`
    INSERT INTO ArchiveImagesForUnionNews14 (image_id)
    SELECT id FROM MainHubUpgradeV001ForBroadcasts
    WHERE id NOT IN (SELECT image_id FROM ArchiveImagesForUnionNews14)
    ORDER BY display_order DESC, id DESC
    LIMIT -1 OFFSET ?
  `).run(UNION_NEWS_14_ACTIVE_IMAGES);
}

export function initializeUnionNewsArchive(database: Database.Database) {
  database.transaction(() => {
    database.exec(`
      CREATE TABLE IF NOT EXISTS ArchiveImagesForUnionNews14 (
        image_id INTEGER PRIMARY KEY REFERENCES MainHubUpgradeV001ForBroadcasts(id) ON DELETE RESTRICT,
        archived_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Keep original records/files intact, including legacy episode references.
    if (database.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='MainHubUpgradeV001ForBroadcasts'").get()) {
      archiveOverflow(database);
    }
  }).immediate();
}

export function addUnionNewsImage(database: Database.Database, image: {
  userId: number;
  title: string;
  imageUrl: string;
  clickUrl: string;
  description: string;
}): number {
  return database.transaction(() => {
    const inserted = database.prepare(`
      INSERT INTO MainHubUpgradeV001ForBroadcasts
        (user_id, name, image_url, click_url, description, display_order)
      VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM MainHubUpgradeV001ForBroadcasts))
    `).run(image.userId, image.title, image.imageUrl, image.clickUrl || null, image.description || null);
    archiveOverflow(database);
    return Number(inserted.lastInsertRowid);
  }).immediate();
}
