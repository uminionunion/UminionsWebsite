// server/index.ts
import express, { Router, Request, Response } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import memesRouter from './memes.js';

dotenv.config();

// Type extension for authenticated requests
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
      };
    }
  }
}

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? true 
      : `http://localhost:${process.env.VITE_PORT || 3000}`,
    credentials: true,
  },
});

function sanitizeStringRoute(s: unknown): string {
  if (!s || typeof s !== 'string') return String(s ?? '/');
  const t = s.trim();
  if (t.startsWith('http://') || t.startsWith('https://') || t.includes('://')) {
    try {
      return new URL(t).pathname || '/';
    } catch {
      return '/';
    }
  }
  return t || '/';
}

function warnIfUrlAndStack(s: string) {
  if (process.env.DEBUG_ROUTE_SANITIZE !== 'true') return;
  if (!s) return;
  const looksLikeUrl = s.includes('://') || s.includes('git.new') || s.startsWith('http');
  if (!looksLikeUrl) return;
  console.error('DEBUG: sanitizing route mount that looks like URL:', s);
  console.error(new Error().stack?.split('\n').slice(2, 8).join('\n'));
}

function patchMethodOn(target: any, methodName: string) {
  if (!target || typeof target[methodName] !== 'function') return;
  const orig = target[methodName];
  target[methodName] = function (arg1: any, ...rest: any[]) {
    try {
      const shouldDebug = process.env.DEBUG_ROUTE_SANITIZE === 'true';
      if (shouldDebug && typeof arg1 === 'string') {
        console.error(`DEBUG-ROUTE: registering via ${methodName} value=`, arg1);
        console.error(new Error().stack?.split('\n').slice(2, 10).join('\n'));
      }
    } catch (_) {}

    const first = typeof arg1 === 'string'
      ? ((): string => {
          warnIfUrlAndStack(arg1);
          try {
            return sanitizeStringRoute(arg1);
          } catch {
            return '/';
          }
        })()
      : arg1;

    return orig.apply(this, [first, ...rest]);
  };
}

['use', 'get', 'post', 'put', 'delete', 'all'].forEach((m) => patchMethodOn(app, m));

const RouterProto = (Router as any)?.prototype;
if (RouterProto) {
  ['use', 'get', 'post', 'put', 'delete', 'all'].forEach((m) => patchMethodOn(RouterProto, m));
}







// Increase JSON payload limit for large image uploads (base64) HERE IS HOW TO UPGRADE HOW MUCH YOU ALLOW PPL TO UPLOAD IMAGES OR MP4S BYTES & SUCH!
// Videos convert to base64 at ~1.33x size, so 50MB video = 66.5MB base64
app.use(express.json({ limit: "50gb" }));
app.use(express.urlencoded({ limit: "50gb", extended: true }));
app.use(cookieParser());
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 * 1024 }, // 50GB
}));

const [{ setupStaticServing }, authMod, friendsMod, { setupChat }, productsMod] = await Promise.all([
  import('./static-serve.js'),
  import('./auth.js'),
  import('./friends.js'),
  import('./chat.js'),
  import('./products.js'),
]);


// Middleware for authentication
const authMiddleware = (req: Request, res: Response, next: Function) => {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key') as any;
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};



const authRouter: Router = (authMod && (authMod as any).default) ? (authMod as any).default as Router : (authMod as any) as Router;
const friendsRouter: Router = (friendsMod && (friendsMod as any).default) ? (friendsMod as any).default as Router : (friendsMod as any) as Router;
const productsRouter: Router = (productsMod && (productsMod as any).default) ? (productsMod as any).default as Router : (productsMod as any) as Router;

