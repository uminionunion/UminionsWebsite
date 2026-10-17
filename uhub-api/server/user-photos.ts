import { Router } from 'express';
import { randomUUID } from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';
import { requireAuth } from './auth-middleware.js';
import { createMediaUpload, storeMemeUpload } from './meme-upload.js';
import { InvalidMediaError, sanitizeUploadedMedia } from './media-sanitizer.js';
import { photosSqlite, photoSelection, photoDataDirectory, type UserPhoto } from './user-photos-db.js';
import sharp from 'sharp';

const router = Router();
class PhotoLimitError extends Error {}
const maxSize = 25 * 1024 ** 3;
const directory = path.join(photoDataDirectory, 'uploads', 'user-photos');
const parseUpload = createMediaUpload({
  maxFiles: 100, maxSize, extensions: new Set(['.jpg', '.jpeg', '.png']), fields: ['purpose', 'caption'],
});
const validId = (value: unknown): value is string => typeof value === 'string' && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));

router.get('/api/user-photos/image/:id/thumbnail', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid photo ID' });
  try {
    const photo = photosSqlite.prepare('SELECT * FROM photos WHERE id = ?').get(Number(req.params.id)) as UserPhoto | undefined;
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    const thumbnail = path.join(directory, `thumbnail-${photo.id}.png`);
    try {
      await fs.access(thumbnail);
    } catch (error) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
      let source: string;
      if (photo.filename) source = path.join(directory, path.basename(photo.filename));
      else if (/^\/data\/profile-images\/[^/\\]+$/.test(photo.url)) source = path.join(photoDataDirectory, 'profile-images', path.basename(photo.url));
      else return res.redirect(302, photo.url);
      await fs.mkdir(directory, { recursive: true });
      await sharp(source).autoOrient().resize({ width: 320, height: 320, fit: 'inside', withoutEnlargement: true }).png().toFile(thumbnail);
    }
    res.set('Cache-Control', 'no-store').sendFile(thumbnail);
  } catch (error) {
    console.error('[USER PHOTOS] Thumbnail retrieval failed:', error);
    res.status(500).json({ error: 'Unable to load the image preview' });
  }
});

router.get('/api/user-photos/:userId', async (req, res) => {
  if (!validId(req.params.userId)) return res.status(400).json({ error: 'Invalid user ID' });
  try {
    const userId = Number(req.params.userId);
    const photos = photosSqlite.prepare('SELECT id,user_id,url,caption,purpose,created_at FROM photos WHERE user_id = ? ORDER BY id DESC').all(userId);
    res.set('Cache-Control', 'no-store').json({ photos, ...photoSelection(userId) });
  } catch (error) {
    console.error('[USER PHOTOS] Library retrieval failed:', error);
    res.status(500).json({ error: 'Unable to retrieve the photo library' });
  }
});

