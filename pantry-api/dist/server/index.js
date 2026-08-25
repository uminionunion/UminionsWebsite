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
        p2r.parse = function (str, options) {
            try {
                // log up to 2000 chars so we capture long values without flooding logs
                console.log('P2R PARSE INPUT >>>', String(str).slice(0, 2000));
            }
            catch (e) {
                console.log('P2R PARSE INPUT (failed to stringify)', e);
            }
            return origParse.call(this, str, options);
        };
        console.log('P2R parse patched for diagnostic logging');
    }
}
catch (e) {
    console.log('P2R patch failed (module may load later)', e);
}
import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './db.js';
dotenv.config();
const app = express();
/**
 * DIAGNOSTIC: install mount logging to capture every app.use / app.METHOD call
 * and print a short stack so we can identify the caller when a bad mount value
 * is passed to express / path-to-regexp.
 */
function installMountLogging(appInstance) {
    const origUse = appInstance.use.bind(appInstance);
    appInstance.use = function (...args) {
        try {
            const first = args[0];
            const mountInfo = typeof first === 'string' ? first : (first && first.name) || typeof first;
            console.log(`DEBUG MOUNT: app.use called with first arg = ${JSON.stringify(mountInfo)}`);
            const stack = new Error().stack?.split('\n').slice(2, 8).join('\n') || '';
            console.log('DEBUG MOUNT STACK:\n' + stack);
        }
        catch (e) {
            console.log('DEBUG MOUNT: failed to log mount args', e);
        }
        return origUse(...args);
    };
    const methodsToWrap = ['get', 'post', 'put', 'delete', 'patch', 'all'];
    for (const m of methodsToWrap) {
        const orig = appInstance[m].bind(appInstance);
        appInstance[m] = function (pathOrHandler, ...rest) {
            try {
                const info = typeof pathOrHandler === 'string' ? pathOrHandler : (pathOrHandler && pathOrHandler.name) || typeof pathOrHandler;
                console.log(`DEBUG ROUTE: app.${m} called with first arg = ${JSON.stringify(info)}`);
                const stack = new Error().stack?.split('\n').slice(2, 8).join('\n') || '';
                console.log('DEBUG ROUTE STACK:\n' + stack);
            }
            catch (e) {
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
function normalizeBasePath(raw) {
    if (!raw)
        return '/';
    // Trim whitespace
    raw = String(raw).trim();
    // If it looks like a full URL (contains ://) try to parse and use the pathname
    if (raw.includes('://')) {
        try {
            const u = new URL(raw);
            const pathname = u.pathname || '/';
            return sanitizePathname(pathname);
        }
        catch {
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
        if (candidate)
            return sanitizePathname(candidate);
    }
    // Otherwise treat as a path-like string (ensure leading slash)
    const candidatePath = raw.startsWith('/') ? raw : '/' + raw;
    return sanitizePathname(candidatePath);
}
function sanitizePathname(pathname) {
    // Remove trailing slashes (but keep root "/")
    let p = pathname.replace(/\/+$/g, '');
    if (p === '')
        p = '/';
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error deleting pantry from SQLite:', error);
        res.status(500).json({ error: 'Failed to delete pantry' });
    }
});
// ========== POLITICAL DATA ENDPOINTS (SQLite) ==========
router.get('/api/politicians', async (req, res) => {
    try {
        const politicians = await db.selectFrom('politicians').selectAll().execute();
        res.json(politicians);
    }
    catch (error) {
        console.error('Error fetching politicians from SQLite:', error);
        res.status(500).json({ error: 'Failed to fetch politicians' });
    }
});
// ========== GEOCODING ENDPOINT (unchanged) ==========
router.get('/api/geocode', async (req, res) => {
    const address = req.query.address;
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
        }
        else {
            res.status(404).json({ message: 'Coordinates not found' });
        }
    }
    catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ message: 'Geocoding service failed' });
    }
});
router.get('/api/candidates', async (req, res) => {
    try {
        const candidates = await db.selectFrom('candidates').selectAll().execute();
        res.json(candidates);
    }
    catch (error) {
        console.error('Failed to get candidates:', error);
        res.status(500).json({ message: 'Failed to retrieve candidates' });
    }
});
router.get('/api/geocode', async (req, res) => {
    const address = req.query.address;
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
        }
        else {
            res.status(404).json({ message: 'Coordinates not found' });
        }
    }
    catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ message: 'Geocoding service failed' });
    }
});
/**
 * Safe mount helper: tries to mount at a sanitized path and falls back to root on error.
 * Also logs the final mount path so startup reveals where handlers were attached.
 */
function safeMount(appInstance, maybePath, handler) {
    const normalized = normalizeBasePath(maybePath);
    try {
        console.log(`Attempting to mount handler at "${normalized}"`);
        appInstance.use(normalized, handler);
        console.log(`Mounted handler at "${normalized}"`);
    }
    catch (err) {
        console.error(`safeMount: failed to mount handler at "${normalized}", mounting at "/" instead`, err);
        try {
            appInstance.use('/', handler);
            console.log(`Mounted handler at "/" as fallback`);
        }
        catch (err2) {
            console.error('safeMount: fallback mount at "/" also failed', err2);
            throw err2;
        }
    }
}
// Use safeMount so malformed values cannot crash path-to-regexp at startup
safeMount(app, BASE_PATH_RAW, router);
// Export a function to start the server
export async function startServer(port = process.env.PORT || 3001) {
    try {
        if (process.env.NODE_ENV === 'production') {
            // static serving will ignore API paths; setupStaticServing expects the app root, it uses __dirname logic
            try {
                setupStaticServing(app);
            }
            catch (err) {
                console.error('setupStaticServing failed at startup (caught):', err);
                // Continue so server still starts; logs will show the error.
            }
        }
        // Start listening
        const p = typeof port === 'string' ? parseInt(port, 10) : port;
        app.listen(p, () => {
            console.log(`API Server running on port ${p} (base path: ${BASE_PATH})`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
console.log('Starting server...');
startServer(process.env.PORT || 4000);