app.use('/api/auth', authRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/products', productsRouter);

// Register meme routes
app.use(memesRouter);

// NEW: User lookup route (accessible to all, no auth required)
app.get('/api/users/by-username/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ error: 'Username required' });
      return;
    }

    console.log(`[API] Fetching user by username: ${username}`);

    // Search for user by exact username
    let user = await db
      .selectFrom('users')
      .select(['id', 'username', 'profile_image_url', 'cover_photo_url'])
      .where('username', '=', username)
      .executeTakeFirst();

    // If not found and doesn't start with 'u', try adding 'u' prefix
    if (!user && !username.startsWith('u')) {
      const prefixedUsername = 'u' + username;
      user = await db
        .selectFrom('users')
        .select(['id', 'username', 'profile_image_url', 'cover_photo_url'])
        .where('username', '=', prefixedUsername)
        .executeTakeFirst();
    }

    if (!user) {
      console.log(`[API] User not found: ${username}`);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.log(`[API] ✅ Found user: ${user.username} (ID: ${user.id})`);
    res.status(200).json(user);
  } catch (error) {
    console.error('[API] Error fetching user by username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// /api/broadcasts - Handles broadcast-related endpoints
app.post('/api/broadcasts/union-news-14/images/add', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if user is high-high-high admin
    const user = await db
      .selectFrom('users')
      .select(['is_high_high_high_admin'])
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    if (!user || user.is_high_high_high_admin !== 1) {
      res.status(403).json({ error: 'Only high-high-high admins can add broadcast images' });
      return;
    }

    // Check if file was uploaded
    const files = req.files as any;
    if (!files || !files.image) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const uploadedFile = files.image as any;
    const { title = '', description = '', clickUrl = '' } = req.body;

    // Validate file is an image
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(uploadedFile.mimetype)) {
      res.status(400).json({ error: 'Only JPG, JPEG, and PNG images are allowed' });
      return;
    }

    // Create broadcast-images directory if it doesn't exist
    const broadcastImagesDir = path.join(process.cwd(), 'data', 'broadcast-images');
    if (!fs.existsSync(broadcastImagesDir)) {
      fs.mkdirSync(broadcastImagesDir, { recursive: true });
      console.log(`[BROADCASTS] Created broadcast-images directory: ${broadcastImagesDir}`);
    }

    // Generate filename
    const fileName = `union-news-14-${Date.now()}.jpg`;
    const filePath = path.join(broadcastImagesDir, fileName);

    // Save file to disk
    await uploadedFile.mv(filePath);
    console.log(`[BROADCASTS] Image saved to disk: ${filePath}`);

    // Build the full URL path for serving
    const imageUrl = `/data/broadcast-images/${fileName}`;

  // Insert into database
// Get the max display_order to insert new image at the beginning
const maxOrder = await db
  .selectFrom('MainHubUpgradeV001ForBroadcasts')
  .select(db.fn.max('display_order').as('maxOrder'))
  .executeTakeFirst();

const nextOrder = (maxOrder?.maxOrder || 0) + 1;

const newImage = await db
  .insertInto('MainHubUpgradeV001ForBroadcasts')
  .values({
    user_id: req.user.userId,
    name: title || `Image ${Date.now()}`,
    image_url: imageUrl,
    click_url: clickUrl || null,
    description: description || null,
    display_order: nextOrder,
  })
  .returning('id')
  .executeTakeFirst();

    console.log(`[BROADCASTS] Image record created with ID: ${newImage?.id}, URL: ${imageUrl}`);

    res.status(200).json({
      id: newImage?.id,
      title: title || undefined,
      imageUrl: imageUrl,
      clickUrl: clickUrl || undefined,
      description: description || undefined,
    });
  } catch (error) {
    console.error('[BROADCASTS] Error adding image:', error);
    res.status(500).json({ error: 'Failed to add image to broadcast' });
  }
});




