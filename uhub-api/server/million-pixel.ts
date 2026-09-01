import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { requireAuth } from './auth-middleware.js';

const router = Router();
const costs = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
const isHexColor = (color: string) => /^#[0-9a-fA-F]{6}$/.test(color);

async function ensureInventory(userId: number) {
  let inventory = await db.selectFrom('MillionPixelUserTickets').selectAll().where('user_id', '=', userId).executeTakeFirst();
  if (!inventory) {
    inventory = await db.insertInto('MillionPixelUserTickets').values({ user_id: userId, total_pixeltickets: 1000 }).returningAll().executeTakeFirstOrThrow();
  }
  return inventory;
}

router.get('/api/million-pixel/inventory', requireAuth, async (req: Request, res: Response) => {
  try {
    res.json({ inventory: await ensureInventory(req.user!.userId) });
  } catch (error) {
    console.error('[MILLION_PIXEL] Failed to load inventory:', error);
    res.status(500).json({ error: 'Failed to load inventory' });
  }
});

router.get('/api/million-pixel/pixels', async (req: Request, res: Response) => {
  try {
    const historyPage = Number(req.query.historyPage || 0);
    if (historyPage >= 1 && historyPage <= 10) {
      const pixels = await db.selectFrom('MillionPixelHistory').select(['pixel_x as x', 'pixel_y as y', 'color', 'change_number']).where('change_number', '=', historyPage).execute();
      return res.json({ pixels });
    }
    const pixels = await db.selectFrom('MillionPixels').selectAll().execute();
    res.json({ pixels });
  } catch (error) {
    console.error('[MILLION_PIXEL] Failed to load pixels:', error);
    res.status(500).json({ error: 'Failed to load pixels' });
  }
});

router.get('/api/million-pixel/pixels/:x/:y', async (req: Request, res: Response) => {
  try {
    const x = Number(req.params.x);
    const y = Number(req.params.y);
    const pixel = await db.selectFrom('MillionPixels').selectAll().where('x', '=', x).where('y', '=', y).executeTakeFirst();
    const changeCount = pixel?.change_count || 0;
    res.json({ pixel: pixel || { x, y, color: '#ffffff', change_count: 0, next_cost_tickets: 1 }, nextCost: changeCount >= 10 ? null : costs[changeCount] });
  } catch (error) {
    console.error('[MILLION_PIXEL] Failed to load pixel:', error);
    res.status(500).json({ error: 'Failed to load pixel' });
  }
});

router.post('/api/million-pixel/pixels/:x/:y/change', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    // Million-Pixel is disabled for everyone except user ID 1 until Stripe/WooCommerce is finished.
    if (userId !== 1) return res.status(403).json({ error: 'Million-Pixel is not yet available.' });
    const x = Number(req.params.x);
    const y = Number(req.params.y);
    const color = String(req.body.color || '');
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x > 999 || y < 0 || y > 999) return res.status(400).json({ error: 'Invalid pixel coordinates' });
    if (!isHexColor(color)) return res.status(400).json({ error: 'Invalid hex color' });

    const result = await db.transaction().execute(async (trx) => {
      let inventory = await trx.selectFrom('MillionPixelUserTickets').selectAll().where('user_id', '=', userId).executeTakeFirst();
      if (!inventory) inventory = await trx.insertInto('MillionPixelUserTickets').values({ user_id: userId, total_pixeltickets: 1000 }).returningAll().executeTakeFirstOrThrow();
      const existing = await trx.selectFrom('MillionPixels').selectAll().where('x', '=', x).where('y', '=', y).executeTakeFirst();
      const changeCount = existing?.change_count || 0;
      if (changeCount >= 10) throw new Error('This pixel has reached maximum changes.');
      const cost = costs[changeCount];
      if (inventory.total_pixeltickets < cost) throw new Error(`Insufficient PixelTickets. Need ${cost}, have ${inventory.total_pixeltickets}.`);
      const nextCount = changeCount + 1;
      const nextCost = nextCount >= 10 ? 512 : costs[nextCount];
      const pixel = existing
        ? await trx.updateTable('MillionPixels').set({ color, change_count: nextCount, next_cost_tickets: nextCost, last_changed_by: userId, last_changed_at: new Date().toISOString() }).where('x', '=', x).where('y', '=', y).returningAll().executeTakeFirstOrThrow()
        : await trx.insertInto('MillionPixels').values({ x, y, color, change_count: nextCount, next_cost_tickets: nextCost, last_changed_by: userId, last_changed_at: new Date().toISOString() }).returningAll().executeTakeFirstOrThrow();
      await trx.insertInto('MillionPixelHistory').values({ pixel_x: x, pixel_y: y, change_number: nextCount, color, changed_by_user_id: userId }).execute();
      await trx.updateTable('MillionPixelUserTickets').set({ total_pixeltickets: inventory.total_pixeltickets - cost }).where('user_id', '=', userId).execute();
      return { pixel, costUsed: cost, newUserTotalTickets: inventory.total_pixeltickets - cost };
    });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change pixel';
    console.error('[MILLION_PIXEL] Failed to change pixel:', error);
    res.status(message.includes('Insufficient') ? 402 : 400).json({ error: message });
  }
});

export default router;
