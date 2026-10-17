import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { requireAuth } from './auth-middleware.js';
import fs from 'fs';
import path from 'path';
import { sanitizeRichText } from './input-validation.js';

const router = Router();

// ==========================================
// BROADCASTS & EPISODES (User-Created)
// ==========================================

// Helper to ensure string
const getString = (val: any): string => {
  if (Array.isArray(val)) return val[0];
  return String(val || '');
};

type CarouselSlot = 'left' | 'left-top' | 'right' | 'cover' | 'bottom' | 'center';

const normalizeSlot = (slot: any): CarouselSlot | null => {
  const value = getString(slot);
  return value === 'left' || value === 'left-top' || value === 'right' || value === 'cover' || value === 'bottom' || value === 'center' ? value : null;
};

// Limits include the imported defaults, which are editable and removable like uploaded entries.
const getCarouselLimit = (slot: CarouselSlot) => slot === 'center' ? 49 : 10;

// About Us (button 9998) and Terms of Use (button 9999) pages are stored in the existing carousel table under
// private slots, so no migration is needed. title = '1'/'0' (enabled), description = HTML, price = last updated.
type SitePageKey = 'about' | 'terms' | 'welcome';
const sitePageSlot = (key: SitePageKey) => `page-${key}` as const;
const normalizePageKey = (value: any): SitePageKey | null => {
  const key = getString(value);
  return key === 'about' || key === 'terms' || key === 'welcome' ? key : null;
};
const sanitizePageHtml = sanitizeRichText;
const isHighHighHighAdmin = async (userId: number) => {
  const user = await db.selectFrom('users').select('is_high_high_high_admin').where('id', '=', userId).executeTakeFirst();
  return user?.is_high_high_high_admin === 1;
};
const loadSitePage = async (key: SitePageKey) => {
  const row = await db.selectFrom('UhubManagedCarouselItems').selectAll().where('slot', '=', sitePageSlot(key)).executeTakeFirst();
  return { content: sanitizePageHtml(row?.description || ''), enabled: row ? row.title !== '0' : false, lastUpdated: row?.price || '' };
};

const isSafeWebsite = (value: string) => !value || /^(https?:\/\/|www\.)/i.test(value);
const normalizeWebsite = (value: string) => /^www\./i.test(value) ? `https://${value}` : value;

const getIndexedBodyValue = (body: any, name: string, index: number) => {
  const direct = body?.[`${name}_${index}`];
  if (direct !== undefined) return getString(direct).trim();
  const grouped = body?.[name];
  if (Array.isArray(grouped)) return getString(grouped[index]).trim();
  return index === 0 ? getString(grouped).trim() : '';
};

const getUploadedFiles = (req: Request) => {
  const uploaded = (req as any).files?.images || (req as any).files?.image;
  if (!uploaded) return [];
  return Array.isArray(uploaded) ? uploaded : [uploaded];
};

async function attachEpisodeMedia(episodes: any[]) {
  if (!episodes.length) return episodes;
  const media = await db
    .selectFrom('UserBroadcastEpisodeMedia')
    .selectAll()
    .where('episode_id', 'in', episodes.map((episode) => episode.id))
    .orderBy('display_order', 'asc')
    .execute();
  return episodes.map((episode) => ({
    ...episode,
    media: media.filter((item) => item.episode_id === episode.id),
  }));
}

router.get('/api/carousels/:slot/items', async (req: Request, res: Response) => {
  try {
    const slot = normalizeSlot(req.params.slot);
    if (!slot) return res.status(400).json({ error: 'Invalid carousel slot' });
    const items = await db
      .selectFrom('UhubManagedCarouselItems')
      .selectAll()
      .where('slot', '=', slot)
      .orderBy('display_order', 'asc')
      .execute();
    res.json({ items });
  } catch (error) {
    console.error('[CAROUSELS] Error loading carousel items:', error);
    res.status(500).json({ error: 'Failed to load carousel items' });
  }
});