// GET - Retrieve all UnionNews14 broadcast images
app.get('/api/broadcasts/union-news-14/images', async (req: Request, res: Response) => {
  try {
    const images = await db
      .selectFrom('MainHubUpgradeV001ForBroadcasts')
      .select(['id', 'name', 'image_url', 'click_url', 'description', 'created_at', 'display_order'])
      .orderBy('display_order', 'desc')  // Changed: order by display_order DESC (newest first)
      .execute();

    console.log(`[BROADCASTS] Fetched ${images.length} UnionNews14 images from database`);

    // Format for frontend
    const formattedImages = images.map(img => ({
      id: img.id,
      title: img.name || '',
      imageUrl: img.image_url || '',
      clickUrl: img.click_url || '',
      description: img.description || undefined,
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error('[BROADCASTS] Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch broadcast images' });
  }
});


// POST - Reorder image LEFT (swap with previous)
app.post('/api/broadcasts/union-news-14/images/:id/move-left', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if user is high-high-high admin
    const user = await db
      .selectFrom('users')
      .select(['is_high_high_high_admin'])
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    if (!user || user.is_high_high_high_admin !== 1) {
      res.status(403).json({ error: 'Only high-high-high admins can reorder images' });
      return;
    }

    const imageId = parseInt(req.params.id, 10);
    if (isNaN(imageId)) {
      res.status(400).json({ error: 'Invalid image ID' });
      return;
    }

    // Get the image we're moving
    const currentImage = await db
      .selectFrom('MainHubUpgradeV001ForBroadcasts')
      .select(['id', 'display_order'])
      .where('id', '=', imageId)
      .executeTakeFirst();

    if (!currentImage) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    // Find the image with display_order one HIGHER (moves LEFT in desc-ordered carousel)
    const previousImage = await db
      .selectFrom('MainHubUpgradeV001ForBroadcasts')
      .select(['id', 'display_order'])
      .where('display_order', '>', currentImage.display_order)  // ✅ FIXED: Look for HIGHER order
      .orderBy('display_order', 'asc')
      .limit(1)
      .executeTakeFirst();

    if (!previousImage) {
      res.status(400).json({ error: 'Cannot move further left' });
      return;
    }

    // Swap their display_order values
    const tempOrder = currentImage.display_order;
    
    await db
      .updateTable('MainHubUpgradeV001ForBroadcasts')
      .set({ display_order: previousImage.display_order })
      .where('id', '=', currentImage.id)
      .execute();

    await db
      .updateTable('MainHubUpgradeV001ForBroadcasts')
      .set({ display_order: tempOrder })
      .where('id', '=', previousImage.id)
      .execute();

    console.log(`[BROADCASTS] Swapped image ${imageId} left with ${previousImage.id}`);

    res.status(200).json({ success: true, message: 'Image moved left' });
  } catch (error) {
    console.error('[BROADCASTS] Error moving image left:', error);
    res.status(500).json({ error: 'Failed to move image' });
  }
});






// POST - Reorder image RIGHT (swap with next)
app.post('/api/broadcasts/union-news-14/images/:id/move-right', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if user is high-high-high admin
    const user = await db
      .selectFrom('users')
      .select(['is_high_high_high_admin'])
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    if (!user || user.is_high_high_high_admin !== 1) {
      res.status(403).json({ error: 'Only high-high-high admins can reorder images' });
      return;
    }

    const imageId = parseInt(req.params.id, 10);
    if (isNaN(imageId)) {
      res.status(400).json({ error: 'Invalid image ID' });
      return;
    }

    // Get the image we're moving
    const currentImage = await db
      .selectFrom('MainHubUpgradeV001ForBroadcasts')
      .select(['id', 'display_order'])
      .where('id', '=', imageId)
      .executeTakeFirst();

    if (!currentImage) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    // Find the image with display_order one LOWER (moves RIGHT in desc-ordered carousel)
    const nextImage = await db
      .selectFrom('MainHubUpgradeV001ForBroadcasts')
      .select(['id', 'display_order'])
      .where('display_order', '<', currentImage.display_order)  // ✅ FIXED: Look for LOWER order
      .orderBy('display_order', 'desc')
      .limit(1)
      .executeTakeFirst();

    if (!nextImage) {
      res.status(400).json({ error: 'Cannot move further right' });
      return;
    }

    // Swap their display_order values
    const tempOrder = currentImage.display_order;
    
    await db
      .updateTable('MainHubUpgradeV001ForBroadcasts')
      .set({ display_order: nextImage.display_order })
      .where('id', '=', currentImage.id)
      .execute();

    await db
      .updateTable('MainHubUpgradeV001ForBroadcasts')
      .set({ display_order: tempOrder })
      .where('id', '=', nextImage.id)
      .execute();

    console.log(`[BROADCASTS] Swapped image ${imageId} right with ${nextImage.id}`);

    res.status(200).json({ success: true, message: 'Image moved right' });
  } catch (error) {
    console.error('[BROADCASTS] Error moving image right:', error);
    res.status(500).json({ error: 'Failed to move image' });
  }
});




