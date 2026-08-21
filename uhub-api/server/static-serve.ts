import path from 'path';
import fs from 'fs';
import express from 'express';
import type { Express } from 'express';
import { fileURLToPath } from 'url';

/**
 * Sets up static file serving for the Express app in production.
 * Tries these locations (in order): dist/public, dist, public, project root.
 * Uses a valid Express wildcard route '*' for SPA fallback and skips API routes.
 */
export function setupStaticServing(app: Express) {
  // ESM-safe __dirname replacement
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const candidates = [
    path.join(process.cwd(), 'dist', 'public'),
    path.join(process.cwd(), 'dist'),
    path.join(process.cwd(), 'public'),
    path.join(__dirname, '..', 'public'),
    process.cwd(),
  ];

  // Find first existing directory
  const publicDir =
    candidates.find((p) => {
      try {
        return fs.statSync(p).isDirectory();
      } catch {
        return false;
      }
    }) || process.cwd();

  // Serve static assets (if folder exists)
  app.use(express.static(publicDir));

  // Serve uploads directory
  app.use('/api/uploads', express.static(path.join(process.cwd(), 'data', 'uploads')));

  // SPA fallback: serve index.html for any unknown GET route except API routes
  app.get('/{*splat}', (req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();

    const indexPath = path.join(publicDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return res.status(404).send('Not Found');
    }

    res.sendFile(indexPath, (err) => {
      if (err) next(err);
    });
  });
}
