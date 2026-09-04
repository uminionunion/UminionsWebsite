import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { requireAuth } from './auth-middleware.js';

const router = Router();

// ==========================================
// SOCIAL MEDIA POSTS ("My Posts" / "My Feed")
// ==========================================

router.post('/api/social-posts', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const result = await db
      .insertInto('SocialMediaPosts')
      .values({ user_id: userId, content: content.trim() })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.status(201).json({ id: result.id, message: 'Post created' });
  } catch (error) {
    console.error('[SOCIAL POSTS] Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Paginated list of a specific user's social posts, newest first.
router.get('/api/social-posts/by-user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const offset = parseInt((req.query.offset as string) || '0', 10);
    const limit = parseInt((req.query.limit as string) || '3', 10);

    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
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
  } catch (error) {
    console.error('[SOCIAL POSTS] Error fetching posts by user:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.put('/api/social-posts/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const result = await db
      .updateTable('SocialMediaPosts')
      .set({ content: content.trim(), is_edited: 1 })
      .where('id', '=', parseInt(id))
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (!result.numUpdatedRows) {
      return res.status(404).json({ error: 'Post not found or not owned by you' });
    }

    res.json({ message: 'Post updated' });
  } catch (error) {
    console.error('[SOCIAL POSTS] Error editing post:', error);
    res.status(500).json({ error: 'Failed to edit post' });
  }
});

router.delete('/api/social-posts/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    await db
      .deleteFrom('SocialMediaPosts')
      .where('id', '=', parseInt(id))
      .where('user_id', '=', userId)
      .execute();

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('[SOCIAL POSTS] Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

router.post('/api/social-posts/:id/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = (req as any).user?.userId;

    const existingVote = await db
      .selectFrom('SocialMediaPostVotes')
      .selectAll()
      .where('post_id', '=', postId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (existingVote?.vote_type === 1) {
      await db.deleteFrom('SocialMediaPostVotes').where('id', '=', existingVote.id).execute();
      await db.updateTable('SocialMediaPosts').set((eb) => ({ upvotes: eb('upvotes', '-', 1) })).where('id', '=', postId).execute();
    } else if (existingVote?.vote_type === -1) {
      await db.updateTable('SocialMediaPostVotes').set({ vote_type: 1 }).where('id', '=', existingVote.id).execute();
      await db.updateTable('SocialMediaPosts').set((eb) => ({ upvotes: eb('upvotes', '+', 1), downvotes: eb('downvotes', '-', 1) })).where('id', '=', postId).execute();
    } else {
      await db.insertInto('SocialMediaPostVotes').values({ post_id: postId, user_id: userId, vote_type: 1 }).execute();
      await db.updateTable('SocialMediaPosts').set((eb) => ({ upvotes: eb('upvotes', '+', 1) })).where('id', '=', postId).execute();
    }

    const post = await db.selectFrom('SocialMediaPosts').select(['upvotes', 'downvotes']).where('id', '=', postId).executeTakeFirst();
    res.json({ upvotes: post?.upvotes || 0, downvotes: post?.downvotes || 0 });
  } catch (error) {
    console.error('[SOCIAL POSTS] Error upvoting post:', error);
    res.status(500).json({ error: 'Upvote failed' });
  }
});

router.post('/api/social-posts/:id/downvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = (req as any).user?.userId;

    const existingVote = await db
      .selectFrom('SocialMediaPostVotes')
      .selectAll()
      .where('post_id', '=', postId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (existingVote?.vote_type === -1) {
      await db.deleteFrom('SocialMediaPostVotes').where('id', '=', existingVote.id).execute();
      await db.updateTable('SocialMediaPosts').set((eb) => ({ downvotes: eb('downvotes', '-', 1) })).where('id', '=', postId).execute();
    } else if (existingVote?.vote_type === 1) {
      await db.updateTable('SocialMediaPostVotes').set({ vote_type: -1 }).where('id', '=', existingVote.id).execute();
      await db.updateTable('SocialMediaPosts').set((eb) => ({ downvotes: eb('downvotes', '+', 1), upvotes: eb('upvotes', '-', 1) })).where('id', '=', postId).execute();
    } else {
      await db.insertInto('SocialMediaPostVotes').values({ post_id: postId, user_id: userId, vote_type: -1 }).execute();
      await db.updateTable('SocialMediaPosts').set((eb) => ({ downvotes: eb('downvotes', '+', 1) })).where('id', '=', postId).execute();
    }

    const post = await db.selectFrom('SocialMediaPosts').select(['upvotes', 'downvotes']).where('id', '=', postId).executeTakeFirst();
    res.json({ upvotes: post?.upvotes || 0, downvotes: post?.downvotes || 0 });
  } catch (error) {
    console.error('[SOCIAL POSTS] Error downvoting post:', error);
    res.status(500).json({ error: 'Downvote failed' });
  }
});

router.post('/api/social-posts/:id/favorite', requireAuth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = (req as any).user?.userId;

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
  } catch (error) {
    console.error('[SOCIAL POSTS] Error favoriting post:', error);
    res.status(500).json({ error: 'Favorite failed' });
  }
});