// Initialize Socket.IO chat functionality
setupChat(io);

function resolvePublicPath(): string {
  const candidates = [
    path.join(process.cwd(), 'dist', 'public'),
    path.join(process.cwd(), 'dist'),
    path.join(process.cwd(), 'public'),
    process.cwd(),
  ];
  for (const p of candidates) {
    try {
      const stat = fs.statSync(p);
      if (stat && stat.isDirectory()) {
        return p;
      }
    } catch {
      // ignore
    }
  }
  return process.cwd();
}

function logRegisteredRoutes() {
  try {
    const router = (app as any)._router;
    if (!router || !router.stack) {
      console.log('No router stack available');
      return;
    }
    console.log('--- Registered routes and middleware ---');
    router.stack.forEach((r: any) => {
      if (r.route && r.route.path) {
        const methods = Object.keys(r.route.methods).join(',').toUpperCase();
        console.log(`${methods} ${r.route.path}`);
      } else if (r.name === 'router' && r.regexp) {
        console.log(`Mounted router regexp: ${r.regexp}`);
      } else {
        console.log('Middleware:', r.name || r.handle?.name || r);
      }
    });
    console.log('----------------------------------------');
  } catch (err) {
    console.error('Route listing failed', err);
  }
}



// NEW: Check if rooms have any messages (for all users, logged in or not)
app.get('/api/chat/rooms-with-messages', async (req: Request, res: Response) => {
  try {
    // Get all rooms that have messages
    const roomsWithMessages = await db
      .selectFrom('messages')
      .select('room')
      .distinct()
      .execute();

    // Extract unique room names and convert to chatroom numbers
    const roomSet = new Set<number>();
    roomsWithMessages.forEach(msg => {
      // Extract chatroom number from room name
      // Format: "SisterUnion001NewEngland-chatroom-1" -> number 1
      const match = msg.room.match(/SisterUnion(\d+)/);
      if (match) {
        const chatroomNum = parseInt(match[1], 10);
        roomSet.add(chatroomNum);
      }
    });

    console.log('[API] Rooms with messages:', Array.from(roomSet));
    res.status(200).json(Array.from(roomSet));
  } catch (error) {
    console.error('[API] Error fetching rooms with messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat unread status routes (authenticated users only)
app.get('/api/chat/unread-status', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const unreadStatus = await db
      .selectFrom('chatroom_unread_status')
      .where('user_id', '=', req.user.userId)
      .where('has_unread', '=', 1)
      .selectAll()
      .execute();

    res.status(200).json(unreadStatus);
  } catch (error) {
    console.error('[API] Error fetching unread status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat/mark-as-read', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { chatroomNumber } = req.body;
    
    const sisterUnionNum = String(chatroomNumber).padStart(2, '0');
    const roomName = `SisterUnion${sisterUnionNum}-chatroom-1`;

    await db
      .updateTable('chatroom_unread_status')
      .set({ has_unread: 0 })
      .where('user_id', '=', req.user.userId)
      .where('chatroom_room_name', '=', roomName)
      .execute();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[API] Error marking as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export async function startServer(port: number | string) {
  try {
    if (process.env.NODE_ENV === 'production') {
      const publicPath = resolvePublicPath();
      console.log('Production static path resolved to:', publicPath);

      app.use(express.static(publicPath, { index: false }));
      app.use('/data', express.static(path.join(process.cwd(), 'data')));

      app.get(/.*/, (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        const indexFile = path.join(publicPath, 'index.html');
        if (!fs.existsSync(indexFile)) return res.status(404).send('Not Found');
        res.sendFile(indexFile, (err) => {
          if (err) next(err);
        });
      });

      try {
        setupStaticServing(app);
      } catch (err) {
        console.warn('setupStaticServing() threw an error (ignored):', err);
      }
    }

    server.listen(port, () => {
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