router.post('/api/user-photos', requireAuth, parseUpload, async (req, res) => {
  const saved: string[] = [];
  try {
    const userId = req.user!.userId;
    const { purpose = 'library', caption = '' } = req.body || {};
    if (!['library', 'profile', 'cover'].includes(purpose) || typeof caption !== 'string' || [...caption].length > 1000 || caption.includes('\0')) {
      return res.status(400).json({ error: 'Invalid photo purpose or caption; captions allow up to 1,000 characters' });
    }
    const files = req.memeUploads || [];
    if (!files.length || ((purpose === 'profile' || purpose === 'cover') && files.length !== 1)) {
      return res.status(400).json({ error: 'Select photos, or exactly one profile/cover image' });
    }
    const count = () => (photosSqlite.prepare('SELECT count(*) AS total FROM photos WHERE user_id = ?').get(userId) as { total: number }).total;
    if (count() + files.length > 100) return res.status(409).json({ error: 'Each user can keep at most 100 photos' });
    if (files.some(file => file.size > maxSize)) return res.status(413).json({ error: 'Each photo must be 25GB or smaller' });
    await fs.mkdir(directory, { recursive: true });
    const entries: { url: string; filename: string }[] = [];
    for (const file of files) {
      const extension = path.extname(file.name).toLowerCase();
      file.tempFilePath = await sanitizeUploadedMedia(file.tempFilePath, extension);
      const filename = `${randomUUID()}${extension}`;
      const destination = path.join(directory, filename);
      saved.push(destination);
      await storeMemeUpload(file, destination);
      entries.push({ url: `/api/uploads/user-photos/${filename}`, filename });
    }
    const photos = photosSqlite.transaction(() => {
      if (count() + entries.length > 100) throw new PhotoLimitError('Each user can keep at most 100 photos');
      const result = entries.map(entry => {
        const inserted = photosSqlite.prepare('INSERT INTO photos(user_id,url,filename,caption,purpose) VALUES (?,?,?,?,?)')
          .run(userId, entry.url, entry.filename, caption, purpose);
        return photosSqlite.prepare('SELECT id,user_id,url,caption,purpose,created_at FROM photos WHERE id = ?').get(inserted.lastInsertRowid) as UserPhoto;
      });
      if (purpose !== 'library') {
        photosSqlite.prepare('INSERT OR IGNORE INTO selections(user_id) VALUES (?)').run(userId);
        const column = purpose === 'profile' ? 'profile_id' : 'cover_id';
        const userColumn = purpose === 'profile' ? 'profile_image_url' : 'cover_photo_url';
        photosSqlite.prepare(`UPDATE selections SET ${column} = ? WHERE user_id = ?`).run(result[0].id, userId);
        const changed = photosSqlite.prepare(`UPDATE accounts.users SET ${userColumn} = ? WHERE id = ?`).run(result[0].url, userId);
        if (!changed.changes) throw new Error('The uploading user no longer exists');
      }
      return result;
    })();
    res.status(201).json({ photo: photos[0], photos, ...photoSelection(userId) });
  } catch (error) {
    await Promise.all(saved.map(filename => fs.rm(filename, { force: true }).catch(cleanupError => console.error('[USER PHOTOS] Failed upload cleanup:', cleanupError))));
    console.error('[USER PHOTOS] Upload failed:', error);
    res.status(error instanceof InvalidMediaError ? 400 : error instanceof PhotoLimitError ? 409 : 500).json({
      error: error instanceof InvalidMediaError ? 'The uploaded media is not a valid supported image' : error instanceof PhotoLimitError ? error.message : 'Unable to save uploaded photos',
    });
  }
});

router.put('/api/user-photos/:id', requireAuth, (req, res) => {
  if (!validId(req.params.id) || typeof req.body?.caption !== 'string' || [...req.body.caption].length > 1000 || req.body.caption.includes('\0')) {
    return res.status(400).json({ error: 'A valid photo ID and caption of up to 1,000 characters are required' });
  }
  try {
    const result = photosSqlite.prepare('UPDATE photos SET caption = ? WHERE id = ? AND user_id = ?')
      .run(req.body.caption, Number(req.params.id), req.user!.userId);
    if (!result.changes) return res.status(404).json({ error: 'Photo not found or not owned by you' });
    res.json({ success: true });
  } catch (error) {
    console.error('[USER PHOTOS] Caption update failed:', error);
    res.status(500).json({ error: 'Unable to update the caption' });
  }
});

router.delete('/api/user-photos/:id', requireAuth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid photo ID' });
  try {
    const userId = req.user!.userId;
    const photo = photosSqlite.transaction(() => {
      const photo = photosSqlite.prepare('SELECT * FROM photos WHERE id = ? AND user_id = ?').get(Number(req.params.id), userId) as UserPhoto | undefined;
      if (!photo) return undefined;
      photosSqlite.prepare('DELETE FROM photos WHERE id = ? AND user_id = ?').run(photo.id, userId);
      const selected = photoSelection(userId);
      photosSqlite.prepare('UPDATE accounts.users SET profile_image_url = ?, cover_photo_url = ? WHERE id = ?')
        .run(selected.profile_image_url, selected.cover_photo_url, userId);
      return photo;
    })();
    if (!photo) return res.status(404).json({ error: 'Photo not found or not owned by you' });
    if (photo.filename) {
      await fs.rm(path.join(directory, path.basename(photo.filename)), { force: true })
        .catch(error => console.error('[USER PHOTOS] Deleted image file cleanup failed:', error));
    }
    else if (/^\/data\/profile-images\/profile-\d+-\d+\.(?:jpe?g|png)$/i.test(photo.url)) {
      await fs.rm(path.join(photoDataDirectory, 'profile-images', path.basename(photo.url)), { force: true })
        .catch(error => console.error('[USER PHOTOS] Legacy image cleanup failed:', error));
    }
    await fs.rm(path.join(directory, `thumbnail-${photo.id}.png`), { force: true })
      .catch(error => console.error('[USER PHOTOS] Thumbnail cleanup failed:', error));
    res.json({ success: true, ...photoSelection(userId) });
  } catch (error) {
    console.error('[USER PHOTOS] Delete failed:', error);
    res.status(500).json({ error: 'Unable to delete the photo' });
  }
});

export default router;