router.get('/api/social-posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const comments = await db
      .selectFrom('SocialMediaPostComments')
      .selectAll()
      .where('post_id', '=', postId)
      .orderBy('created_at', 'asc')
      .execute();
    res.json(comments);
  } catch (error) {
    console.error('[SOCIAL POSTS] Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.post('/api/social-posts/:id/comments', requireAuth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = (req as any).user?.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const result = await db
      .insertInto('SocialMediaPostComments')
      .values({ post_id: postId, user_id: userId, content: content.trim() })
      .returning('id')
      .executeTakeFirstOrThrow();

    res.status(201).json({ id: result.id, message: 'Comment added' });
  } catch (error) {
    console.error('[SOCIAL POSTS] Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// ==========================================
// FEED (MemeBox posts + Social posts merged, newest first)
// ==========================================

// Fetch enough rows from each source to safely cover offset+limit after merging & sorting by date.
const FEED_SOURCE_FETCH_CAP = 1000;

async function buildMergedFeed(userIds: number[], offset: number, limit: number, viewerUserId: number | null) {
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

  const memeItems = await Promise.all(
    memePosts.map(async (post) => {
      const images = await db
        .selectFrom('MemeImplementation001Images')
        .select('image_url')
        .where('post_id', '=', post.id)
        .orderBy('display_order', 'asc')
        .execute();

      const author = await db.selectFrom('users').select('username').where('id', '=', post.user_id!).executeTakeFirst();

      let userVote: number | null = null;
      let isFavorited = false;
      if (viewerUserId) {
        const vote = await db.selectFrom('MemeImplementation001PostVotes').select('vote_type').where('post_id', '=', post.id).where('user_id', '=', viewerUserId).executeTakeFirst();
        userVote = vote?.vote_type ?? null;
        const favorite = await db.selectFrom('MemeImplementation001Favorites').select('id').where('post_id', '=', post.id).where('user_id', '=', viewerUserId).executeTakeFirst();
        isFavorited = !!favorite;
      }

      return {
        type: 'meme' as const,
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
    })
  );

  const socialItems = await Promise.all(
    socialPosts.map(async (post) => {
      const author = await db.selectFrom('users').select('username').where('id', '=', post.user_id).executeTakeFirst();

      let userVote: number | null = null;
      let isFavorited = false;
      if (viewerUserId) {
        const vote = await db.selectFrom('SocialMediaPostVotes').select('vote_type').where('post_id', '=', post.id).where('user_id', '=', viewerUserId).executeTakeFirst();
        userVote = vote?.vote_type ?? null;
        const favorite = await db.selectFrom('SocialMediaPostFavorites').select('id').where('post_id', '=', post.id).where('user_id', '=', viewerUserId).executeTakeFirst();
        isFavorited = !!favorite;
      }

      return {
        type: 'social' as const,
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
    })
  );

  const episodeItems = await Promise.all(
    episodes.map(async (episode) => {
      const author = await db.selectFrom('users').select('username').where('id', '=', episode.user_id).executeTakeFirst();

      let userVote: number | null = null;
      let isFavorited = false;
      if (viewerUserId) {
        const vote = await db.selectFrom('UserBroadcastEpisodeVotes').select('vote_type').where('episode_id', '=', episode.id).where('user_id', '=', viewerUserId).executeTakeFirst();
        userVote = vote?.vote_type ?? null;
        const favorite = await db.selectFrom('UserBroadcastEpisodeFavorites').select('id').where('episode_id', '=', episode.id).where('user_id', '=', viewerUserId).executeTakeFirst();
        isFavorited = !!favorite;
      }

      return {
        type: 'episode' as const,
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
    })
  );

  const merged = [...memeItems, ...socialItems, ...episodeItems].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  return {
    items: merged.slice(offset, offset + limit),
    total: Number(memeCount.count) + Number(socialCount.count) + Number(episodeCount.count),
  };
}

router.get('/api/feed/friends', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const offset = parseInt((req.query.offset as string) || '0', 10);
    const limit = parseInt((req.query.limit as string) || '3', 10);

    const friendships = await db
      .selectFrom('friends')
      .selectAll()
      .where('status', '=', 'accepted')
      .where((eb) => eb.or([eb('user_id1', '=', userId), eb('user_id2', '=', userId)]))
      .execute();

    const friendIds = friendships.map((f) => (f.user_id1 === userId ? f.user_id2 : f.user_id1));

    const feed = await buildMergedFeed(friendIds, offset, limit, userId);
    res.json(feed);
  } catch (error) {
    console.error('[FEED] Error fetching friends feed:', error);
    res.status(500).json({ error: 'Failed to fetch friends feed' });
  }
});

// Union Announcements: posts from the official union accounts (user IDs 1 & 2), visible to any logged-in viewer.
router.get('/api/feed/union-announcements', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const offset = parseInt((req.query.offset as string) || '0', 10);
    const limit = parseInt((req.query.limit as string) || '3', 10);

    const feed = await buildMergedFeed([1, 2], offset, limit, userId);
    res.json(feed);
  } catch (error) {
    console.error('[FEED] Error fetching union announcements feed:', error);
    res.status(500).json({ error: 'Failed to fetch union announcements feed' });
  }
});

export default router;
