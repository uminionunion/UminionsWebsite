import { Router } from 'express';
import { db } from './db.js';
import { requireAuth } from './auth-middleware.js';
import { broadcastEvents } from './broadcast-events.js';
import fs from 'fs';
import path from 'path';
const router = Router();
// ==========================================
// BROADCASTS & EPISODES (User-Created)
// ==========================================
// Helper to ensure string
const getString = (val) => {
    if (Array.isArray(val))
        return val[0];
    return String(val || '');
};
const normalizeSlot = (slot) => {
    const value = getString(slot);
    return value === 'left' || value === 'right' ? value : null;
};
const getIndexedBodyValue = (body, name, index) => {
    const direct = body?.[`${name}_${index}`];
    if (direct !== undefined)
        return getString(direct).trim();
    const grouped = body?.[name];
    if (Array.isArray(grouped))
        return getString(grouped[index]).trim();
    return index === 0 ? getString(grouped).trim() : '';
};
const getUploadedFiles = (req) => {
    const uploaded = req.files?.images || req.files?.image;
    if (!uploaded)
        return [];
    return Array.isArray(uploaded) ? uploaded : [uploaded];
};
async function attachEpisodeMedia(episodes) {
    if (!episodes.length)
        return episodes;
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
router.get('/api/carousels/:slot/items', async (req, res) => {
    try {
        const slot = normalizeSlot(req.params.slot);
        if (!slot)
            return res.status(400).json({ error: 'Invalid carousel slot' });
        const items = await db
            .selectFrom('UhubManagedCarouselItems')
            .selectAll()
            .where('slot', '=', slot)
            .orderBy('display_order', 'asc')
            .execute();
        res.json({ items });
    }
    catch (error) {
        console.error('[CAROUSELS] Error loading carousel items:', error);
        res.status(500).json({ error: 'Failed to load carousel items' });
    }
});
router.post('/api/carousels/:slot/items/replace', requireAuth, async (req, res) => {
    try {
        if (req.user?.userId !== 1)
            return res.status(403).json({ error: 'Admin only' });
        const slot = normalizeSlot(req.params.slot);
        if (!slot)
            return res.status(400).json({ error: 'Invalid carousel slot' });
        const files = getUploadedFiles(req).slice(0, 100);
        if (!files.length)
            return res.status(400).json({ error: 'Add at least one image' });
        const carouselDirectory = path.join(process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data'), 'uploads', 'managed-carousels', slot);
        fs.mkdirSync(carouselDirectory, { recursive: true });
        const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
        const values = [];
        for (let index = 0; index < files.length; index += 1) {
            const file = files[index];
            const extension = path.extname(file.name).toLowerCase();
            if (!allowedExtensions.has(extension))
                return res.status(400).json({ error: 'Only image uploads are allowed' });
            const fileName = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 10)}${extension}`;
            await file.mv(path.join(carouselDirectory, fileName));
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
        await db.transaction().execute(async (trx) => {
            await trx.deleteFrom('UhubManagedCarouselItems').where('slot', '=', slot).execute();
            await trx.insertInto('UhubManagedCarouselItems').values(values).execute();
        });
        res.status(201).json({ items: values });
    }
    catch (error) {
        console.error('[CAROUSELS] Error replacing carousel items:', error);
        res.status(500).json({ error: 'Failed to replace carousel items' });
    }
});
// Create a new broadcast (the container; episodes go inside).
router.post('/api/broadcasts', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
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
        broadcastEvents.emit('broadcastUpdated', { kind: 'broadcast-created', id: result.id });
        res.status(201).json({ id: result.id, message: 'Broadcast created' });
    }
    catch (error) {
        console.error('[BROADCASTS] Error creating broadcast:', error);
        res.status(500).json({ error: 'Failed to create broadcast' });
    }
});
// List user's broadcasts.
router.get('/api/broadcasts/by-user/:userId', async (req, res) => {
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
    }
    catch (error) {
        console.error('[BROADCASTS] Error fetching broadcasts:', error);
        res.status(500).json({ error: 'Failed to fetch broadcasts' });
    }
});
// Create an episode inside a broadcast.
router.post('/api/broadcasts/:broadcastId/episodes', requireAuth, async (req, res) => {
    try {
        const broadcastId = parseInt(getString(req.params.broadcastId), 10);
        const userId = req.user?.userId;
        const name = getString(req.body?.name || '');
        const { description, media_url, media_type, cover_image_url, scheduled_at, tags, website } = req.body;
        const media = Array.isArray(req.body?.media)
            ? req.body.media.filter((item) => item?.url && item?.type)
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
                await trx.insertInto('UserBroadcastEpisodeMedia').values(media.map((item, displayOrder) => ({
                    episode_id: episode.id,
                    media_url: item.url,
                    media_type: item.type,
                    display_order: displayOrder,
                }))).execute();
            }
            return episode;
        });
        broadcastEvents.emit('broadcastUpdated', { kind: 'episode-created', id: result.id, broadcastId });
        res.status(201).json({ id: result.id, message: 'Episode created' });
    }
    catch (error) {
        console.error('[BROADCASTS] Error creating episode:', error);
        res.status(500).json({ error: 'Failed to create episode' });
    }
});
// List episodes for a specific broadcast.
router.get('/api/broadcasts/:broadcastId/episodes', async (req, res) => {
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
    }
    catch (error) {
        console.error('[BROADCASTS] Error fetching episodes:', error);
        res.status(500).json({ error: 'Failed to fetch episodes' });
    }
});
router.get('/api/episodes/by-user/:userId', async (req, res) => {
    try {
        const userId = parseInt(getString(req.params.userId), 10);
        const offset = Math.max(0, parseInt(getString(req.query.offset || '0'), 10) || 0);
        const limit = Math.min(100, Math.max(1, parseInt(getString(req.query.limit || '3'), 10) || 3));
        if (!Number.isFinite(userId))
            return res.status(400).json({ error: 'Invalid user id' });
        const [{ count }, episodes] = await Promise.all([
            db.selectFrom('UserBroadcastEpisodes').select(db.fn.countAll().as('count')).where('user_id', '=', userId).executeTakeFirstOrThrow(),
            db.selectFrom('UserBroadcastEpisodes').selectAll().where('user_id', '=', userId).orderBy('created_at', 'desc').limit(limit).offset(offset).execute(),
        ]);
        res.json({ episodes: await attachEpisodeMedia(episodes), total: Number(count) });
    }
    catch (error) {
        console.error('[BROADCASTS] Error fetching user episodes:', error);
        res.status(500).json({ error: 'Failed to fetch user episodes' });
    }
});
router.get('/api/episodes/scheduled', async (_req, res) => {
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
        res.json({ episode: episode ? (await attachEpisodeMedia([episode]))[0] : null });
    }
    catch (error) {
        console.error('[BROADCASTS] Error fetching scheduled episode:', error);
        res.status(500).json({ error: 'Failed to fetch scheduled episode' });
    }
});
// Calendar entries include both future and completed episodes. The UI uses last_played_at to
// decide whether replay and voting controls should be available.
router.get('/api/episodes/calendar', async (_req, res) => {
    try {
        const episodes = await db
            .selectFrom('UserBroadcastEpisodes')
            .selectAll()
            .where('scheduled_at', 'is not', null)
            .orderBy('scheduled_at', 'asc')
            .limit(500)
            .execute();
        res.json({ episodes: await attachEpisodeMedia(episodes) });
    }
    catch (error) {
        console.error('[BROADCASTS] Error fetching calendar episodes:', error);
        res.status(500).json({ error: 'Failed to fetch calendar episodes' });
    }
});
// Record a completed playback so episodes are eligible for the user-broadcast archive.
router.post('/api/episodes/:id/played', async (req, res) => {
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
    }
    catch (error) {
        console.error('[BROADCASTS] Error recording episode playback:', error);
        res.status(500).json({ error: 'Failed to record episode playback' });
    }
});
// The migrated episode archive contains completed plays only; voting remains authenticated.
router.get('/api/episode-archive/:mode', async (req, res) => {
    try {
        const mode = getString(req.params.mode);
        let query = db
            .selectFrom('UserBroadcastEpisodes')
            .selectAll()
            .where('play_count', '>', 0);
        if (mode === 'recent') {
            query = query.orderBy('last_played_at', 'desc');
        }
        else if (mode === 'popular') {
            query = query.orderBy('upvotes', 'desc').orderBy('downvotes', 'asc');
        }
        else if (mode === 'random') {
            query = query.orderBy(db.fn('random', []));
        }
        else {
            return res.status(400).json({ error: 'Archive mode must be recent, popular, or random' });
        }
        const episodes = await query.limit(100).execute();
        res.json({ episodes: await attachEpisodeMedia(episodes) });
    }
    catch (error) {
        console.error('[BROADCASTS] Error fetching episode archive:', error);
        res.status(500).json({ error: 'Failed to fetch episode archive' });
    }
});
// Get a single episode (for detail view).
router.get('/api/episodes/:id', async (req, res) => {
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
    }
    catch (error) {
        console.error('[BROADCASTS] Error fetching episode:', error);
        res.status(500).json({ error: 'Failed to fetch episode' });
    }
});
// Edit an episode (owner only).
router.put('/api/episodes/:id', requireAuth, async (req, res) => {
    try {
        const episodeId = parseInt(getString(req.params.id), 10);
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('[BROADCASTS] Error editing episode:', error);
        res.status(500).json({ error: 'Failed to edit episode' });
    }
});
// Delete an episode (owner only).
router.delete('/api/episodes/:id', requireAuth, async (req, res) => {
    try {
        const episodeId = parseInt(getString(req.params.id), 10);
        const userId = req.user?.userId;
        await db
            .deleteFrom('UserBroadcastEpisodes')
            .where('id', '=', episodeId)
            .where('user_id', '=', userId)
            .execute();
        res.json({ message: 'Episode deleted' });
    }
    catch (error) {
        console.error('[BROADCASTS] Error deleting episode:', error);
        res.status(500).json({ error: 'Failed to delete episode' });
    }
});
// Upvote an episode.
router.post('/api/episodes/:id/upvote', requireAuth, async (req, res) => {
    try {
        const episodeId = parseInt(getString(req.params.id), 10);
        const userId = req.user?.userId;
        const existingVote = await db
            .selectFrom('UserBroadcastEpisodeVotes')
            .selectAll()
            .where('episode_id', '=', episodeId)
            .where('user_id', '=', userId)
            .executeTakeFirst();
        if (existingVote?.vote_type === 1) {
            await db.deleteFrom('UserBroadcastEpisodeVotes').where('id', '=', existingVote.id).execute();
            await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ upvotes: eb('upvotes', '-', 1) })).where('id', '=', episodeId).execute();
        }
        else if (existingVote?.vote_type === -1) {
            await db.updateTable('UserBroadcastEpisodeVotes').set({ vote_type: 1 }).where('id', '=', existingVote.id).execute();
            await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ upvotes: eb('upvotes', '+', 1), downvotes: eb('downvotes', '-', 1) })).where('id', '=', episodeId).execute();
        }
        else {
            await db.insertInto('UserBroadcastEpisodeVotes').values({ episode_id: episodeId, user_id: userId, vote_type: 1 }).execute();
            await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ upvotes: eb('upvotes', '+', 1) })).where('id', '=', episodeId).execute();
        }
        const episode = await db.selectFrom('UserBroadcastEpisodes').select(['upvotes', 'downvotes']).where('id', '=', episodeId).executeTakeFirst();
        res.json({ upvotes: episode?.upvotes || 0, downvotes: episode?.downvotes || 0 });
    }
    catch (error) {
        console.error('[BROADCASTS] Error upvoting episode:', error);
        res.status(500).json({ error: 'Upvote failed' });
    }
});
// Downvote an episode.
router.post('/api/episodes/:id/downvote', requireAuth, async (req, res) => {
    try {
        const episodeId = parseInt(getString(req.params.id), 10);
        const userId = req.user?.userId;
        const existingVote = await db
            .selectFrom('UserBroadcastEpisodeVotes')
            .selectAll()
            .where('episode_id', '=', episodeId)
            .where('user_id', '=', userId)
            .executeTakeFirst();
        if (existingVote?.vote_type === -1) {
            await db.deleteFrom('UserBroadcastEpisodeVotes').where('id', '=', existingVote.id).execute();
            await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ downvotes: eb('downvotes', '-', 1) })).where('id', '=', episodeId).execute();
        }
        else if (existingVote?.vote_type === 1) {
            await db.updateTable('UserBroadcastEpisodeVotes').set({ vote_type: -1 }).where('id', '=', existingVote.id).execute();
            await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ downvotes: eb('downvotes', '+', 1), upvotes: eb('upvotes', '-', 1) })).where('id', '=', episodeId).execute();
        }
        else {
            await db.insertInto('UserBroadcastEpisodeVotes').values({ episode_id: episodeId, user_id: userId, vote_type: -1 }).execute();
            await db.updateTable('UserBroadcastEpisodes').set((eb) => ({ downvotes: eb('downvotes', '+', 1) })).where('id', '=', episodeId).execute();
        }
        const episode = await db.selectFrom('UserBroadcastEpisodes').select(['upvotes', 'downvotes']).where('id', '=', episodeId).executeTakeFirst();
        res.json({ upvotes: episode?.upvotes || 0, downvotes: episode?.downvotes || 0 });
    }
    catch (error) {
        console.error('[BROADCASTS] Error downvoting episode:', error);
        res.status(500).json({ error: 'Downvote failed' });
    }
});
// Favorite an episode.
router.post('/api/episodes/:id/favorite', requireAuth, async (req, res) => {
    try {
        const episodeId = parseInt(getString(req.params.id), 10);
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('[BROADCASTS] Error favoriting episode:', error);
        res.status(500).json({ error: 'Favorite failed' });
    }
});
// Get episode comments.
router.get('/api/episodes/:id/comments', async (req, res) => {
    try {
        const episodeId = parseInt(getString(req.params.id), 10);
        const comments = await db
            .selectFrom('UserBroadcastEpisodeComments')
            .selectAll()
            .where('episode_id', '=', episodeId)
            .orderBy('created_at', 'asc')
            .execute();
        res.json(comments);
    }
    catch (error) {
        console.error('[BROADCASTS] Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});
// Add a comment to an episode.
router.post('/api/episodes/:id/comments', requireAuth, async (req, res) => {
    try {
        const episodeId = parseInt(getString(req.params.id), 10);
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('[BROADCASTS] Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});
export default router;
