import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { requireAuth } from './auth-middleware.js';
import path from 'path';
import fs from 'fs';

const router = Router();

const asString = (value: unknown) => Array.isArray(value) ? String(value[0] || '') : String(value || '');

router.get('/api/umimatch/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    let profile = await db.selectFrom('UmiMatchProfiles').selectAll().where('user_id', '=', userId).executeTakeFirst();
    if (!profile) {
      profile = await db.insertInto('UmiMatchProfiles').values({ user_id: userId }).returningAll().executeTakeFirstOrThrow();
    }
    res.json({ profile });
  } catch (error) {
    console.error('[UMIMATCH] Failed to load profile:', error);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

router.put('/api/umimatch/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const imageUpdates: Record<string, string | null> = {};
    if (req.files && typeof req.files === 'object') {
      const files = req.files as any;
      for (let i = 1; i <= 5; i++) {
        const file = files[`image${i}`];
        if (file) {
          const singleFile = Array.isArray(file) ? file[0] : file;
          const fileName = `${Date.now()}-umimatch-${i}-${Math.random().toString(36).slice(2, 10)}${path.extname(singleFile.name)}`;
          const uploadsDir = path.join(process.env.DATA_DIRECTORY || process.cwd(), 'uploads');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          await singleFile.mv(path.join(uploadsDir, fileName));
          imageUpdates[`image${i}`] = `/api/uploads/${fileName}`;
        }
      }
    }

    const updates: any = {};
    if (req.body.bio !== undefined) updates.bio = asString(req.body.bio).slice(0, 1000);
    if (req.body.city !== undefined) updates.city = asString(req.body.city).slice(0, 120);
    if (req.body.gender !== undefined) updates.gender = asString(req.body.gender).slice(0, 40);
    if (req.body.interested_in !== undefined) updates.interested_in = asString(req.body.interested_in).slice(0, 40);
    if (req.body.max_distance !== undefined) updates.max_distance = Number.isFinite(Number(req.body.max_distance)) ? Number(req.body.max_distance) : 100;
    if (req.body.priority_image !== undefined) updates.priority_image = asString(req.body.priority_image).slice(0, 20);
    if (req.body.lat !== undefined) updates.lat = Number(req.body.lat);
    if (req.body.lng !== undefined) updates.lng = Number(req.body.lng);

    Object.assign(updates, imageUpdates);
    updates.is_enrolled = 1 as const;
    updates.deleted_at = null;

    const existing = await db.selectFrom('UmiMatchProfiles').select('id').where('user_id', '=', userId).executeTakeFirst();
    const profile = existing
      ? await db.updateTable('UmiMatchProfiles').set(updates).where('user_id', '=', userId).returningAll().executeTakeFirstOrThrow()
      : await db.insertInto('UmiMatchProfiles').values({ user_id: userId, ...updates }).returningAll().executeTakeFirstOrThrow();
    res.json({ profile });
  } catch (error) {
    console.error('[UMIMATCH] Failed to save profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

router.post('/api/umimatch/enroll', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const existing = await db.selectFrom('UmiMatchProfiles').select('id').where('user_id', '=', userId).executeTakeFirst();
    const profile = existing
      ? await db.updateTable('UmiMatchProfiles').set({ is_enrolled: 1, deleted_at: null }).where('user_id', '=', userId).returningAll().executeTakeFirstOrThrow()
      : await db.insertInto('UmiMatchProfiles').values({ user_id: userId, is_enrolled: 1 }).returningAll().executeTakeFirstOrThrow();
    res.json({ profile });
  } catch (error) {
    console.error('[UMIMATCH] Failed to enroll:', error);
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

router.post('/api/umimatch/remove', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const [profile, swipes, messages] = await Promise.all([
      db.selectFrom('UmiMatchProfiles').selectAll().where('user_id', '=', userId).executeTakeFirst(),
      db.selectFrom('UmiMatchSwipes').selectAll().where(eb => eb.or([eb('user_id', '=', userId), eb('target_user_id', '=', userId)])).execute(),
      db.selectFrom('UmiMatchMessages').selectAll().where(eb => eb.or([eb('sender_id', '=', userId), eb('receiver_id', '=', userId)])).execute(),
    ]);
    await db.insertInto('DeletedUmiMatchAccounts').values({ user_id: userId, profile_json: JSON.stringify(profile || null), swipes_json: JSON.stringify(swipes), messages_json: JSON.stringify(messages) }).execute();
    await db.deleteFrom('UmiMatchSwipes').where(eb => eb.or([eb('user_id', '=', userId), eb('target_user_id', '=', userId)])).execute();
    await db.deleteFrom('UmiMatchMessages').where(eb => eb.or([eb('sender_id', '=', userId), eb('receiver_id', '=', userId)])).execute();
    await db.updateTable('UmiMatchProfiles').set({ is_enrolled: 0, deleted_at: new Date().toISOString() }).where('user_id', '=', userId).execute();
    res.json({ success: true });
  } catch (error) {
    console.error('[UMIMATCH] Failed to remove account:', error);
    res.status(500).json({ error: 'Failed to remove UmiMatch account' });
  }
});

router.post('/api/umimatch/unmatch', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const targetUserId = Number(req.body.targetUserId);
    if (!Number.isFinite(targetUserId) || targetUserId === userId) return res.status(400).json({ error: 'Invalid user' });

    await db.deleteFrom('UmiMatchSwipes').where(eb => eb.or([
      eb.and([eb('user_id', '=', userId), eb('target_user_id', '=', targetUserId)]),
      eb.and([eb('user_id', '=', targetUserId), eb('target_user_id', '=', userId)]),
    ])).execute();
    await db.deleteFrom('UmiMatchMessages').where(eb => eb.or([
      eb.and([eb('sender_id', '=', userId), eb('receiver_id', '=', targetUserId)]),
      eb.and([eb('sender_id', '=', targetUserId), eb('receiver_id', '=', userId)]),
    ])).execute();

    res.json({ success: true });
  } catch (error) {
    console.error('[UMIMATCH] Unmatch failed:', error);
    res.status(500).json({ error: 'Failed to unmatch' });
  }
});

