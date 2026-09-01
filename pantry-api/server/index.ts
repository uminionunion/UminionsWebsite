// server/index.ts

// DIAGNOSTIC: patch path-to-regexp.parse to log its input before it throws.
// Place this before importing modules that might invoke path-to-regexp.
try {
  // Use require so this works both when compiled and during local dev
  // (path-to-regexp may be CJS in node_modules).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const p2r = require('path-to-regexp');
  if (p2r && typeof p2r.parse === 'function') {
    const origParse = p2r.parse;
    p2r.parse = function (str: any, options: any) {
      try {
        // log up to 2000 chars so we capture long values without flooding logs
        console.log('P2R PARSE INPUT >>>', String(str).slice(0, 2000));
      } catch (e) {
        console.log('P2R PARSE INPUT (failed to stringify)', e);
      }
      return origParse.call(this, str, options);
    };
    console.log('P2R parse patched for diagnostic logging');
  }
} catch (e) {
  console.log('P2R patch failed (module may load later)', e);
}

import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { setupStaticServing } from './static-serve.js';
import { db } from './db.js';
import type { Pantry } from './types.js';
import type { Express } from 'express';

dotenv.config();

const app = express();

/**
 * DIAGNOSTIC: install mount logging to capture every app.use / app.METHOD call
 * and print a short stack so we can identify the caller when a bad mount value
 * is passed to express / path-to-regexp.
 */
function installMountLogging(appInstance: Express) {
  const origUse = appInstance.use.bind(appInstance);
  (appInstance as any).use = function (...args: any[]) {
    try {
      const first = args[0];
      const mountInfo = typeof first === 'string' ? first : (first && first.name) || typeof first;
      console.log(`DEBUG MOUNT: app.use called with first arg = ${JSON.stringify(mountInfo)}`);
      const stack = new Error().stack?.split('\n').slice(2, 8).join('\n') || '';
      console.log('DEBUG MOUNT STACK:\n' + stack);
    } catch (e) {
      console.log('DEBUG MOUNT: failed to log mount args', e);
    }
    return origUse(...args);
  };

  const methodsToWrap = ['get', 'post', 'put', 'delete', 'patch', 'all'] as const;
  for (const m of methodsToWrap) {
    const orig = (appInstance as any)[m].bind(appInstance);
    (appInstance as any)[m] = function (pathOrHandler: any, ...rest: any[]) {
      try {
        const info = typeof pathOrHandler === 'string' ? pathOrHandler : (pathOrHandler && pathOrHandler.name) || typeof pathOrHandler;
        console.log(`DEBUG ROUTE: app.${m} called with first arg = ${JSON.stringify(info)}`);
        const stack = new Error().stack?.split('\n').slice(2, 8).join('\n') || '';
        console.log('DEBUG ROUTE STACK:\n' + stack);
      } catch (e) {
        console.log(`DEBUG ROUTE: failed to log for app.${m}`, e);
      }
      return orig(pathOrHandler, ...rest);
    };
  }
}

