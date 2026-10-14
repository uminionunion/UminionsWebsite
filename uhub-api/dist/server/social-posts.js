import { Router } from 'express';
import { randomUUID } from 'crypto';
import { db } from './db.js';
import { authenticateOptional, requireAuth } from './auth-middleware.js';
const router = Router();
const DEFAULT_PRIVACY_SETTINGS = {
    allow_logged_in_friends_list: 1,
    allow_anonymous_posts: 1,
    allow_anonymous_interactions: 0,
};
function parseRouteId(value) {
    return typeof value === 'string' ? Number.parseInt(value, 10) : Number.NaN;
}
async function getPrivacySettings(userId) {
    const settings = await db.selectFrom('UserPrivacySettings').selectAll().where('user_id', '=', userId).executeTakeFirst();
    if (settings)
        return settings;
    await db.insertInto('UserPrivacySettings').values({ user_id: userId }).onConflict((conflict) => conflict.column('user_id').doNothing()).execute();
    return { user_id: userId, ...DEFAULT_PRIVACY_SETTINGS };
}
function getVisitorId(req, res) {
    const currentId = req.cookies?.worldFeedVisitor;
    if (typeof currentId === 'string' && /^[a-f0-9-]{36}$/i.test(currentId))
        return currentId;
    const visitorId = randomUUID();
    res.cookie('worldFeedVisitor', visitorId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: req.secure,
        maxAge: 365 * 24 * 60 * 60 * 1000,
        path: '/',
    });
    return visitorId;
}
async function canInteractWithSocialPost(postId, req) {
    const post = await db.selectFrom('SocialMediaPosts').select(['user_id']).where('id', '=', postId).executeTakeFirst();
    if (!post)
        return { post: null, allowed: false };
    if (req.user)
        return { post, allowed: true };
    const settings = await getPrivacySettings(post.user_id);
    return { post, allowed: settings.allow_anonymous_interactions === 1 };
}
router.get('/api/account/privacy', requireAuth, async (req, res) => {
    try {
        res.json(await getPrivacySettings(req.user.userId));
    }
    catch (error) {
        console.error('[PRIVACY SETTINGS] Failed to load settings:', error);
        res.status(500).json({ error: 'Failed to load privacy settings' });
    }
});
router.put('/api/account/privacy', requireAuth, async (req, res) => {
    try {
        const allowedFields = ['allow_logged_in_friends_list', 'allow_anonymous_posts', 'allow_anonymous_interactions'];
        const updates = {};
        for (const field of allowedFields) {
            if (field in req.body) {
                if (req.body[field] !== true && req.body[field] !== false && req.body[field] !== 0 && req.body[field] !== 1) {
                    return res.status(400).json({ error: `Invalid value for ${field}` });
                }
                updates[field] = req.body[field] === true || req.body[field] === 1 ? 1 : 0;
            }
        }
        if (Object.keys(updates).length === 0)
            return res.status(400).json({ error: 'At least one privacy setting is required' });
        await db.insertInto('UserPrivacySettings')
            .values({ user_id: req.user.userId, ...updates })
            .onConflict((conflict) => conflict.column('user_id').doUpdateSet(updates))
            .execute();
        res.json(await getPrivacySettings(req.user.userId));
    }
    catch (error) {
        console.error('[PRIVACY SETTINGS] Failed to save settings:', error);
        res.status(500).json({ error: 'Failed to save privacy settings' });
    }
});
// ==========================================
// SOCIAL MEDIA POSTS ("My Posts" / "My Feed")
// ==========================================
router.post('/api/social-posts', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { content } = req.body;
        if (typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ error: 'Post content is required' });
        }
        if (content.trim().length > 1000) {
            return res.status(400).json({ error: 'Post content must be 1,000 characters or fewer' });
        }
        const result = await db
            .insertInto('SocialMediaPosts')
            .values({ user_id: userId, content: content.trim() })
            .returning('id')
            .executeTakeFirstOrThrow();
        res.status(201).json({ id: result.id, message: 'Post created' });
    }
    catch (error) {
        console.error('[SOCIAL POSTS] Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});
// Paginated list of a specific user's social posts, newest first.
router.get('/api/social-posts/by-user/:userId', authenticateOptional, async (req, res) => {
    try {
        const userId = parseRouteId(req.params.userId);
        const offset = parseInt(req.query.offset || '0', 10);
        const limit = parseInt(req.query.limit || '3', 10);
        if (!Number.isFinite(userId)) {
            return res.status(400).json({ error: 'Invalid userId' });
        }
        if (!req.user) {
            const settings = await getPrivacySettings(userId);
            if (settings.allow_anonymous_posts !== 1)
                return res.status(403).json({ error: 'This user does not allow public post viewing' });
        }
        const { count } = await db
            .selectFrom('SocialMediaPosts')
            .select(db.fn.countAll().as('count'))
            .where('user_id', '=', userId)
            .executeTakeFirstOrThrow();
        const posts = await db
            .selectFrom('SocialMediaPosts')
            .selectAll()
            .where('user_id', '=', userId)
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset)
            .execute();
        res.json({ posts, total: Number(count) });
    }
    catch (error) {
        console.error('[SOCIAL POSTS] Error fetching posts by user:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});
router.put('/api/social-posts/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const { content } = req.body;
        if (typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ error: 'Post content is required' });
        }
        if (content.trim().length > 1000) {
            return res.status(400).json({ error: 'Post content must be 1,000 characters or fewer' });
        }
        const result = await db
            .updateTable('SocialMediaPosts')
            .set({ content: content.trim(), is_edited: 1 })
            .where('id', '=', parseRouteId(id))
            .where('user_id', '=', userId)
            .executeTakeFirst();
        if (!result.numUpdatedRows) {
            return res.status(404).json({ error: 'Post not found or not owned by you' });
        }
        res.json({ message: 'Post updated' });
    }
    catch (error) {
        console.error('[SOCIAL POSTS] Error editing post:', error);
        res.status(500).json({ error: 'Failed to edit post' });
    }
});
router.delete('/api/social-posts/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        await db
            .deleteFrom('SocialMediaPosts')
            .where('id', '=', parseRouteId(id))
            .where('user_id', '=', userId)
            .execute();
        res.json({ message: 'Post deleted' });
    }
    catch (error) {
        console.error('[SOCIAL POSTS] Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});
router.post('/api/social-posts/:id/upvote', authenticateOptional, async (req, res) => {
    try {
        const postId = parseRouteId(req.params.id);
        const { post: targetPost, allowed } = await canInteractWithSocialPost(postId, req);
        if (!targetPost)
            return res.status(404).json({ error: 'Post not found' });
        if (!allowed)
            return res.status(403).json({ error: 'This post owner does not allow guest interactions' });
        if (!req.user) {
            const visitorId = getVisitorId(req, res);
            const existingVote = await db.selectFrom('SocialMediaPostAnonymousVotes').selectAll().where('post_id', '=', postId).where('visitor_id', '=', visitorId).executeTakeFirst();
            if (existingVote?.vote_type === 1) {
                await db.deleteFrom('SocialMediaPostAnonymousVotes').where('id', '=', existingVote.id).execute();
                await db.updateTable('SocialMediaPosts').set((eb) => ({ upvotes: eb('upvotes', '-', 1) })).where('id', '=', postId).execute();
            }
            else if (existingVote) {
                await db.updateTable('SocialMediaPostAnonymousVotes').set({ vote_type: 1 }).where('id', '=', existingVote.id).execute();
                await db.updateTable('SocialMediaPosts').set((eb) => ({ upvotes: eb('upvotes', '+', 1), downvotes: eb('downvotes', '-', 1) })).where('id', '=', postId).execute();
            }
            else {
                await db.insertInto('SocialMediaPostAnonymousVotes').values({ post_id: postId, visitor_id: visitorId, vote_type: 1 }).execute();
                await db.updateTable('SocialMediaPosts').set((eb) => ({ upvotes: eb('upvotes', '+', 1) })).where('id', '=', postId).execute();
            }
            const guestPost = await db.selectFrom('SocialMediaPosts').select(['upvotes', 'downvotes']).where('id', '=', postId).executeTakeFirst();
            return res.json({ upvotes: guestPost?.upvotes || 0, downvotes: guestPost?.downvotes || 0 });
        }
        const userId = req.user.userId;
        const existingVote = await db
            .selectFrom('SocialMediaPostVotes')
            .selectAll()
            .where('post_id', '=', postId)
            .where('user_id', '=', userId)
            .executeTakeFirst();
        if (existingVote?.vote_type === 1) {
            await db.deleteFrom('SocialMediaPostVotes').where('id', '=', existingVote.id).execute();
            await db.updateTable('SocialMediaPosts').set((eb) => ({ upvotes: eb('upvotes', '-', 1) })).where('id', '=', postId).execute();
        }
        else if (existingVote?.vote_type === -1) {
            await db.updateTable('SocialMediaPostVotes').set({ vote_type: 1 }).where('id', '=', existingVote.id).execute();
            await db.updateTable('SocialMediaPosts').set((eb) => ({ upvotes: eb('upvotes', '+', 1), downvotes: eb('downvotes', '-', 1) })).where('id', '=', postId).execute();
        }
        else {
            await db.insertInto('SocialMediaPostVotes').values({ post_id: postId, user_id: userId, vote_type: 1 }).execute();
            await db.updateTable('SocialMediaPosts').set((eb) => ({ upvotes: eb('upvotes', '+', 1) })).where('id', '=', postId).execute();
        }
        const post = await db.selectFrom('SocialMediaPosts').select(['upvotes', 'downvotes']).where('id', '=', postId).executeTakeFirst();
        res.json({ upvotes: post?.upvotes || 0, downvotes: post?.downvotes || 0 });
    }
    catch (error) {
        console.error('[SOCIAL POSTS] Error upvoting post:', error);
        res.status(500).json({ error: 'Upvote failed' });
    }
});
router.post('/api/social-posts/:id/downvote', authenticateOptional, async (req, res) => {
    try {
        const postId = parseRouteId(req.params.id);
        const { post: targetPost, allowed } = await canInteractWithSocialPost(postId, req);
        if (!targetPost)
            return res.status(404).json({ error: 'Post not found' });
        if (!allowed)
            return res.status(403).json({ error: 'This post owner does not allow guest interactions' });
        if (!req.user) {
            const visitorId = getVisitorId(req, res);
            const existingVote = await db.selectFrom('SocialMediaPostAnonymousVotes').selectAll().where('post_id', '=', postId).where('visitor_id', '=', visitorId).executeTakeFirst();
            if (existingVote?.vote_type === -1) {
                await db.deleteFrom('SocialMediaPostAnonymousVotes').where('id', '=', existingVote.id).execute();
                await db.updateTable('SocialMediaPosts').set((eb) => ({ downvotes: eb('downvotes', '-', 1) })).where('id', '=', postId).execute();
            }
            else if (existingVote) {
                await db.updateTable('SocialMediaPostAnonymousVotes').set({ vote_type: -1 }).where('id', '=', existingVote.id).execute();
                await db.updateTable('SocialMediaPosts').set((eb) => ({ downvotes: eb('downvotes', '+', 1), upvotes: eb('upvotes', '-', 1) })).where('id', '=', postId).execute();
            }
            else {
                await db.insertInto('SocialMediaPostAnonymousVotes').values({ post_id: postId, visitor_id: visitorId, vote_type: -1 }).execute();
                await db.updateTable('SocialMediaPosts').set((eb) => ({ downvotes: eb('downvotes', '+', 1) })).where('id', '=', postId).execute();
            }
            const guestPost = await db.selectFrom('SocialMediaPosts').select(['upvotes', 'downvotes']).where('id', '=', postId).executeTakeFirst();
            return res.json({ upvotes: guestPost?.upvotes || 0, downvotes: guestPost?.downvotes || 0 });
        }
        const userId = req.user.userId;
        const existingVote = await db
            .selectFrom('SocialMediaPostVotes')
            .selectAll()
            .where('post_id', '=', postId)
            .where('user_id', '=', userId)
            .executeTakeFirst();
        if (existingVote?.vote_type === -1) {
            await db.deleteFrom('SocialMediaPostVotes').where('id', '=', existingVote.id).execute();
            await db.updateTable('SocialMediaPosts').set((eb) => ({ downvotes: eb('downvotes', '-', 1) })).where('id', '=', postId).execute();
        }
        else if (existingVote?.vote_type === 1) {
            await db.updateTable('SocialMediaPostVotes').set({ vote_type: -1 }).where('id', '=', existingVote.id).execute();
            await db.updateTable('SocialMediaPosts').set((eb) => ({ downvotes: eb('downvotes', '+', 1), upvotes: eb('upvotes', '-', 1) })).where('id', '=', postId).execute();
        }
        else {
            await db.insertInto('SocialMediaPostVotes').values({ post_id: postId, user_id: userId, vote_type: -1 }).execute();
            await db.updateTable('SocialMediaPosts').set((eb) => ({ downvotes: eb('downvotes', '+', 1) })).where('id', '=', postId).execute();
        }
        const post = await db.selectFrom('SocialMediaPosts').select(['upvotes', 'downvotes']).where('id', '=', postId).executeTakeFirst();
        res.json({ upvotes: post?.upvotes || 0, downvotes: post?.downvotes || 0 });
    }
    catch (error) {
        console.error('[SOCIAL POSTS] Error downvoting post:', error);
        res.status(500).json({ error: 'Downvote failed' });
    }
});
router.post('/api/social-posts/:id/favorite', requireAuth, async (req, res) => {
    try {
        const postId = parseRouteId(req.params.id);
        const userId = req.user?.userId;
        const existingFavorite = await db
            .selectFrom('SocialMediaPostFavorites')
            .select('id')
            .where('post_id', '=', postId)
            .where('user_id', '=', userId)
            .executeTakeFirst();
        if (existingFavorite) {
            await db.deleteFrom('SocialMediaPostFavorites').where('id', '=', existingFavorite.id).execute();
            return res.json({ isFavorited: false });
        }
        await db.insertInto('SocialMediaPostFavorites').values({ post_id: postId, user_id: userId }).execute();
        res.json({ isFavorited: true });
    }
    catch (error) {
        console.error('[SOCIAL POSTS] Error favoriting post:', error);
        res.status(500).json({ error: 'Favorite failed' });
    }
});
router.get('/api/social-posts/:id/comments', async (req, res) => {
    try {
        const postId = parseRouteId(req.params.id);
        const comments = await db
            .selectFrom('SocialMediaPostComments')
            .selectAll()
            .where('post_id', '=', postId)
            .orderBy('created_at', 'asc')
            .execute();
        res.json(comments);
    }
    catch (error) {
        console.error('[SOCIAL POSTS] Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});
router.post('/api/social-posts/:id/comments', authenticateOptional, async (req, res) => {
    try {
        const postId = parseRouteId(req.params.id);
        const { post, allowed } = await canInteractWithSocialPost(postId, req);
        if (!post)
            return res.status(404).json({ error: 'Post not found' });
        if (!allowed)
            return res.status(403).json({ error: 'This post owner does not allow guest interactions' });
        const userId = req.user?.userId ?? null;
        const { content } = req.body;
        if (typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }
        const result = await db
            .insertInto('SocialMediaPostComments')
            .values({ post_id: postId, user_id: userId, content: content.trim() })
            .returning('id')
            .executeTakeFirstOrThrow();
        res.status(201).json({ id: result.id, message: 'Comment added' });
    }
    catch (error) {
        console.error('[SOCIAL POSTS] Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});
// ==========================================
// FEED (MemeBox posts + Social posts merged, newest first)
// ==========================================
// Fetch enough rows from each source to safely cover offset+limit after merging & sorting by date.
const FEED_SOURCE_FETCH_CAP = 1000;
async function buildMergedFeed(userIds, offset, limit, viewerUserId) {
    if (userIds.length === 0) {
        return { items: [], total: 0 };
    }
    const [memePosts, socialPosts, episodes, memeCount, socialCount, episodeCount] = await Promise.all([
        db
            .selectFrom('MemeImplementation001Posts')
            .selectAll()
            .where('user_id', 'in', userIds)
            .orderBy('created_at', 'desc')
            .limit(FEED_SOURCE_FETCH_CAP)
            .execute(),
        db
            .selectFrom('SocialMediaPosts')
            .selectAll()
            .where('user_id', 'in', userIds)
            .orderBy('created_at', 'desc')
            .limit(FEED_SOURCE_FETCH_CAP)
            .execute(),
        db
            .selectFrom('UserBroadcastEpisodes')
            .selectAll()
            .where('user_id', 'in', userIds)
            .orderBy('scheduled_at', 'desc')
            .orderBy('created_at', 'desc')
            .limit(FEED_SOURCE_FETCH_CAP)
            .execute(),
        db.selectFrom('MemeImplementation001Posts').select(db.fn.countAll().as('count')).where('user_id', 'in', userIds).executeTakeFirstOrThrow(),
        db.selectFrom('SocialMediaPosts').select(db.fn.countAll().as('count')).where('user_id', 'in', userIds).executeTakeFirstOrThrow(),
        db.selectFrom('UserBroadcastEpisodes').select(db.fn.countAll().as('count')).where('user_id', 'in', userIds).executeTakeFirstOrThrow(),
    ]);
    const memeItems = await Promise.all(memePosts.map(async (post) => {
        const images = await db
            .selectFrom('MemeImplementation001Images')
            .select('image_url')
            .where('post_id', '=', post.id)
            .orderBy('display_order', 'asc')
            .execute();
        const author = await db.selectFrom('users').select('username').where('id', '=', post.user_id).executeTakeFirst();
        let userVote = null;
        let isFavorited = false;
        if (viewerUserId) {
            const vote = await db.selectFrom('MemeImplementation001PostVotes').select('vote_type').where('post_id', '=', post.id).where('user_id', '=', viewerUserId).executeTakeFirst();
            userVote = vote?.vote_type ?? null;
            const favorite = await db.selectFrom('MemeImplementation001Favorites').select('id').where('post_id', '=', post.id).where('user_id', '=', viewerUserId).executeTakeFirst();
            isFavorited = !!favorite;
        }
        return {
            type: 'meme',
            id: post.id,
            userId: post.user_id,
            username: author?.username || 'Anonymous',
            title: post.title,
            description: post.description,
            images: images.map((img) => img.image_url),
            upvotes: post.upvotes,
            downvotes: post.downvotes,
            isEdited: !!post.is_edited,
            userVote,
            isFavorited,
            createdAt: post.created_at,
        };
    }));
    const socialItems = await Promise.all(socialPosts.map(async (post) => {
        const author = await db.selectFrom('users').select('username').where('id', '=', post.user_id).executeTakeFirst();
        let userVote = null;
        let isFavorited = false;
        if (viewerUserId) {
            const vote = await db.selectFrom('SocialMediaPostVotes').select('vote_type').where('post_id', '=', post.id).where('user_id', '=', viewerUserId).executeTakeFirst();
            userVote = vote?.vote_type ?? null;
            const favorite = await db.selectFrom('SocialMediaPostFavorites').select('id').where('post_id', '=', post.id).where('user_id', '=', viewerUserId).executeTakeFirst();
            isFavorited = !!favorite;
        }
        return {
            type: 'social',
            id: post.id,
            userId: post.user_id,
            username: author?.username || 'Anonymous',
            content: post.content,
            upvotes: post.upvotes,
            downvotes: post.downvotes,
            isEdited: !!post.is_edited,
            userVote,
            isFavorited,
            createdAt: post.created_at,
        };
    }));
    const episodeItems = await Promise.all(episodes.map(async (episode) => {
        const author = await db.selectFrom('users').select('username').where('id', '=', episode.user_id).executeTakeFirst();
        let userVote = null;
        let isFavorited = false;
        if (viewerUserId) {
            const vote = await db.selectFrom('UserBroadcastEpisodeVotes').select('vote_type').where('episode_id', '=', episode.id).where('user_id', '=', viewerUserId).executeTakeFirst();
            userVote = vote?.vote_type ?? null;
            const favorite = await db.selectFrom('UserBroadcastEpisodeFavorites').select('id').where('episode_id', '=', episode.id).where('user_id', '=', viewerUserId).executeTakeFirst();
            isFavorited = !!favorite;
        }
        return {
            type: 'episode',
            id: episode.id,
            userId: episode.user_id,
            username: author?.username || 'Anonymous',
            name: episode.name,
            description: episode.description,
            media_url: episode.media_url,
            cover_image_url: episode.cover_image_url,
            upvotes: episode.upvotes,
            downvotes: episode.downvotes,
            isEdited: !!episode.is_edited,
            userVote,
            isFavorited,
            scheduledAt: episode.scheduled_at,
            createdAt: episode.created_at,
        };
    }));
    const merged = [...memeItems, ...socialItems, ...episodeItems].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return {
        items: merged.slice(offset, offset + limit),
        total: Number(memeCount.count) + Number(socialCount.count) + Number(episodeCount.count),
    };
}
router.get('/api/feed/friends', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const offset = parseInt(req.query.offset || '0', 10);
        const limit = parseInt(req.query.limit || '3', 10);
        const friendships = await db
            .selectFrom('friends')
            .selectAll()
            .where('status', '=', 'accepted')
            .where((eb) => eb.or([eb('user_id1', '=', userId), eb('user_id2', '=', userId)]))
            .execute();
        const friendIds = friendships.map((f) => (f.user_id1 === userId ? f.user_id2 : f.user_id1));
        const feed = await buildMergedFeed(friendIds, offset, limit, userId);
        res.json(feed);
    }
    catch (error) {
        console.error('[FEED] Error fetching friends feed:', error);
        res.status(500).json({ error: 'Failed to fetch friends feed' });
    }
});
// Union Announcements: posts from the official union accounts (user IDs 1 & 2), visible to any logged-in viewer.
router.get('/api/feed/union-announcements', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const offset = parseInt(req.query.offset || '0', 10);
        const limit = parseInt(req.query.limit || '3', 10);
        const feed = await buildMergedFeed([1, 2], offset, limit, userId);
        res.json(feed);
    }
    catch (error) {
        console.error('[FEED] Error fetching union announcements feed:', error);
        res.status(500).json({ error: 'Failed to fetch union announcements feed' });
    }
});
router.get('/api/feed/world', authenticateOptional, async (req, res) => {
    try {
        const beforeCreatedAt = typeof req.query.beforeCreatedAt === 'string' ? req.query.beforeCreatedAt : null;
        const beforeId = Number.parseInt(String(req.query.beforeId ?? ''), 10);
        const rawLimit = Number.parseInt(String(req.query.limit ?? '50'), 10);
        const limit = Number.isFinite(rawLimit) ? Math.min(50, Math.max(1, rawLimit)) : 50;
        let query = db.selectFrom('SocialMediaPosts')
            .innerJoin('users', 'users.id', 'SocialMediaPosts.user_id')
            .select([
            'SocialMediaPosts.id as id',
            'SocialMediaPosts.user_id as userId',
            'users.username as username',
            'SocialMediaPosts.content as content',
            'SocialMediaPosts.created_at as createdAt',
        ]);
        if (!req.user) {
            query = db.selectFrom('SocialMediaPosts')
                .innerJoin('users', 'users.id', 'SocialMediaPosts.user_id')
                .leftJoin('UserPrivacySettings', 'UserPrivacySettings.user_id', 'SocialMediaPosts.user_id')
                .select([
                'SocialMediaPosts.id as id',
                'SocialMediaPosts.user_id as userId',
                'users.username as username',
                'SocialMediaPosts.content as content',
                'SocialMediaPosts.created_at as createdAt',
            ])
                .where((eb) => eb.or([
                eb('UserPrivacySettings.allow_anonymous_posts', '=', 1),
                eb('UserPrivacySettings.user_id', 'is', null),
            ]));
        }
        if (beforeCreatedAt && Number.isFinite(beforeId) && beforeId > 0) {
            query = query.where((eb) => eb.or([
                eb('SocialMediaPosts.created_at', '<', beforeCreatedAt),
                eb.and([
                    eb('SocialMediaPosts.created_at', '=', beforeCreatedAt),
                    eb('SocialMediaPosts.id', '<', beforeId),
                ]),
            ]));
        }
        const rows = await query.orderBy('SocialMediaPosts.created_at', 'desc')
            .orderBy('SocialMediaPosts.id', 'desc')
            .limit(limit + 1)
            .execute();
        res.json({ items: rows.slice(0, limit).reverse(), hasMore: rows.length > limit });
    }
    catch (error) {
        console.error('[WORLD FEED] Failed to fetch posts:', error);
        res.status(500).json({ error: 'Failed to fetch World Feed posts' });
    }
});
export default router;