router.get('/api/umimatch/all-markers', requireAuth, async (req: Request, res: Response) => {
  try {
    const markers = await db.selectFrom('UmiMatchProfiles')
      .select(['lat', 'lng'] as any)
      .where('is_enrolled', '=', 1)
      .where('deleted_at', 'is', null)
      .execute();
    res.json({ markers });
  } catch (error) {
    console.error('[UMIMATCH] Failed to load markers:', error);
    res.status(500).json({ error: 'Failed to load markers' });
  }
});

router.get('/api/umimatch/discover', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const seen = await db.selectFrom('UmiMatchSwipes').select('target_user_id').where('user_id', '=', userId).execute();
    const seenIds = new Set(seen.map(item => item.target_user_id));
    const users = await db.selectFrom('users').select(['id', 'username', 'profile_image_url']).where('id', '!=', userId).execute();
    const profiles = await db.selectFrom('UmiMatchProfiles').selectAll().where('is_enrolled', '=', 1).where('deleted_at', 'is', null).execute();
    const enrolledIds = new Set(profiles.map(profile => profile.user_id));
    const cards = users
      .filter(user => !seenIds.has(user.id) && enrolledIds.has(user.id))
      .map(user => ({ ...user, profile: profiles.find(profile => profile.user_id === user.id) || null }))
      .slice(0, 20);
    res.json({ users: cards });
  } catch (error) {
    console.error('[UMIMATCH] Failed to discover users:', error);
    res.status(500).json({ error: 'Failed to discover users' });
  }
});

router.post('/api/umimatch/skip', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const targetUserId = Number(req.body.targetUserId);
    if (!Number.isFinite(targetUserId) || targetUserId === userId) return res.status(400).json({ error: 'Invalid user' });
    await db.insertInto('UmiMatchSwipes').values({ user_id: userId, target_user_id: targetUserId, action: 'skip' }).onConflict(oc => oc.columns(['user_id', 'target_user_id']).doUpdateSet({ action: 'skip' })).execute();
    res.json({ success: true });
  } catch (error) {
    console.error('[UMIMATCH] Failed to skip user:', error);
    res.status(500).json({ error: 'Failed to skip user' });
  }
});

router.post('/api/umimatch/like', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const targetUserId = Number(req.body.targetUserId);
    if (!Number.isFinite(targetUserId) || targetUserId === userId) return res.status(400).json({ error: 'Invalid user' });
    await db.insertInto('UmiMatchSwipes').values({ user_id: userId, target_user_id: targetUserId, action: 'like' }).onConflict(oc => oc.columns(['user_id', 'target_user_id']).doUpdateSet({ action: 'like' })).execute();
    const reciprocal = await db.selectFrom('UmiMatchSwipes').select('id').where('user_id', '=', targetUserId).where('target_user_id', '=', userId).where('action', '=', 'like').executeTakeFirst();
    res.json({ success: true, isMatch: !!reciprocal });
  } catch (error) {
    console.error('[UMIMATCH] Failed to like user:', error);
    res.status(500).json({ error: 'Failed to like user' });
  }
});

router.get('/api/umimatch/matches', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const likes = await db.selectFrom('UmiMatchSwipes').select('target_user_id').where('user_id', '=', userId).where('action', '=', 'like').execute();
    const incoming = await db.selectFrom('UmiMatchSwipes').select('user_id').where('target_user_id', '=', userId).where('action', '=', 'like').execute();
    const incomingIds = new Set(incoming.map(item => item.user_id));
    const matchIds = likes.map(item => item.target_user_id).filter(id => incomingIds.has(id));
    if (!matchIds.length) return res.json({ matches: [] });
    const users = await db.selectFrom('users').select(['id', 'username', 'profile_image_url']).where('id', 'in', matchIds).execute();
    const profiles = await db.selectFrom('UmiMatchProfiles').selectAll().where('user_id', 'in', matchIds).execute();
    res.json({ matches: users.map(user => ({ ...user, profile: profiles.find(profile => profile.user_id === user.id) || null })) });
  } catch (error) {
    console.error('[UMIMATCH] Failed to load matches:', error);
    res.status(500).json({ error: 'Failed to load matches' });
  }
});

router.get('/api/umimatch/messages/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const otherUserId = Number(req.params.userId);
    const messages = await db.selectFrom('UmiMatchMessages').selectAll().where(eb => eb.or([
      eb.and([eb('sender_id', '=', userId), eb('receiver_id', '=', otherUserId)]),
      eb.and([eb('sender_id', '=', otherUserId), eb('receiver_id', '=', userId)]),
    ])).orderBy('created_at', 'asc').execute();
    res.json({ messages });
  } catch (error) {
    console.error('[UMIMATCH] Failed to load messages:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

router.post('/api/umimatch/messages/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const senderId = req.user!.userId;
    const receiverId = Number(req.params.userId);
    const content = asString(req.body.content).trim();
    if (!content) return res.status(400).json({ error: 'Message is required' });
    const message = await db.insertInto('UmiMatchMessages').values({ sender_id: senderId, receiver_id: receiverId, content: content.slice(0, 2000) }).returningAll().executeTakeFirstOrThrow();
    res.status(201).json({ message });
  } catch (error) {
    console.error('[UMIMATCH] Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