router.post('/api/carousels/:slot/items/replace', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await db
      .selectFrom('users')
      .select('is_high_high_high_admin')
      .where('id', '=', req.user!.userId)
      .executeTakeFirst();
    if (user?.is_high_high_high_admin !== 1) return res.status(403).json({ error: 'High-high-high admin only' });
    const slot = normalizeSlot(req.params.slot);
    if (!slot) return res.status(400).json({ error: 'Invalid carousel slot' });
    const files = getUploadedFiles(req);
    let requestedItems: any[] | null = null;
    if (req.body?.items !== undefined) {
      try {
        const parsedItems: unknown = JSON.parse(getString(req.body.items));
        if (!Array.isArray(parsedItems)) return res.status(400).json({ error: 'Carousel items must be a list' });
        requestedItems = parsedItems;
      } catch {
        return res.status(400).json({ error: 'Carousel items are invalid' });
      }
    }
    const limit = getCarouselLimit(slot);
    if (requestedItems !== null && (!Array.isArray(requestedItems) || requestedItems.length > limit)) {
      return res.status(400).json({ error: `This collection can contain up to ${limit} entries` });
    }
    if (files.length > limit) return res.status(400).json({ error: `This collection can contain up to ${limit} entries` });
    if (!requestedItems && (!files.length || files.length > limit)) {
      return res.status(400).json({ error: `Add between 1 and ${limit} images` });
    }

    const carouselDirectory = path.join(process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data'), 'uploads', 'managed-carousels', slot);
    fs.mkdirSync(carouselDirectory, { recursive: true });
    const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
    const existingItems = await db
      .selectFrom('UhubManagedCarouselItems')
      .selectAll()
      .where('slot', '=', slot)
      .execute();
    if (requestedItems?.some(item => !item || typeof item !== 'object')) {
      return res.status(400).json({ error: 'Carousel items are invalid' });
    }
    if (requestedItems) {
      for (const item of requestedItems) {
        if (item.uploadIndex !== null && item.uploadIndex !== undefined) {
          const uploadIndex = Number(item.uploadIndex);
          if (!Number.isInteger(uploadIndex) || uploadIndex < 0 || uploadIndex >= files.length) {
            return res.status(400).json({ error: 'Carousel image upload is missing' });
          }
          if (!allowedExtensions.has(path.extname(files[uploadIndex].name).toLowerCase())) {
            return res.status(400).json({ error: 'Only image uploads are allowed' });
          }
        }
      }
    } else if (files.some(file => !allowedExtensions.has(path.extname(file.name).toLowerCase()))) {
      return res.status(400).json({ error: 'Only image uploads are allowed' });
    }
    const values: Array<{
      id?: number;
      slot: CarouselSlot;
      image_url: string;
      title: string | null;
      description: string | null;
      price: string | null;
      website: string | null;
      display_order: number;
    }> = [];
    const writtenFiles: string[] = [];

    if (requestedItems) {
      const existingById = new Map(existingItems.map(item => [item.id, item]));
      for (let index = 0; index < requestedItems.length; index += 1) {
        const item = requestedItems[index];
        const existing = item.id === null || item.id === undefined ? undefined : existingById.get(Number(item.id));
        if (item.id !== null && item.id !== undefined && !existing) {
          return res.status(400).json({ error: 'Carousel item does not belong to this carousel' });
        }
        let imageUrl = existing?.image_url;
        if (item.uploadIndex !== null && item.uploadIndex !== undefined) {
          const uploadIndex = Number(item.uploadIndex);
          const file = files[uploadIndex];
          if (!Number.isInteger(uploadIndex) || !file) {
            return res.status(400).json({ error: 'Carousel image upload is missing' });
          }
          const extension = path.extname(file.name).toLowerCase();
          const fileName = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 10)}${extension}`;
          const filePath = path.join(carouselDirectory, fileName);
          await file.mv(filePath);
          writtenFiles.push(filePath);
          imageUrl = `/api/uploads/managed-carousels/${slot}/${fileName}`;
        }
        const title = getString(item.title).trim();
        const website = getString(item.website).trim();
        if (!isSafeWebsite(website)) return res.status(400).json({ error: 'Links must start with http://, https:// or www.' });
        // Bottom carousel entries may be caption-only; the image column stores an empty string for them.
        if (!imageUrl && !(slot === 'bottom' && title)) {
          return res.status(400).json({ error: slot === 'bottom' ? 'Each entry needs an image or a caption' : 'Each carousel item must have an image' });
        }
        values.push({
          ...(existing ? { id: existing.id } : {}),
          slot,
          image_url: imageUrl || '',
          title: title || null,
          description: getString(item.description).trim() || null,
          price: getString(item.price).trim() || null,
          website: normalizeWebsite(website) || null,
          display_order: index,
        });
      }
    } else {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const extension = path.extname(file.name).toLowerCase();
        const fileName = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 10)}${extension}`;
        const filePath = path.join(carouselDirectory, fileName);
        await file.mv(filePath);
        writtenFiles.push(filePath);
        values.push({
          slot,
          image_url: `/api/uploads/managed-carousels/${slot}/${fileName}`,
          title: getIndexedBodyValue(req.body, 'title', index) || null,
          description: getIndexedBodyValue(req.body, 'description', index) || null,
          price: getIndexedBodyValue(req.body, 'price', index) || null,
          website: getIndexedBodyValue(req.body, 'website', index) || null,
          display_order: index,
        });
      }
    }

    try {
      await db.transaction().execute(async (trx) => {
        const retainedIds = values.flatMap(value => value.id === undefined ? [] : [value.id]);
        if (retainedIds.length) {
          await trx.deleteFrom('UhubManagedCarouselItems').where('slot', '=', slot).where('id', 'not in', retainedIds).execute();
        } else {
          await trx.deleteFrom('UhubManagedCarouselItems').where('slot', '=', slot).execute();
        }
        for (const value of values) {
          if (value.id !== undefined) {
            const { id, ...update } = value;
            await trx.updateTable('UhubManagedCarouselItems').set(update).where('id', '=', id).where('slot', '=', slot).execute();
          } else {
            const { id: _unusedId, ...insert } = value;
            await trx.insertInto('UhubManagedCarouselItems').values(insert).execute();
          }
        }
      });
    } catch (error) {
      for (const filePath of writtenFiles) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      throw error;
    }

    const oldImageUrls = existingItems
      .filter(item => !values.some(value => value.id === item.id && value.image_url === item.image_url))
      .map(item => item.image_url);
    for (const imageUrl of oldImageUrls) {
      const managedPrefix = `/api/uploads/managed-carousels/${slot}/`;
      const fileName = path.basename(imageUrl);
      if (!imageUrl.startsWith(managedPrefix) || imageUrl !== `${managedPrefix}${fileName}`) continue;
      const filePath = path.join(carouselDirectory, fileName);
      if (path.dirname(filePath) === carouselDirectory && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(201).json({ items: values });
  } catch (error) {
    console.error('[CAROUSELS] Error replacing carousel items:', error);
    res.status(500).json({ error: 'Failed to replace carousel items' });
  }
});

