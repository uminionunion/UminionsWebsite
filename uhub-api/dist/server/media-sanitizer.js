import sharp from 'sharp';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
sharp.cache({ files: 0 });
export class InvalidMediaError extends Error {
}
export async function sanitizeUploadedMedia(source, extension, imageBytes) {
    const output = path.join(path.dirname(source), `${randomUUID()}${extension}`);
    try {
        if (extension === '.mp4') {
            const input = await fs.open(source, 'r');
            try {
                const header = Buffer.alloc(12);
                await input.read(header, 0, header.length, 0);
                if (header.toString('ascii', 4, 8) !== 'ftyp')
                    throw new InvalidMediaError('The file is not an MP4 container');
            }
            finally {
                await input.close();
            }
            await new Promise((resolve, reject) => {
                const child = spawn(process.env.FFMPEG_PATH || 'ffmpeg', [
                    '-nostdin', '-v', 'error', '-xerror', '-protocol_whitelist', 'file',
                    '-i', source, '-map', '0:v:0', '-map', '0:a?', '-c', 'copy',
                    '-map_metadata', '-1', '-map_chapters', '-1', '-movflags', '+faststart', '-y', output,
                ], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
                let details = '';
                child.stderr.on('data', chunk => { details = (details + chunk.toString()).slice(-4000); });
                child.once('error', reject);
                child.once('close', code => code === 0 ? resolve() : reject(new InvalidMediaError(`Invalid MP4 media: ${details}`)));
            });
        }
        else {
            const format = extension === '.jpg' || extension === '.jpeg' ? 'jpeg' : extension.slice(1);
            const image = sharp(imageBytes || source, { animated: extension === '.gif', failOn: 'warning' });
            try {
                const metadata = await image.metadata();
                if (metadata.format !== format || !metadata.width || !metadata.height) {
                    throw new InvalidMediaError('The file contents do not match the selected image type');
                }
                // Honor EXIF display orientation, then strip metadata without resizing or changing proportions.
                image.autoOrient();
                if (format === 'jpeg')
                    await image.jpeg({ quality: 100, chromaSubsampling: '4:4:4' }).toFile(output);
                else if (format === 'png')
                    await image.png().toFile(output);
                else if (format === 'gif')
                    await image.gif().toFile(output);
                else
                    throw new InvalidMediaError('Unsupported media format');
            }
            finally {
                image.destroy();
            }
        }
        if (!(await fs.stat(output)).size)
            throw new InvalidMediaError('The media is empty');
        return output;
    }
    catch (error) {
        await fs.rm(output, { force: true });
        if (error instanceof InvalidMediaError)
            throw error;
        if (error instanceof Error && 'code' in error && ['ENOENT', 'ENOSPC', 'EACCES'].includes(String(error.code)))
            throw error;
        throw new InvalidMediaError(error instanceof Error ? error.message : 'Invalid media file');
    }
}
