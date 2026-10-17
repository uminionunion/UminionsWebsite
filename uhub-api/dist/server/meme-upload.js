import busboy from 'busboy';
import { createWriteStream, promises as fs } from 'fs';
import { pipeline } from 'stream/promises';
import os from 'os';
import path from 'path';
import { validateInput } from './input-validation.js';
export const MAX_MEME_FILE_SIZE = 50 * 1024 * 1024 * 1024;
export const MAX_MEME_FILES = 10;
export const MEME_EXTENSIONS = new Set(['.mp4', '.gif', '.jpg', '.jpeg', '.png']);
export async function storeMemeUpload(file, destination) {
    try {
        await fs.rename(file.tempFilePath, destination);
    }
    catch (error) {
        if (!(error instanceof Error) || !('code' in error) || error.code !== 'EXDEV')
            throw error;
        await fs.copyFile(file.tempFilePath, destination);
        await fs.unlink(file.tempFilePath);
    }
}
export function createMediaUpload(options) {
    return async (req, res, next) => {
        if (!req.is('multipart/form-data')) {
            res.status(400).json({ error: 'Send meme media using multipart/form-data' });
            return;
        }
        let directory;
        try {
            directory = await fs.mkdtemp(path.join(os.tmpdir(), 'uhub-meme-'));
        }
        catch (error) {
            console.error('[MEME API] Unable to prepare upload storage:', error);
            res.status(500).json({ error: 'Unable to prepare upload storage' });
            return;
        }
        const streams = new Set();
        const writes = [];
        const files = [];
        let parser;
        let stopped = false;
        let cleaned = false;
        const cleanup = () => {
            if (cleaned)
                return;
            cleaned = true;
            req.off('timeout', onTimeout);
            req.setTimeout(0);
            streams.forEach(stream => stream.destroy());
            void Promise.allSettled(writes).then(() => fs.rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }))
                .catch(error => console.error('[MEME API] Temporary upload cleanup failed:', error));
        };
        const fail = (status, message) => {
            if (stopped)
                return;
            stopped = true;
            if (parser) {
                req.unpipe(parser);
                // Defer destruction until Busboy finishes dispatching its current file/data event.
                queueMicrotask(() => parser?.destroy());
            }
            req.resume();
            if (!res.headersSent && !res.destroyed)
                res.status(status).json({ error: message });
            cleanup();
        };
        const onTimeout = () => fail(408, 'Meme upload stopped receiving data for 60 seconds');
        res.once('finish', cleanup);
        res.once('close', () => {
            if (!res.writableFinished)
                fail(400, 'Meme upload connection closed');
            cleanup();
        });
        req.once('aborted', () => fail(400, 'Meme upload interrupted'));
        if (res.destroyed || req.destroyed) {
            cleanup();
            return;
        }
        req.setTimeout(60000);
        req.on('timeout', onTimeout);
        req.body = Object.create(null);
        try {
            parser = busboy({
                headers: req.headers,
                limits: { files: options.maxFiles, fields: options.fields.length, parts: options.maxFiles + options.fields.length + 1, fieldSize: 65536, fileSize: options.maxSize + 1 },
            });
            parser.on('field', (name, value, info) => {
                if (stopped)
                    return;
                if (!options.fields.includes(name) || req.body[name] !== undefined || info.valueTruncated) {
                    fail(400, 'Invalid or oversized upload field');
                    return;
                }
                req.body[name] = value;
            });
            parser.on('file', (field, stream, info) => {
                if (stopped) {
                    stream.resume();
                    return;
                }
                streams.add(stream);
                if (field !== 'media' || !options.extensions.has(path.extname(info.filename).toLowerCase())) {
                    stream.once('error', error => {
                        if (!stopped)
                            console.error('[MEME API] Rejected media stream failed:', error);
                    });
                    fail(400, `Supported media: ${[...options.extensions].join(', ')} in the media field`);
                    return;
                }
                const file = { name: info.filename, size: 0, tempFilePath: path.join(directory, String(files.length)) };
                files.push(file);
                const output = createWriteStream(file.tempFilePath, { flags: 'wx', mode: 0o600 });
                streams.add(output);
                stream.on('data', chunk => { file.size += chunk.length; });
                stream.once('limit', () => fail(413, `Each media entry must be ${options.maxSize} bytes or smaller`));
                writes.push(pipeline(stream, output).catch(error => {
                    if (stopped)
                        return;
                    console.error('[MEME API] Media storage failed:', error);
                    fail(500, 'Unable to store meme media');
                }));
            });
            parser.once('filesLimit', () => fail(400, `Select at most ${options.maxFiles} media entries`));
            parser.once('fieldsLimit', () => fail(400, 'Too many upload fields'));
            parser.once('partsLimit', () => fail(400, 'Too many upload fields'));
            parser.once('error', error => {
                if (!stopped)
                    console.error('[MEME API] Invalid multipart upload:', error);
                fail(400, 'Unable to receive meme media');
            });
            parser.once('close', async () => {
                await Promise.all(writes);
                if (stopped)
                    return;
                if (!validateInput(req.body)) {
                    fail(400, 'Invalid upload fields');
                    return;
                }
                req.memeUploads = files;
                next();
            });
            req.pipe(parser);
        }
        catch (error) {
            console.error('[MEME API] Multipart upload setup failed:', error);
            fail(400, 'Unable to receive meme media');
        }
    };
}
export const parseMemeUpload = createMediaUpload({
    maxSize: MAX_MEME_FILE_SIZE,
    maxFiles: MAX_MEME_FILES,
    extensions: MEME_EXTENSIONS,
    fields: ['title', 'description'],
});