router.get('/api/site-pages/:key', async (req: Request, res: Response) => {
  try {
    const key = normalizePageKey(req.params.key);
    if (!key) return res.status(400).json({ error: 'Invalid page' });
    res.json(await loadSitePage(key));
  } catch (error) {
    console.error('[SITE PAGES] Error loading page:', error);
    res.status(500).json({ error: 'Failed to load page' });
  }
});

router.put('/api/site-pages/:key', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!(await isHighHighHighAdmin(req.user!.userId))) return res.status(403).json({ error: 'High-high-high admin only' });
    const key = normalizePageKey(req.params.key);
    if (!key) return res.status(400).json({ error: 'Invalid page' });
    const current = await loadSitePage(key);
    const content = typeof req.body?.content === 'string' ? sanitizePageHtml(req.body.content).slice(0, 200000) : current.content;
    const enabled = typeof req.body?.enabled === 'boolean' ? req.body.enabled : current.enabled;
    const lastUpdated = typeof req.body?.lastUpdated === 'string' ? req.body.lastUpdated.slice(0, 100) : current.lastUpdated;
    const slot = sitePageSlot(key);
    const existing = await db.selectFrom('UhubManagedCarouselItems').select('id').where('slot', '=', slot).executeTakeFirst();
    const values = { image_url: '', title: enabled ? '1' : '0', description: content, price: lastUpdated || null };
    if (existing) await db.updateTable('UhubManagedCarouselItems').set(values).where('id', '=', existing.id).execute();
    else await db.insertInto('UhubManagedCarouselItems').values({ ...values, slot, display_order: 0, website: null }).execute();
    res.json(await loadSitePage(key));
  } catch (error) {
    console.error('[SITE PAGES] Error saving page:', error);
    res.status(500).json({ error: 'Failed to save page' });
  }
});

