import { Router } from 'express';
import { db } from './db.js';
import { authenticate } from './auth-middleware.js';
const router = Router();
function idFrom(value) {
    const raw = Array.isArray(value) ? value[0] : value;
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
}
async function areFriends(userId, otherUserId) {
    const [user_id1, user_id2] = [userId, otherUserId].sort((a, b) => a - b);
    const friendship = await db.selectFrom('friends').select('id')
        .where('user_id1', '=', user_id1).where('user_id2', '=', user_id2).where('status', '=', 'accepted')
        .executeTakeFirst();
    return !!friendship;
}
router.get('/:userId', authenticate, async (req, res) => {
    const otherUserId = idFrom(req.params.userId);
    if (!otherUserId)
        return res.status(400).json({ error: 'Invalid user ID' });
    if (!(await areFriends(req.user.userId, otherUserId)))
        return res.status(403).json({ error: 'You must be friends to message this user.' });
    const messages = await db.selectFrom('DirectMessages').selectAll().where(eb => eb.or([
        eb.and([eb('sender_id', '=', req.user.userId), eb('receiver_id', '=', otherUserId)]),
        eb.and([eb('sender_id', '=', otherUserId), eb('receiver_id', '=', req.user.userId)]),
    ])).orderBy('created_at', 'asc').execute();
    res.json({ messages });
});
router.post('/:userId', authenticate, async (req, res) => {
    const otherUserId = idFrom(req.params.userId);
    if (!otherUserId)
        return res.status(400).json({ error: 'Invalid user ID' });
    if (!(await areFriends(req.user.userId, otherUserId)))
        return res.status(403).json({ error: 'You must be friends to message this user.' });
    const content = String(req.body.content || '').trim().slice(0, 2000);
    const attachmentUrl = typeof req.body.attachmentUrl === 'string' ? req.body.attachmentUrl.slice(0, 1000) : null;
    const attachmentType = typeof req.body.attachmentType === 'string' ? req.body.attachmentType.slice(0, 100) : null;
    if (!content && !attachmentUrl)
        return res.status(400).json({ error: 'Message or attachment is required.' });
    const message = await db.insertInto('DirectMessages').values({
        sender_id: req.user.userId, receiver_id: otherUserId, content, attachment_url: attachmentUrl, attachment_type: attachmentType,
    }).returningAll().executeTakeFirstOrThrow();
    res.status(201).json({ message });
});
export default router;