installMountLogging(app);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const candidateImageDirectory = path.join(process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data'), 'candidate-images');
fs.mkdirSync(candidateImageDirectory, { recursive: true });
app.use('/candidate-images', express.static(candidateImageDirectory));
const candidateImageUpload = multer({
  storage: multer.diskStorage({
    destination: candidateImageDirectory,
    filename: (_req, file, callback) => callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
  }),
  fileFilter: (_req, file, callback) => callback(null, ['image/jpeg', 'image/png'].includes(file.mimetype)),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function requireUhubAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Authentication required.' });
  try {
    (req as any).user = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key');
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authentication.' });
  }
}

const stateMarkerAnchors: Record<string, { lat: number; lng: number; radius: number }> = {
  Alabama: { lat: 32.8067, lng: -86.7911, radius: 1.6 }, Alaska: { lat: 61.3707, lng: -152.4044, radius: 5.5 }, Arizona: { lat: 33.7298, lng: -111.4312, radius: 2.0 }, Arkansas: { lat: 34.9697, lng: -92.3731, radius: 1.5 }, California: { lat: 36.1162, lng: -119.6816, radius: 2.8 }, Colorado: { lat: 39.0598, lng: -105.3111, radius: 2.0 }, Connecticut: { lat: 41.5978, lng: -72.7554, radius: 0.5 }, Delaware: { lat: 39.3185, lng: -75.5071, radius: 0.4 }, Florida: { lat: 27.7663, lng: -81.6868, radius: 2.1 }, Georgia: { lat: 33.0406, lng: -83.6431, radius: 1.6 }, Hawaii: { lat: 21.0943, lng: -157.4983, radius: 1.0 }, Idaho: { lat: 44.2405, lng: -114.4788, radius: 2.2 }, Illinois: { lat: 40.3495, lng: -88.9861, radius: 1.5 }, Indiana: { lat: 39.8494, lng: -86.2583, radius: 1.1 }, Iowa: { lat: 42.0115, lng: -93.2105, radius: 1.3 }, Kansas: { lat: 38.5266, lng: -96.7265, radius: 1.6 }, Kentucky: { lat: 37.6681, lng: -84.6701, radius: 1.3 }, Louisiana: { lat: 31.1695, lng: -91.8678, radius: 1.4 }, Maine: { lat: 44.6939, lng: -69.3819, radius: 1.3 }, Maryland: { lat: 39.0639, lng: -76.8021, radius: 0.8 }, Massachusetts: { lat: 42.2302, lng: -71.5301, radius: 0.7 }, Michigan: { lat: 43.3266, lng: -84.5361, radius: 1.7 }, Minnesota: { lat: 45.6945, lng: -93.9002, radius: 1.8 }, Mississippi: { lat: 32.7416, lng: -89.6787, radius: 1.4 }, Missouri: { lat: 38.4561, lng: -92.2884, radius: 1.5 }, Montana: { lat: 46.9219, lng: -110.4544, radius: 2.7 }, Nebraska: { lat: 41.1254, lng: -98.2681, radius: 1.8 }, Nevada: { lat: 38.3135, lng: -117.0554, radius: 2.3 }, 'New Hampshire': { lat: 43.4525, lng: -71.5639, radius: 0.8 }, 'New Jersey': { lat: 40.2989, lng: -74.5210, radius: 0.7 }, 'New Mexico': { lat: 34.8405, lng: -106.2485, radius: 2.0 }, 'New York': { lat: 42.1657, lng: -74.9481, radius: 1.7 }, 'North Carolina': { lat: 35.6301, lng: -79.8064, radius: 1.5 }, 'North Dakota': { lat: 47.5289, lng: -99.7840, radius: 1.8 }, Ohio: { lat: 40.3888, lng: -82.7649, radius: 1.2 }, Oklahoma: { lat: 35.5653, lng: -96.9289, radius: 1.6 }, Oregon: { lat: 44.5720, lng: -122.0709, radius: 2.0 }, Pennsylvania: { lat: 40.5908, lng: -77.2098, radius: 1.2 }, 'Rhode Island': { lat: 41.6809, lng: -71.5118, radius: 0.25 }, 'South Carolina': { lat: 33.8569, lng: -80.9450, radius: 1.1 }, 'South Dakota': { lat: 44.2998, lng: -99.4388, radius: 1.8 }, Tennessee: { lat: 35.7478, lng: -86.6923, radius: 1.4 }, Texas: { lat: 31.0545, lng: -97.5635, radius: 3.0 }, Utah: { lat: 40.1500, lng: -111.8624, radius: 1.7 }, Vermont: { lat: 44.0459, lng: -72.7107, radius: 0.7 }, Virginia: { lat: 37.7693, lng: -78.1700, radius: 1.3 }, Washington: { lat: 47.4009, lng: -121.4905, radius: 1.5 }, 'West Virginia': { lat: 38.4912, lng: -80.9545, radius: 1.0 }, Wisconsin: { lat: 44.2685, lng: -89.6165, radius: 1.4 }, Wyoming: { lat: 42.7560, lng: -107.3025, radius: 2.0 }
};

const countryMarkerAnchors: Record<string, { lat: number; lng: number; radius: number }> = {
  USA: { lat: 39.8283, lng: -98.5795, radius: 8 }, Canada: { lat: 56.1304, lng: -106.3468, radius: 10 }, Mexico: { lat: 23.6345, lng: -102.5528, radius: 5 }
};

function optionalCoordinate(value: unknown) {
  if (value === undefined || value === null || value === '') return null;
  const numericValue = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function resolveCandidatePoint(country: string, state: string, lat: unknown, lng: unknown) {
  const providedLat = optionalCoordinate(lat);
  const providedLng = optionalCoordinate(lng);
  if (providedLat !== null && providedLng !== null) return { lat: providedLat, lng: providedLng };
  const anchor = stateMarkerAnchors[state] || countryMarkerAnchors[country] || { lat: 20, lng: 0, radius: 12 };
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.sqrt(Math.random()) * anchor.radius;
  return { lat: anchor.lat + Math.sin(angle) * distance, lng: anchor.lng + Math.cos(angle) * distance };
}

function resolveOffice(value: unknown) {
  return Array.isArray(value) ? value.join(', ') : String(value || '');
}

/**
 * Normalize a raw BASE_PATH or BASE_URL value so it is always a safe single pathname.
 *
 * - Accepts:
 *   - a path-only value like "/api" or "api" -> returns "/api"
 *   - a full URL like "https://example.com/base/path" -> returns "/base/path"
 * - Ensures:
 *   - result starts with "/"
 *   - no trailing slash (except for root "/")
 *   - rejects values that would still contain a scheme/host or stray ":" characters
 *     and falls back to "/" while logging a warning
 */
function normalizeBasePath(raw?: string) {
  if (!raw) return '/';

  // Trim whitespace
  raw = String(raw).trim();

  // If it looks like a full URL (contains ://) try to parse and use the pathname
  if (raw.includes('://')) {
    try {
      const u = new URL(raw);
      const pathname = u.pathname || '/';
      return sanitizePathname(pathname);
    } catch {
      // If parsing fails, fall through to the fallback below
      console.warn('normalizeBasePath: provided BASE_PATH/BASE_URL looks like a URL but failed to parse, falling back to path-only handling');
    }
  }

  // If raw includes a host-like value without scheme (example: "git.example.com/base"),
  // try to detect and extract the path after first slash. Otherwise treat as path.
  const firstSlash = raw.indexOf('/');
  if (firstSlash > 0 && !raw.startsWith('/')) {
    // Example: "git.example.com/base/path" -> "/base/path"
    const candidate = raw.slice(firstSlash);
    if (candidate) return sanitizePathname(candidate);
  }

  // Otherwise treat as a path-like string (ensure leading slash)
  const candidatePath = raw.startsWith('/') ? raw : '/' + raw;
  return sanitizePathname(candidatePath);
}

function sanitizePathname(pathname: string) {
  // Remove trailing slashes (but keep root "/")
  let p = pathname.replace(/\/+$/g, '');
  if (p === '') p = '/';

  // Defensive checks: path must not contain a scheme or colon that would confuse path-to-regexp
  // (e.g., "https:"). If it does, warn and fallback to "/".
  if (/[A-Za-z0-9.+-]+:\/\//.test(p) || p.includes(':')) {
    console.warn(`normalizeBasePath: sanitized path "${p}" still contains a scheme or colon; falling back to "/"`);
    return '/';
  }

  return p;
}

const BASE_PATH_RAW = process.env.BASE_PATH || process.env.BASE_URL;
const BASE_PATH = normalizeBasePath(BASE_PATH_RAW);

// Informational logs for debugging mount values
console.log(`Using raw BASE_PATH/BASE_URL = "${BASE_PATH_RAW ?? ''}"`);
console.log(`Using normalized BASE_PATH = "${BASE_PATH}"`);

/**
 * Mount API routes under BASE_PATH so app can run behind a reverse-proxy with a path prefix.
 * If no BASE_PATH is set, this is simply '/' and behavior is unchanged.
 */
const router = express.Router();

// ========== PANTRY DATABASE ENDPOINTS (SQLite) ==========

// Get all pantries
router.get('/api/pantries', async (req, res) => {
  try {
    const pantries = await db
      .selectFrom('pantries')
      .selectAll()
      .where('deleted', '=', 0)
      .execute();
    res.json(pantries);
  } catch (error) {
    console.error('Error fetching pantries from SQLite:', error);
    res.status(500).json({ error: 'Failed to fetch pantries' });
  }
});

// Get single pantry by ID
router.get('/api/pantries/:id', async (req, res) => {
  try {
    const pantry = await db
      .selectFrom('pantries')
      .selectAll()
      .where('id', '=', Number(req.params.id))
      .where('deleted', '=', 0)
      .executeTakeFirst();
    if (!pantry) {
      res.status(404).json({ error: 'Pantry not found' });
      return;
    }
    res.json(pantry);
  } catch (error) {
    console.error('Error fetching pantry from SQLite:', error);
    res.status(500).json({ error: 'Failed to fetch pantry' });
  }
});

// Add new pantry
router.post('/api/pantries', async (req, res) => {
  try {
    const { name, address, country, state, notes, lat, lng, hours, type, repeating } = req.body;
    const pantry = await db
      .insertInto('pantries')
      .values({ name, address, country, state, notes, lat, lng, hours, type, repeating, deleted: 0 })
      .returningAll()
      .executeTakeFirstOrThrow();
    res.status(201).json(pantry);
  } catch (error) {
    console.error('Error creating pantry in SQLite:', error);
    res.status(500).json({ error: 'Failed to create pantry' });
  }
});

// Update pantry
router.put('/api/pantries/:id', async (req, res) => {
  try {
    const { name, address, country, state, notes, lat, lng, hours, type, repeating } = req.body;
    await db
      .updateTable('pantries')
      .set({ name, address, country, state, notes, lat, lng, hours, type, repeating })
      .where('id', '=', Number(req.params.id))
      .execute();
    res.json({ message: 'Pantry updated successfully' });
  } catch (error) {
    console.error('Error updating pantry in SQLite:', error);
    res.status(500).json({ error: 'Failed to update pantry' });
  }
});

// Delete pantry
router.delete('/api/pantries/:id', async (req, res) => {
  try {
    await db
      .updateTable('pantries')
      .set({ deleted: 1 })
      .where('id', '=', Number(req.params.id))
      .execute();
    res.json({ message: 'Pantry deleted successfully' });
  } catch (error) {
    console.error('Error deleting pantry from SQLite:', error);
    res.status(500).json({ error: 'Failed to delete pantry' });
  }
});

// ========== POLITICAL DATA ENDPOINTS (SQLite) ==========

router.get('/api/politicians', async (req, res) => {
  try {
    const politicians = await db.selectFrom('politicians').selectAll().execute();
    res.json(politicians);
  } catch (error) {
    console.error('Error fetching politicians from SQLite:', error);
    res.status(500).json({ error: 'Failed to fetch politicians' });
  }
});

// ========== GEOCODING ENDPOINT (unchanged) ==========

router.get('/api/geocode', async (req, res) => {
  const address = req.query.address as string;
  if (!address) {
    res.status(400).json({ message: 'Address is required' });
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const geoResponse = await fetch(url, {
      headers: {
        'User-Agent': 'PantryFinderApp/1.0'
      }
    });
    if (!geoResponse.ok) {
      throw new Error(`Nominatim API failed with status: ${geoResponse.status}`);
    }
    const geoData = await geoResponse.json();

    if (geoData && geoData.length > 0) {
      const { lat, lon } = geoData[0];
      res.json({ lat: parseFloat(lat), lng: parseFloat(lon) });
    } else {
      res.status(404).json({ message: 'Coordinates not found' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Geocoding service failed' });
  }
});

router.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await db.selectFrom('candidates').selectAll().execute();
    res.json(candidates);
  } catch (error) {
    console.error('Failed to get candidates:', error);
    res.status(500).json({ message: 'Failed to retrieve candidates' });
  }
});

router.post('/api/candidates', requireUhubAuth, candidateImageUpload.single('image'), async (req, res) => {
  try {
    const { name, country, state, office, office_type, website, lat, lng, show_on_map } = req.body;
    const resolvedOffice = resolveOffice(office || office_type);
    if (!name?.trim() || !country || !resolvedOffice) {
      return res.status(400).json({ message: 'Name, country, and office are required.' });
    }
    const markerPoint = resolveCandidatePoint(country, state || '', lat, lng);
    const user = (req as any).user;
    const candidate = await db.insertInto('candidates').values({
      name: name.trim(), country, state: state || '', office: resolvedOffice, website: website?.trim() || null,
      lat: markerPoint.lat, lng: markerPoint.lng, party: '', district: null,
      image_url: req.file ? `/pantry-api/candidate-images/${req.file.filename}` : null,
      user_id: user.userId, username: user.username, show_on_map: show_on_map === 'no' ? 0 : 1,
      created_at: new Date().toISOString(),
    }).returningAll().executeTakeFirstOrThrow();
    res.status(201).json(candidate);
  } catch (error) {
    console.error('Failed to create candidate:', error);
    res.status(500).json({ message: 'Failed to create candidate' });
  }
});

router.put('/api/candidates/:id', requireUhubAuth, candidateImageUpload.single('image'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const candidate = await db.selectFrom('candidates').selectAll().where('id', '=', id).executeTakeFirst();
    if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });
    if (candidate.user_id !== (req as any).user.userId) return res.status(403).json({ message: 'You can only edit your own candidate card.' });
    const { name, country, state, office, website, lat, lng, show_on_map } = req.body;
    const nextCountry = country || candidate.country || '';
    const nextState = state ?? candidate.state;
    const providedLat = optionalCoordinate(lat);
    const providedLng = optionalCoordinate(lng);
    if ((providedLat === null) !== (providedLng === null)) {
      return res.status(400).json({ message: 'Latitude and longitude must be provided together.' });
    }
    const regionChanged = nextCountry !== (candidate.country || '') || nextState !== candidate.state;
    const markerPoint = providedLat !== null && providedLng !== null
      ? { lat: providedLat, lng: providedLng }
      : regionChanged
        ? resolveCandidatePoint(nextCountry, nextState, undefined, undefined)
        : { lat: candidate.lat, lng: candidate.lng };
    const updated = await db.updateTable('candidates').set({
      name: name?.trim() || candidate.name, country: nextCountry, state: nextState,
      office: office || candidate.office, website: website?.trim() || null,
      lat: markerPoint.lat,
      lng: markerPoint.lng,
      show_on_map: show_on_map === undefined ? candidate.show_on_map : show_on_map === 'no' ? 0 : 1,
      image_url: req.file ? `/pantry-api/candidate-images/${req.file.filename}` : candidate.image_url,
    }).where('id', '=', id).returningAll().executeTakeFirstOrThrow();
    res.json(updated);
  } catch (error) {
    console.error('Failed to update candidate:', error);
    res.status(500).json({ message: 'Failed to update candidate' });
  }
});