router.post('/api/site-pages/:key/image', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!(await isHighHighHighAdmin(req.user!.userId))) return res.status(403).json({ error: 'High-high-high admin only' });
    const key = normalizePageKey(req.params.key);
    if (!key) return res.status(400).json({ error: 'Invalid page' });
    const file = getUploadedFiles(req)[0];
    if (!file) return res.status(400).json({ error: 'Choose an image' });
    const extension = path.extname(file.name).toLowerCase();
    if (!new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']).has(extension)) return res.status(400).json({ error: 'Only image uploads are allowed' });
    const directory = path.join(process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data'), 'uploads', 'managed-carousels', `page-${key}`);
    fs.mkdirSync(directory, { recursive: true });
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`;
    await file.mv(path.join(directory, fileName));
    res.status(201).json({ url: `/api/uploads/managed-carousels/page-${key}/${fileName}` });
  } catch (error) {
    console.error('[SITE PAGES] Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Create a new broadcast (the container; episodes go inside).
router.post('/api/broadcasts', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const name = getString(req.body?.name || '');

    if (!name.trim()) {
      return res.status(400).json({ error: 'Broadcast name is required' });
    }

    const { count } = await db
      .selectFrom('UserBroadcasts')
      .select(db.fn.countAll().as('count'))
      .where('user_id', '=', userId)
      .executeTakeFirstOrThrow();
    if (Number(count) >= 7) {
      return res.status(400).json({ error: 'You can create up to 7 broadcasts.' });
    }

    const result = await db
      .insertInto('UserBroadcasts')
      .values({ user_id: userId, name: name.trim() })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.status(201).json({ id: result.id, message: 'Broadcast created' });
  } catch (error) {
    console.error('[BROADCASTS] Error creating broadcast:', error);
    res.status(500).json({ error: 'Failed to create broadcast' });
  }
});

// List user's broadcasts.
router.get('/api/broadcasts/by-user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(getString(req.params.userId), 10);
    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const broadcasts = await db
      .selectFrom('UserBroadcasts')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .execute();

    res.json(broadcasts);
  } catch (error) {
    console.error('[BROADCASTS] Error fetching broadcasts:', error);
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
});

// Create an episode inside a broadcast.
router.post('/api/broadcasts/:broadcastId/episodes', requireAuth, async (req: Request, res: Response) => {
  try {
    const broadcastId = parseInt(getString(req.params.broadcastId), 10);
    const userId = (req as any).user?.userId;
    const name = getString(req.body?.name || '');
    const { description, media_url, media_type, cover_image_url, scheduled_at, tags, website } = req.body;
    const media = Array.isArray(req.body?.media)
      ? req.body.media.filter((item: any) => item?.url && item?.type)
      : media_url ? [{ url: media_url, type: media_type || 'audio' }] : [];

    if (!name.trim()) {
      return res.status(400).json({ error: 'Episode name is required' });
    }

    const ownedBroadcast = await db
      .selectFrom('UserBroadcasts')
      .select('id')
      .where('id', '=', broadcastId)
      .where('user_id', '=', userId)
      .executeTakeFirst();
    if (!ownedBroadcast) {
      return res.status(403).json({ error: 'You can only add episodes to your own broadcasts.' });
    }

    const { count } = await db
      .selectFrom('UserBroadcastEpisodes')
      .select(db.fn.countAll().as('count'))
      .where('broadcast_id', '=', broadcastId)
      .executeTakeFirstOrThrow();
    if (Number(count) >= 100) {
      return res.status(400).json({ error: 'Each broadcast can have up to 100 episodes.' });
    }

    const result = await db.transaction().execute(async (trx) => {
      const episode = await trx
        .insertInto('UserBroadcastEpisodes')
        .values({
          broadcast_id: broadcastId,
          user_id: userId,
          name: name.trim(),
          description: description?.trim() || null,
          media_url: media[0]?.url || null,
          media_type: media[0]?.type || null,
          cover_image_url: cover_image_url || null,
          scheduled_at: scheduled_at || null,
          tags: tags || null,
          website: website || null,
        })
        .returning('id')
        .executeTakeFirstOrThrow();

      if (media.length) {
        await trx.insertInto('UserBroadcastEpisodeMedia').values(
          media.map((item: any, displayOrder: number) => ({
            episode_id: episode.id,
            media_url: item.url,
            media_type: item.type,
            display_order: displayOrder,
          }))
        ).execute();
      }
      return episode;
    });

    res.status(201).json({ id: result.id, message: 'Episode created' });
  } catch (error) {
    console.error('[BROADCASTS] Error creating episode:', error);
    res.status(500).json({ error: 'Failed to create episode' });
  }
});

// List episodes for a specific broadcast.
router.get('/api/broadcasts/:broadcastId/episodes', async (req: Request, res: Response) => {
  try {
    const broadcastId = parseInt(getString(req.params.broadcastId), 10);
    const offset = parseInt(getString(req.query.offset || '0'), 10);
    const limit = parseInt(getString(req.query.limit || '3'), 10);

    if (!Number.isFinite(broadcastId)) {
      return res.status(400).json({ error: 'Invalid broadcastId' });
    }

    const { count } = await db
      .selectFrom('UserBroadcastEpisodes')
      .select(db.fn.countAll().as('count'))
      .where('broadcast_id', '=', broadcastId)
      .executeTakeFirstOrThrow();

    const episodes = await db
      .selectFrom('UserBroadcastEpisodes')
      .selectAll()
      .where('broadcast_id', '=', broadcastId)
      .orderBy('scheduled_at', 'desc')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    res.json({ episodes: await attachEpisodeMedia(episodes), total: Number(count) });
  } catch (error) {
    console.error('[BROADCASTS] Error fetching episodes:', error);
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
});

router.get('/api/episodes/by-user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(getString(req.params.userId), 10);
    const offset = Math.max(0, parseInt(getString(req.query.offset || '0'), 10) || 0);
    const limit = Math.min(100, Math.max(1, parseInt(getString(req.query.limit || '3'), 10) || 3));
    if (!Number.isFinite(userId)) return res.status(400).json({ error: 'Invalid user id' });

    const [{ count }, episodes] = await Promise.all([
      db.selectFrom('UserBroadcastEpisodes').select(db.fn.countAll().as('count')).where('user_id', '=', userId).executeTakeFirstOrThrow(),
      db.selectFrom('UserBroadcastEpisodes').selectAll().where('user_id', '=', userId).orderBy('created_at', 'desc').limit(limit).offset(offset).execute(),
    ]);
    res.json({ episodes: await attachEpisodeMedia(episodes), total: Number(count) });
  } catch (error) {
    console.error('[BROADCASTS] Error fetching user episodes:', error);
    res.status(500).json({ error: 'Failed to fetch user episodes' });
  }
});

router.get('/api/episodes/scheduled', async (_req: Request, res: Response) => {
  try {
    const now = new Date().toISOString();
    const episode = await db
      .selectFrom('UserBroadcastEpisodes')
      .selectAll()
      .where('scheduled_at', '<=', now)
      .where('last_played_at', 'is', null)
      .where('media_url', 'is not', null)
      .orderBy('scheduled_at', 'asc')
      .executeTakeFirst();
    // When nothing is due yet, tell the client when the next one is so it can set one timer instead of polling.
    const upcoming = episode
      ? null
      : await db
          .selectFrom('UserBroadcastEpisodes')
          .select('scheduled_at')
          .where('scheduled_at', '>', now)
          .where('last_played_at', 'is', null)
          .where('media_url', 'is not', null)
          .orderBy('scheduled_at', 'asc')
          .executeTakeFirst();
    res.json({
      episode: episode ? (await attachEpisodeMedia([episode]))[0] : null,
      next_scheduled_at: upcoming?.scheduled_at ?? null,
    });
  } catch (error) {
    console.error('[BROADCASTS] Error fetching scheduled episode:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled episode' });
  }
});

// Calendar entries include both future and completed episodes. The UI uses last_played_at to
// decide whether replay and voting controls should be available.
router.get('/api/episodes/calendar', async (_req: Request, res: Response) => {
  try {
    const episodes = await db
      .selectFrom('UserBroadcastEpisodes')
      .selectAll()
      .where('scheduled_at', 'is not', null)
      .orderBy('scheduled_at', 'asc')
      .limit(500)
      .execute();
    res.json({ episodes: await attachEpisodeMedia(episodes) });
  } catch (error) {
    console.error('[BROADCASTS] Error fetching calendar episodes:', error);
    res.status(500).json({ error: 'Failed to fetch calendar episodes' });
  }
});

// Record a completed playback so episodes are eligible for the user-broadcast archive.
router.post('/api/episodes/:id/played', async (req: Request, res: Response) => {
  try {
    const episodeId = parseInt(getString(req.params.id), 10);
    if (!Number.isFinite(episodeId)) {
      return res.status(400).json({ error: 'Invalid episode id' });
    }

    const episode = await db.selectFrom('UserBroadcastEpisodes').select('id').where('id', '=', episodeId).executeTakeFirst();
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    await db.transaction().execute(async (trx) => {
      await trx.insertInto('UserBroadcastEpisodePlays').values({ episode_id: episodeId }).execute();
      await trx
        .updateTable('UserBroadcastEpisodes')
        .set((eb) => ({ last_played_at: new Date().toISOString(), play_count: eb('play_count', '+', 1) }))
        .where('id', '=', episodeId)
        .execute();
    });

    res.status(201).json({ message: 'Episode playback recorded' });
  } catch (error) {
    console.error('[BROADCASTS] Error recording episode playback:', error);
    res.status(500).json({ error: 'Failed to record episode playback' });
  }
});

// The migrated episode archive contains completed plays only; voting remains authenticated.
router.get('/api/episode-archive/:mode', async (req: Request, res: Response) => {
  try {
    const mode = getString(req.params.mode);
    let query = db
      .selectFrom('UserBroadcastEpisodes')
      .selectAll()
      .where('play_count', '>', 0);

    if (mode === 'recent') {
      query = query.orderBy('last_played_at', 'desc');
    } else if (mode === 'popular') {
      query = query.orderBy('upvotes', 'desc').orderBy('downvotes', 'asc');
    } else if (mode === 'random') {
      query = query.orderBy(db.fn('random', []));
    } else {
      return res.status(400).json({ error: 'Archive mode must be recent, popular, or random' });
    }

    const episodes = await query.limit(100).execute();
    res.json({ episodes: await attachEpisodeMedia(episodes) });
  } catch (error) {
    console.error('[BROADCASTS] Error fetching episode archive:', error);
    res.status(500).json({ error: 'Failed to fetch episode archive' });
  }
});

// Get a single episode (for detail view).
router.get('/api/episodes/:id', async (req: Request, res: Response) => {
  try {
    const episodeId = parseInt(getString(req.params.id), 10);

    const episode = await db
      .selectFrom('UserBroadcastEpisodes')
      .selectAll()
      .where('id', '=', episodeId)
      .executeTakeFirst();

    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    res.json(episode);
  } catch (error) {
    console.error('[BROADCASTS] Error fetching episode:', error);
    res.status(500).json({ error: 'Failed to fetch episode' });
  }
});

// Edit an episode (owner only).
router.put('/api/episodes/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const episodeId = parseInt(getString(req.params.id), 10);
    const userId = (req as any).user?.userId;
    const name = getString(req.body?.name || '');
    const { description } = req.body;

    if (!name.trim()) {
      return res.status(400).json({ error: 'Episode name is required' });
    }

    const result = await db
      .updateTable('UserBroadcastEpisodes')
      .set({
        name: name.trim(),
        description: description?.trim() || null,
        is_edited: 1,
      })
      .where('id', '=', episodeId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (!result.numUpdatedRows) {
      return res.status(404).json({ error: 'Episode not found or not owned by you' });
    }

    res.json({ message: 'Episode updated' });
  } catch (error) {
    console.error('[BROADCASTS] Error editing episode:', error);
    res.status(500).json({ error: 'Failed to edit episode' });
  }
});

// Delete an episode (owner only).
router.delete('/api/episodes/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const episodeId = parseInt(getString(req.params.id), 10);
    const userId = (req as any).user?.userId;

    await db
      .deleteFrom('UserBroadcastEpisodes')
      .where('id', '=', episodeId)
      .where('user_id', '=', userId)
      .execute();

    res.json({ message: 'Episode deleted' });
  } catch (error) {
    console.error('[BROADCASTS] Error deleting episode:', error);
    res.status(500).json({ error: 'Failed to delete episode' });
  }
});

// Upvote an episode.
router.post('/api/episodes/:id/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const episodeId = parseInt(getString(req.params.id), 10);
    const userId = (req as any).user?.userId;

    const existingVote = await db
      .selectFrom('UserBroadcastEpisodeVotes')
      .selectAll()
      .where('episode_id', '=', episodeId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (existingVote?.vote_type === 1) {
      await db.deleteFrom('UserBroadcastEpisodeVotes').where('id', '=', existingVote.id).execute();
      await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ upvotes: eb('upvotes', '-', 1) })).where('id', '=', episodeId).execute();
    } else if (existingVote?.vote_type === -1) {
      await db.updateTable('UserBroadcastEpisodeVotes').set({ vote_type: 1 }).where('id', '=', existingVote.id).execute();
      await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ upvotes: eb('upvotes', '+', 1), downvotes: eb('downvotes', '-', 1) })).where('id', '=', episodeId).execute();
    } else {
      await db.insertInto('UserBroadcastEpisodeVotes').values({ episode_id: episodeId, user_id: userId, vote_type: 1 }).execute();
      await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ upvotes: eb('upvotes', '+', 1) })).where('id', '=', episodeId).execute();
    }

    const episode = await db.selectFrom('UserBroadcastEpisodes').select(['upvotes', 'downvotes']).where('id', '=', episodeId).executeTakeFirst();
    res.json({ upvotes: episode?.upvotes || 0, downvotes: episode?.downvotes || 0 });
  } catch (error) {
    console.error('[BROADCASTS] Error upvoting episode:', error);
    res.status(500).json({ error: 'Upvote failed' });
  }
});

// Downvote an episode.
router.post('/api/episodes/:id/downvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const episodeId = parseInt(getString(req.params.id), 10);
    const userId = (req as any).user?.userId;

    const existingVote = await db
      .selectFrom('UserBroadcastEpisodeVotes')
      .selectAll()
      .where('episode_id', '=', episodeId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (existingVote?.vote_type === -1) {
      await db.deleteFrom('UserBroadcastEpisodeVotes').where('id', '=', existingVote.id).execute();
      await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ downvotes: eb('downvotes', '-', 1) })).where('id', '=', episodeId).execute();
    } else if (existingVote?.vote_type === 1) {
      await db.updateTable('UserBroadcastEpisodeVotes').set({ vote_type: -1 }).where('id', '=', existingVote.id).execute();
      await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ downvotes: eb('downvotes', '+', 1), upvotes: eb('upvotes', '-', 1) })).where('id', '=', episodeId).execute();
    } else {
      await db.insertInto('UserBroadcastEpisodeVotes').values({ episode_id: episodeId, user_id: userId, vote_type: -1 }).execute();
      await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ downvotes: eb('downvotes', '+', 1) })).where('id', '=', episodeId).execute();
    }

    const episode = await db.selectFrom('UserBroadcastEpisodes').select(['upvotes', 'downvotes']).where('id', '=', episodeId).executeTakeFirst();
    res.json({ upvotes: episode?.upvotes || 0, downvotes: episode?.downvotes || 0 });
  } catch (error) {
    console.error('[BROADCASTS] Error downvoting episode:', error);
    res.status(500).json({ error: 'Downvote failed' });
  }
});

// Favorite an episode.
router.post('/api/episodes/:id/favorite', requireAuth, async (req: Request, res: Response) => {
  try {
    const episodeId = parseInt(getString(req.params.id), 10);
    const userId = (req as any).user?.userId;

    const existingFavorite = await db
      .selectFrom('UserBroadcastEpisodeFavorites')
      .select('id')
      .where('episode_id', '=', episodeId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (existingFavorite) {
      await db.deleteFrom('UserBroadcastEpisodeFavorites').where('id', '=', existingFavorite.id).execute();
      return res.json({ isFavorited: false });
    }

    await db.insertInto('UserBroadcastEpisodeFavorites').values({ episode_id: episodeId, user_id: userId }).execute();
    res.json({ isFavorited: true });
  } catch (error) {
    console.error('[BROADCASTS] Error favoriting episode:', error);
    res.status(500).json({ error: 'Favorite failed' });
  }
});

// Get episode comments.
router.get('/api/episodes/:id/comments', async (req: Request, res: Response) => {
  try {
    const episodeId = parseInt(getString(req.params.id), 10);
    const comments = await db
      .selectFrom('UserBroadcastEpisodeComments')
      .selectAll()
      .where('episode_id', '=', episodeId)
      .orderBy('created_at', 'asc')
      .execute();
    res.json(comments);
  } catch (error) {
    console.error('[BROADCASTS] Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a comment to an episode.
router.post('/api/episodes/:id/comments', requireAuth, async (req: Request, res: Response) => {
  try {
    const episodeId = parseInt(getString(req.params.id), 10);
    const userId = (req as any).user?.userId;
    const content = getString(req.body?.content || '');

    if (!content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const result = await db
      .insertInto('UserBroadcastEpisodeComments')
      .values({ episode_id: episodeId, user_id: userId, content: content.trim() })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.status(201).json({ id: result.id, message: 'Comment added' });
  } catch (error) {
    console.error('[BROADCASTS] Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
