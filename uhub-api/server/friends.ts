
import { Router } from 'express';
import { db } from './db.js';
import { authenticate } from './auth-middleware.js';

const router = Router();

// Get pending friend requests for the logged-in user
router.get('/requests/pending', authenticate, async (req, res) => {
  const userId = req.user.userId;
  try {
    const requests = await db
      .selectFrom('friends')
      .innerJoin('users', 'users.id', 'friends.user_id1')
      .where('friends.user_id2', '=', userId)
      .where('friends.status', '=', 'pending')
      .select(['friends.id', 'friends.user_id1', 'users.username as user1_username', 'users.profile_image_url as user1_profile_image_url'])
      .execute();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get accepted friends for the logged-in user
router.get('/', authenticate, async (req, res) => {
    const userId = req.user.userId;
    try {
        const friends = await db.selectFrom('friends')
            .select(['user_id1', 'user_id2'])
            .where('status', '=', 'accepted')
            .where((eb) => eb.or([
                eb('user_id1', '=', userId),
                eb('user_id2', '=', userId)
            ]))
            .execute();

        const friendIds = friends.map(f => f.user_id1 === userId ? f.user_id2 : f.user_id1);

        if (friendIds.length === 0) {
            res.json([]);
            return;
        }

        const friendUsers = await db.selectFrom('users')
            .where('id', 'in', friendIds)
            .select(['id', 'username', 'profile_image_url'])
            .execute();
        
        res.json(friendUsers);

    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Send a friend request
router.post('/request', authenticate, async (req, res) => {
  const { userId: userToRequestId } = req.body;
  const requesterId = req.user.userId;

  if (requesterId === userToRequestId) {
    res.status(400).json({ message: "You can't send a friend request to yourself." });
    return;
  }

  try {
    // Ensure user_id1 is always the smaller ID to prevent duplicate requests in different orders
    const [user_id1, user_id2] = [requesterId, userToRequestId].sort((a, b) => a - b);

    const existingRequest = await db.selectFrom('friends')
      .where('user_id1', '=', user_id1)
      .where('user_id2', '=', user_id2)
      .executeTakeFirst();

    if (existingRequest) {
      res.status(409).json({ message: 'Friend request already exists or you are already friends.' });
      return;
    }

    await db.insertInto('friends')
      .values({
        user_id1: requesterId,
        user_id2: userToRequestId,
        status: 'pending'
      })
      .execute();
    res.status(201).json({ message: 'Friend request sent.' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Accept a friend request
router.post('/accept', authenticate, async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user.userId;

  try {
    const result = await db.updateTable('friends')
      .set({ status: 'accepted' })
      .where('id', '=', requestId)
      .where('user_id2', '=', userId) // Only the recipient can accept
      .where('status', '=', 'pending')
      .executeTakeFirst();

    if (result.numUpdatedRows > 0) {
      res.status(200).json({ message: 'Friend request accepted.' });
    } else {
      res.status(404).json({ message: 'Request not found or you are not authorized to accept it.' });
    }
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject a friend request
router.post('/reject', authenticate, async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user.userId;

  try {
    const request = await db.selectFrom('friends').where('id', '=', requestId).select(['user_id1', 'user_id2']).executeTakeFirst();
    if (!request || (request.user_id1 !== userId && request.user_id2 !== userId)) {
        res.status(404).json({ message: 'Request not found or you are not part of it.' });
        return;
    }

    const result = await db.deleteFrom('friends')
      .where('id', '=', requestId)
      .executeTakeFirst();

    if (result.numDeletedRows > 0) {
      res.status(200).json({ message: 'Friend request rejected.' });
    } else {
      res.status(404).json({ message: 'Request not found.' });
    }
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Block a user
router.post('/block', authenticate, async (req, res) => {
    const { userId: blockedId } = req.body;
    const blockerId = req.user.userId;

    try {
        await db.insertInto('blocked_users')
            .values({ blocker_id: blockerId, blocked_id: blockedId })
            .onConflict((oc) => oc.doNothing())
            .execute();
        
        // Also remove any friend connection
        const [user_id1, user_id2] = [blockerId, blockedId].sort((a, b) => a - b);
        await db.deleteFrom('friends')
            .where('user_id1', '=', user_id1)
            .where('user_id2', '=', user_id2)
            .execute();

        res.status(200).json({ message: 'User blocked.' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Report a user
router.post('/report', authenticate, async (req, res) => {
    const { reportedId, reason } = req.body;
    const reporterId = req.user.userId;

    if (!reportedId || !reason) {
        res.status(400).json({ message: 'Reported user ID and reason are required.' });
        return;
    }

    try {
        await db.insertInto('reports')
            .values({ reporter_id: reporterId, reported_id: reportedId, reason })
            .execute();
        res.status(201).json({ message: 'User reported successfully.' });
    } catch (error) {
        console.error('Error reporting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
