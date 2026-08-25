import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { sql } from 'kysely';
import jwt from 'jsonwebtoken';
import { requireAuth } from './auth-middleware.js';

const router = Router();

// ==========================================
// POSTS ROUTES
// ==========================================

router.get('/api/memes/posts/viral', async (req: Request, res: Response) => {
  try {
    console.log('[MEME API] Fetching viral posts (5+ upvotes)');
    
    // ✅ NEW: Extract userId from token if logged in
    let userId: number | null = null;
    const token = req.cookies?.token;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key') as any;
        userId = payload.userId;
      } catch {
        // Invalid token, continue as anonymous
      }
    }

    const posts = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .where('upvotes', '>=', 5)
      .orderBy('created_at', 'desc')
      .limit(100)
      .execute();

    // ✅ FIXED: Fetch images array for each post
const postsWithImages = await Promise.all(
  posts.map(async (post) => {
    const images = await db
      .selectFrom('MemeImplementation001Images')
      .select('image_url')
      .where('post_id', '=', post.id)
      .orderBy('display_order', 'asc')
      .execute();

    // ✅ Fetch post author's username
    const author = await db
      .selectFrom('users')
      .select('username')
      .where('id', '=', post.user_id)
      .executeTakeFirst();

    // ✅ Check if favorited by current user
    let isFavorited = false;
    if (userId) {
      const favorite = await db
        .selectFrom('MemeImplementation001Favorites')
        .select('id')
        .where('post_id', '=', post.id)
        .where('user_id', '=', userId)
        .executeTakeFirst();
      isFavorited = !!favorite;
    }

    return {
      ...post,
      images: images.map((img) => img.image_url),
      username: author?.username || 'Anonymous', // ✅ ADD THIS
      isFavorited,
    };
  })
);

    // Return with randomized order
    const randomized = postsWithImages.sort(() => Math.random() - 0.5);
    res.json(randomized);
  } catch (error) {
    console.error('[MEME API] Error fetching viral posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get all posts for "User Submitted" page
router.get('/api/memes/posts/user-submitted', async (req: Request, res: Response) => {
  try {
    console.log('[MEME API] Fetching user-submitted posts (<5 upvotes)');
    
    // ✅ NEW: Extract userId from token if logged in
    let userId: number | null = null;
    const token = req.cookies?.token;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key') as any;
        userId = payload.userId;
      } catch {
        // Invalid token, continue as anonymous
      }
    }

    const posts = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .where('upvotes', '<', 5)
      .where('downvotes', '<', 10)
      .orderBy('created_at', 'desc')
      .limit(100)
      .execute();
    
    // ✅ FIXED: Fetch images array for each post
    const postsWithImages = await Promise.all(
      posts.map(async (post) => {
        const images = await db
          .selectFrom('MemeImplementation001Images')
          .select('image_url')
          .where('post_id', '=', post.id)
          .orderBy('display_order', 'asc')
          .execute();

        // ✅ NEW: Check if favorited
        let isFavorited = false;
        if (userId) {
          const favorite = await db
            .selectFrom('MemeImplementation001Favorites')
            .select('id')
            .where('post_id', '=', post.id)
            .where('user_id', '=', userId)
            .executeTakeFirst();
          isFavorited = !!favorite;
        }
        
        return {
          ...post,
          images: images.map((img) => img.image_url), // ✅ Array of URLs
          isFavorited,  // ✅ ADD THIS
        };
      })
    );

    res.json(postsWithImages);
  } catch (error) {
    console.error('[MEME API] Error fetching user-submitted posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get post with all images
router.get('/api/memes/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[MEME API] Fetching post', id);
    
    const post = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .where('id', '=', parseInt(id))
      .executeTakeFirst();
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const images = await db
      .selectFrom('MemeImplementation001Images')
      .selectAll()
      .where('post_id', '=', post.id)
      .orderBy('display_order', 'asc')
      .execute();

    res.json({ ...post, images });
  } catch (error) {
    console.error('[MEME API] Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});





// Create new post (with images)
router.post('/api/memes/posts', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, imageBase64Array } = req.body;
    const userId = (req as any).user?.userId;

    // ✅ FIXED: Handle both old format (images array of objects) and new format (imageBase64Array)
    const imagesToAdd = imageBase64Array || [];

    if (!title || !imagesToAdd || imagesToAdd.length === 0) {
      console.log('[MEME API] Missing title or images. Title:', title, 'Images count:', imagesToAdd.length);
      return res.status(400).json({ error: 'Title and images required' });
    }

    console.log('[MEME API] Creating post for user', userId, 'with', imagesToAdd.length, 'images');

    // ✅ NEW: Calculate bonus upvotes for user_id=3
    let initialUpvotes = 0;
    if (userId === 3) {
      // Random number between 6 and 12
      initialUpvotes = Math.floor(Math.random() * 7) + 6;
      console.log('[MEME API] ⭐ USER_ID=3 BONUS: Adding', initialUpvotes, 'initial upvotes to post');
    }

    // Create post
    const postResult = await db
      .insertInto('MemeImplementation001Posts')
      .values({
        user_id: userId,
        title,
        description: description || null,
        upvotes: initialUpvotes, // ✅ NEW: Use bonus upvotes if user_id=3
        downvotes: 0,
      })
      .executeTakeFirstOrThrow();

    const postId = Number(postResult.insertId);

    // ✅ FIXED: Handle base64 strings directly
    for (let i = 0; i < imagesToAdd.length; i++) {
      const imageData = imagesToAdd[i];
      
      // imageData can be either a string (base64) or an object with .url property
      const imageUrl = typeof imageData === 'string' ? imageData : imageData.url;

      console.log(`[MEME API] Storing image ${i + 1}/${imagesToAdd.length} for post ${postId}`);

      await db
        .insertInto('MemeImplementation001Images')
        .values({
          post_id: postId,
          image_url: imageUrl, // ✅ Store base64 string directly
          title: null,
          description: null,
          display_order: i,
        })
        .execute();
    }

    console.log('[MEME API] ✅ Post created with ID', postId, 'with', imagesToAdd.length, 'images', initialUpvotes > 0 ? `and ${initialUpvotes} bonus upvotes` : '');
    res.status(201).json({ id: postId, message: 'Post created' });
  } catch (error) {
    console.error('[MEME API] Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});





// Delete post (auto-triggered when downvotes >= 10)
router.delete('/api/memes/posts/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    console.log('[MEME API] Deleting post', id);

    // Delete post (cascades to images, comments, votes)
    await db
      .deleteFrom('MemeImplementation001Posts')
      .where('id', '=', parseInt(id))
      .where('user_id', '=', userId)
      .execute();

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('[MEME API] Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ==========================================
// VOTING ROUTES
// ==========================================

// Upvote post
router.post('/api/memes/posts/:id/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const postId = parseInt(id);

    console.log('[MEME API] User', userId, 'upvoting post', postId);

    // Check if user already voted
    const existingVote = await db
  .selectFrom('MemeImplementation001PostVotes')
  .select(['id', 'vote_type'])
  .where('post_id', '=', postId)
  .where('user_id', '=', userId)
  .executeTakeFirst();

    if (existingVote) {
      if (existingVote.vote_type === 1) {
        // Remove upvote
        await db
          .deleteFrom('MemeImplementation001PostVotes')
          .where('post_id', '=', postId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Posts')
          .set({ upvotes: sql<number>`upvotes - 1` })
          .where('id', '=', postId)
          .execute();
      } else {
        // Change from downvote to upvote
        await db
          .updateTable('MemeImplementation001PostVotes')
          .set({ vote_type: 1 })
          .where('post_id', '=', postId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Posts')
          .set({
            upvotes: sql<number>`upvotes + 1`,
            downvotes: sql<number>`downvotes - 1`,
          })
          .where('id', '=', postId)
          .execute();
      }
    } else {
      // New upvote
      await db
        .insertInto('MemeImplementation001PostVotes')
        .values({ post_id: postId, user_id: userId, vote_type: 1 })
        .execute();

      await db
        .updateTable('MemeImplementation001Posts')
        .set({ upvotes: sql<number>`upvotes + 1` })
        .where('id', '=', postId)
        .execute();
    }

    console.log('[MEME API] ✅ Upvote processed');
    res.json({ message: 'Upvote recorded' });
  } catch (error) {
    console.error('[MEME API] Error upvoting:', error);
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// Downvote post (with auto-delete at 10 downvotes)
router.post('/api/memes/posts/:id/downvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const postId = parseInt(id);

    console.log('[MEME API] User', userId, 'downvoting post', postId);

    // Check if user already voted
    const existingVote = await db
  .selectFrom('MemeImplementation001PostVotes')
  .select(['id', 'vote_type'])
  .where('post_id', '=', postId)
  .where('user_id', '=', userId)
  .executeTakeFirst();

    if (existingVote) {
      if (existingVote.vote_type === -1) {
        // Remove downvote
        await db
          .deleteFrom('MemeImplementation001PostVotes')
          .where('post_id', '=', postId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Posts')
          .set({ downvotes: sql<number>`downvotes - 1` })
          .where('id', '=', postId)
          .execute();
      } else {
        // Change from upvote to downvote
        await db
          .updateTable('MemeImplementation001PostVotes')
          .set({ vote_type: -1 })
          .where('post_id', '=', postId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Posts')
          .set({
            downvotes: sql<number>`downvotes + 1`,
            upvotes: sql<number>`upvotes - 1`,
          })
          .where('id', '=', postId)
          .execute();
      }
    } else {
      // New downvote
      await db
        .insertInto('MemeImplementation001PostVotes')
        .values({ post_id: postId, user_id: userId, vote_type: -1 })
        .execute();

      await db
        .updateTable('MemeImplementation001Posts')
        .set({ downvotes: sql<number>`downvotes + 1` })
        .where('id', '=', postId)
        .execute();
    }

    // Check if post should be auto-deleted (10+ downvotes)
    const post = await db
      .selectFrom('MemeImplementation001Posts')
      .select(['id', 'downvotes'])
      .where('id', '=', postId)
      .executeTakeFirst();

    if (post && post.downvotes >= 10) {
      console.log('[MEME API] ⚠️ Auto-deleting post', postId, 'due to 10+ downvotes');
      await db
        .deleteFrom('MemeImplementation001Posts')
        .where('id', '=', postId)
        .execute();
      return res.json({ message: 'Downvoted. Post auto-deleted due to too many downvotes' });
    }

    console.log('[MEME API] ✅ Downvote processed');
    res.json({ message: 'Downvote recorded' });
  } catch (error) {
    console.error('[MEME API] Error downvoting:', error);
    res.status(500).json({ error: 'Failed to downvote' });
  }
});



// POST: Favorite/Unfavorite a post
router.post('/api/memes/posts/:id/favorite', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const postId = parseInt(id);

    console.log('[MEME API] User', userId, 'toggling favorite for post', postId);

    // Check if already favorited
    const existingFavorite = await db
      .selectFrom('MemeImplementation001Favorites')
      .select('id')
      .where('post_id', '=', postId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    let isFavorited = false;

    if (existingFavorite) {
      // Remove favorite
      await db
        .deleteFrom('MemeImplementation001Favorites')
        .where('post_id', '=', postId)
        .where('user_id', '=', userId)
        .execute();
      console.log(`[MEME API] ✅ Removed favorite: post ${postId}, user ${userId}`);
    } else {
      // Add favorite
      await db
        .insertInto('MemeImplementation001Favorites')
        .values({
          post_id: postId,
          user_id: userId,
        })
        .execute();
      isFavorited = true;
      console.log(`[MEME API] ✅ Added favorite: post ${postId}, user ${userId}`);
    }

    res.status(200).json({ isFavorited });
  } catch (error) {
    console.error('[MEME API] Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});





// ==========================================
// COMMENTS ROUTES
// ==========================================

// Get all comments for a post
router.get('/api/memes/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[MEME API] Fetching comments for post', id);

    // ✅ NEW: Extract userId from token if logged in
    let userId: number | null = null;
    const token = req.cookies?.token;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key') as any;
        userId = payload.userId;
      } catch {
        // Invalid token, continue as anonymous
      }
    }

    const comments = await db
  .selectFrom('MemeImplementation001Comments')
  .innerJoin('users', 'MemeImplementation001Comments.user_id', 'users.id')
  .select([
    'MemeImplementation001Comments.id',
    'MemeImplementation001Comments.post_id',
    'MemeImplementation001Comments.user_id',
    'MemeImplementation001Comments.title',
    'MemeImplementation001Comments.description',
    'MemeImplementation001Comments.image_url',
    'MemeImplementation001Comments.upvotes',
    'MemeImplementation001Comments.downvotes',
    'MemeImplementation001Comments.created_at',
    'MemeImplementation001Comments.is_deleted',
    'users.username',
  ])
  .where('MemeImplementation001Comments.post_id', '=', parseInt(id))
  .orderBy('MemeImplementation001Comments.upvotes', 'desc')
  .orderBy('MemeImplementation001Comments.created_at', 'desc')
  .execute();

    // ✅ NEW: Add userVote field for each comment if user is logged in
    const commentsWithUserVote = await Promise.all(
      comments.map(async (comment) => {
        let userVote: number | null = null;
        
        if (userId) {
          const vote = await db
            .selectFrom('MemeImplementation001CommentVotes')
            .select('vote_type')
            .where('comment_id', '=', comment.id)
            .where('user_id', '=', userId)
            .executeTakeFirst();
          
          if (vote) {
            userVote = vote.vote_type;
          }
        }

        return {
          ...comment,
          userVote,
        };
      })
    );

    res.json(commentsWithUserVote);
  } catch (error) {
    console.error('[MEME API] Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});


// Add comment to post
router.post('/api/memes/posts/:id/comments', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    const userId = (req as any).user?.userId;

    // ✅ FIXED: Check if at least one field exists
    if ((!title || !title.trim()) && (!description || !description.trim())) {
      return res.status(400).json({ error: 'Title or description required' });
    }

    console.log('[MEME API] Creating comment for post', id, 'by user', userId);

    const result = await db
  .insertInto('MemeImplementation001Comments')
  .values({
    post_id: parseInt(id),
    user_id: userId,
    title: title?.trim() || null,
    description: description?.trim() || null,
    image_url: image || null,
    upvotes: 0,
    downvotes: 0,
  })
  .returning('id')
  .executeTakeFirstOrThrow();

const commentId = result.id;
console.log('[MEME API] ✅ Comment created with ID', commentId);
res.status(201).json({ 
  id: commentId,
  title: title?.trim() || null,
  description: description?.trim() || null,
  image_url: image || null,
  message: 'Comment added' 
});
  } catch (error) {
    console.error('[MEME API] Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete comment
router.delete('/api/memes/comments/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    console.log('[MEME API] Deleting comment', id);

    await db
      .deleteFrom('MemeImplementation001Comments')
      .where('id', '=', parseInt(id))
      .where('user_id', '=', userId)
      .execute();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('[MEME API] Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Mark comment as deleted (soft delete - keeps data for admins)
router.post('/api/memes/comments/:id/delete', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    console.log('[MEME API] Soft-deleting comment', id, 'by user', userId);

    // Check if user owns this comment
    const comment = await db
      .selectFrom('MemeImplementation001Comments')
      .select(['id', 'user_id'])
      .where('id', '=', parseInt(id))
      .executeTakeFirst();

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ error: 'Can only delete your own comments' });
    }

    // Soft delete: mark as deleted and clear description
    await db
      .updateTable('MemeImplementation001Comments')
      .set({
        is_deleted: 1,
        description: null,
        title: null,
        image_url: null,
      })
      .where('id', '=', parseInt(id))
      .execute();

    console.log('[MEME API] ✅ Comment soft-deleted:', id);
    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('[MEME API] Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Upvote comment
router.post('/api/memes/comments/:id/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const commentId = parseInt(id);

    console.log('[MEME API] User', userId, 'upvoting comment', commentId);

    const existingVote = await db
  .selectFrom('MemeImplementation001CommentVotes')
  .select(['id', 'vote_type'])
  .where('comment_id', '=', commentId)
  .where('user_id', '=', userId)
  .executeTakeFirst();

    if (existingVote) {
      if (existingVote.vote_type === 1) {
        await db
          .deleteFrom('MemeImplementation001CommentVotes')
          .where('comment_id', '=', commentId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Comments')
          .set({ upvotes: sql<number>`upvotes - 1` })
          .where('id', '=', commentId)
          .execute();
      } else {
        await db
          .updateTable('MemeImplementation001CommentVotes')
          .set({ vote_type: 1 })
          .where('comment_id', '=', commentId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Comments')
          .set({
            upvotes: sql<number>`upvotes + 1`,
            downvotes: sql<number>`downvotes - 1`,
          })
          .where('id', '=', commentId)
          .execute();
      }
    } else {
      await db
        .insertInto('MemeImplementation001CommentVotes')
        .values({ comment_id: commentId, user_id: userId, vote_type: 1 })
        .execute();

      await db
        .updateTable('MemeImplementation001Comments')
        .set({ upvotes: sql<number>`upvotes + 1` })
        .where('id', '=', commentId)
        .execute();
    }

    console.log('[MEME API] ✅ Comment upvote processed');
     res.json({ message: 'Comment upvoted' });
   } catch (error) {
     console.error('[MEME API] Error upvoting comment:', error);
     res.status(500).json({ error: 'Failed to upvote comment' });
   }
 });

// ✅ NEW: Downvote comment
router.post('/api/memes/comments/:id/downvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const commentId = parseInt(id);

    console.log('[MEME API] User', userId, 'downvoting comment', commentId);

    const existingVote = await db
      .selectFrom('MemeImplementation001CommentVotes')
      .select(['id', 'vote_type'])
      .where('comment_id', '=', commentId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (existingVote) {
      if (existingVote.vote_type === -1) {
        // Remove downvote
        await db
          .deleteFrom('MemeImplementation001CommentVotes')
          .where('comment_id', '=', commentId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Comments')
          .set({ downvotes: sql<number>`downvotes - 1` })
          .where('id', '=', commentId)
          .execute();
      } else {
        // Change from upvote to downvote
        await db
          .updateTable('MemeImplementation001CommentVotes')
          .set({ vote_type: -1 })
          .where('comment_id', '=', commentId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Comments')
          .set({
            downvotes: sql<number>`downvotes + 1`,
            upvotes: sql<number>`upvotes - 1`,
          })
          .where('id', '=', commentId)
          .execute();
      }
    } else {
      // New downvote
      await db
        .insertInto('MemeImplementation001CommentVotes')
        .values({ comment_id: commentId, user_id: userId, vote_type: -1 })
        .execute();

      await db
        .updateTable('MemeImplementation001Comments')
        .set({ downvotes: sql<number>`downvotes + 1` })
        .where('id', '=', commentId)
        .execute();
    }

    console.log('[MEME API] ✅ Comment downvote processed');
    res.json({ message: 'Comment downvoted' });
  } catch (error) {
    console.error('[MEME API] Error downvoting comment:', error);
    res.status(500).json({ error: 'Failed to downvote comment' });
  }
});

export default router;