router.delete('/api/candidates/:id', requireUhubAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const candidate = await db.selectFrom('candidates').select(['user_id', 'image_url']).where('id', '=', id).executeTakeFirst();
    if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });
    if (candidate.user_id !== (req as any).user.userId) return res.status(403).json({ message: 'You can only delete your own candidate card.' });
    await db.deleteFrom('candidates').where('id', '=', id).execute();
    if (candidate.image_url) fs.unlink(path.join(candidateImageDirectory, path.basename(candidate.image_url)), () => {});
    res.json({ message: 'Candidate deleted.' });
  } catch (error) {
    console.error('Failed to delete candidate:', error);
    res.status(500).json({ message: 'Failed to delete candidate' });
  }
});

router.get('/api/geocode', async (req, res) => {
  const address = req.query.address as string;
  if (!address) {
    res.status(400).json({ message: 'Address is required' });
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const geoResponse = await fetch(url, {
      headers: {
        'User-Agent': 'PantryFinderApp/1.0'
      }
    });
    if (!geoResponse.ok) {
      throw new Error(`Nominatim API failed with status: ${geoResponse.status}`);
    }
    const geoData = await geoResponse.json();

    if (geoData && geoData.length > 0) {
      const { lat, lon } = geoData[0];
      res.json({ lat: parseFloat(lat), lng: parseFloat(lon) });
    } else {
      res.status(404).json({ message: 'Coordinates not found' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Geocoding service failed' });
  }
});

/**
 * Safe mount helper: tries to mount at a sanitized path and falls back to root on error.
 * Also logs the final mount path so startup reveals where handlers were attached.
 */
function safeMount(appInstance: Express, maybePath: string | undefined, handler: any) {
  const normalized = normalizeBasePath(maybePath);
  try {
    console.log(`Attempting to mount handler at "${normalized}"`);
    appInstance.use(normalized, handler);
    console.log(`Mounted handler at "${normalized}"`);
  } catch (err) {
    console.error(`safeMount: failed to mount handler at "${normalized}", mounting at "/" instead`, err);
    try {
      appInstance.use('/', handler);
      console.log(`Mounted handler at "/" as fallback`);
    } catch (err2) {
      console.error('safeMount: fallback mount at "/" also failed', err2);
      throw err2;
    }
  }
}

// Use safeMount so malformed values cannot crash path-to-regexp at startup
safeMount(app, BASE_PATH_RAW, router);

// Export a function to start the server
export async function startServer(port: number | string = process.env.PORT || 3001) {
  try {
    if (process.env.NODE_ENV === 'production') {
      // static serving will ignore API paths; setupStaticServing expects the app root, it uses __dirname logic
      try {
        setupStaticServing(app);
      } catch (err) {
        console.error('setupStaticServing failed at startup (caught):', err);
        // Continue so server still starts; logs will show the error.
      }
    }

    // Start listening
    const p = typeof port === 'string' ? parseInt(port, 10) : port;
    app.listen(p, () => {
      console.log(`API Server running on port ${p} (base path: ${BASE_PATH})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

console.log('Starting server...');
startServer(process.env.PORT || 4000);
